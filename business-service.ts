import { prisma } from "@/lib/prisma";

type Range = { start: Date; end: Date };
type CostSummary = { finalAmount?: unknown; totalCost?: unknown };
type RepairSummary = {
  id: string;
  reference?: string;
  createdAt: Date;
  status: string;
  priority?: string;
  phase: string;
  customerId: string;
  customer: { name: string };
  motor: { motorType?: string | null };
  cost?: (CostSummary & { paymentStatus?: string; profit?: unknown }) | null;
};
type CustomerWithRepairs = {
  id: string;
  name: string;
  phone?: string | null;
  updatedAt: Date;
  repairs: Array<{ createdAt: Date; cost?: CostSummary | null }>;
};

function rangeFor(kind: "today" | "week" | "month" | "year"): Range {
  const now = new Date();
  const start = new Date(now);
  if (kind === "today") start.setHours(0, 0, 0, 0);
  if (kind === "week") start.setDate(now.getDate() - 6);
  if (kind === "month") start.setDate(1);
  if (kind === "year") start.setMonth(0, 1);
  if (kind !== "today") start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function number(value: unknown) {
  return Number(value ?? 0);
}

export class BusinessService {
  static async summary() {
    const ranges = {
      today: rangeFor("today"),
      weekly: rangeFor("week"),
      monthly: rangeFor("month"),
      annual: rangeFor("year")
    };

    const entries = await Promise.all(
      Object.entries(ranges).map(async ([key, range]) => {
        const repairs = await prisma.repair.findMany({
          where: { deletedAt: null, createdAt: { gte: range.start, lte: range.end } } as never,
          include: { cost: true } as never
        }) as unknown as RepairSummary[];
        const income = repairs.reduce((sum, repair) => sum + number(repair.cost?.finalAmount), 0);
        const expenses = repairs.reduce((sum, repair) => sum + number(repair.cost?.totalCost), 0);
        return [key, { repairs: repairs.length, income, expenses, profit: income - expenses }];
      })
    );

    return Object.fromEntries(entries) as Record<string, { repairs: number; income: number; expenses: number; profit: number }>;
  }

  static async chartData() {
    const yearStart = rangeFor("year").start;
    const repairs = await prisma.repair.findMany({
      where: { deletedAt: null, createdAt: { gte: yearStart } } as never,
      include: { cost: true, customer: true, motor: true } as never
    }) as unknown as RepairSummary[];
    const months = Array.from({ length: 12 }, (_, index) => ({
      label: new Date(new Date().getFullYear(), index, 1).toLocaleString("en", { month: "short" }),
      income: 0,
      expenses: 0,
      profit: 0,
      repairs: 0
    }));
    const status: Record<string, number> = {};
    const motorTypes: Record<string, number> = {};
    const customers: Record<string, { name: string; total: number; repairs: number }> = {};

    repairs.forEach((repair) => {
      const month = new Date(repair.createdAt).getMonth();
      const income = number(repair.cost?.finalAmount);
      const expenses = number(repair.cost?.totalCost);
      months[month].income += income;
      months[month].expenses += expenses;
      months[month].profit += income - expenses;
      months[month].repairs += 1;
      status[repair.status] = (status[repair.status] ?? 0) + 1;
      const type = repair.motor.motorType ?? repair.phase;
      motorTypes[type] = (motorTypes[type] ?? 0) + 1;
      customers[repair.customerId] ??= { name: repair.customer.name, total: 0, repairs: 0 };
      customers[repair.customerId].total += income;
      customers[repair.customerId].repairs += 1;
    });

    return {
      months,
      status: Object.entries(status).map(([label, value]) => ({ label, value })),
      motorTypes: Object.entries(motorTypes).map(([label, value]) => ({ label, value })),
      topCustomers: Object.values(customers).sort((a, b) => b.total - a.total).slice(0, 8)
    };
  }

  static async reportOverview() {
    const repairs = await prisma.repair.findMany({
      where: { deletedAt: null } as never,
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { cost: true, customer: true, motor: true } as never
    }) as unknown as RepairSummary[];
    const paymentStatus: Record<string, number> = {};
    const priority: Record<string, number> = {};
    const recent = repairs.slice(0, 10).map((repair) => ({
      id: repair.id,
      reference: repair.reference ?? "",
      customer: repair.customer.name,
      motorType: repair.motor.motorType ?? repair.phase,
      status: repair.status,
      priority: repair.priority ?? "NORMAL",
      finalAmount: number(repair.cost?.finalAmount),
      profit: number(repair.cost?.profit),
      createdAt: repair.createdAt
    }));

    repairs.forEach((repair) => {
      const payment = repair.cost?.paymentStatus ?? "UNPAID";
      paymentStatus[payment] = (paymentStatus[payment] ?? 0) + 1;
      const repairPriority = repair.priority ?? "NORMAL";
      priority[repairPriority] = (priority[repairPriority] ?? 0) + 1;
    });

    return {
      paymentStatus: Object.entries(paymentStatus).map(([label, value]) => ({ label, value })),
      priority: Object.entries(priority).map(([label, value]) => ({ label, value })),
      recent
    };
  }

  static async customers() {
    const customers = await prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      include: { repairs: { where: { deletedAt: null } as never, include: { cost: true } as never } } as never
    }) as unknown as CustomerWithRepairs[];
    return customers.map((customer) => ({
      ...customer,
      repairCount: customer.repairs.length,
      totalSpent: customer.repairs.reduce((sum, repair) => sum + number(repair.cost?.finalAmount), 0),
      lastVisit: customer.repairs[0]?.createdAt ?? customer.updatedAt
    }));
  }

  static async customer(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        motors: { include: { repairs: { where: { deletedAt: null } as never, include: { cost: true, photos: true } as never } } } as never,
        repairs: { where: { deletedAt: null } as never, orderBy: { createdAt: "desc" }, include: { cost: true, motor: true, photos: true } as never }
      } as never
    });
  }

  static async motor(id: string) {
    return prisma.motor.findUnique({
      where: { id },
      include: { customer: true, repairs: { where: { deletedAt: null } as never, orderBy: { createdAt: "desc" }, include: { cost: true, photos: true } as never } } as never
    });
  }
}

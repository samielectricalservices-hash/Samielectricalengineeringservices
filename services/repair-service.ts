import { prisma } from "@/lib/prisma";
import type { RepairInput, SearchRepairInput } from "@/features/repairs/schemas/repair-schema";

function nullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function totalCost(input: RepairInput) {
  return input.copperWireCost + input.laborCost + input.bearingCost + input.capacitorCost + input.sparePartsCost + input.transportationCost + input.otherCost;
}

function finalAmount(input: RepairInput) {
  return Math.max(0, input.customerCharge - input.discount);
}

function profit(input: RepairInput) {
  return input.customerCharge - totalCost(input);
}

function dateOrNull(value?: string) {
  return value ? new Date(value) : null;
}

export class RepairService {
  static async generateJobNumber() {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replaceAll("-", "");
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const count = await prisma.repair.count({ where: { createdAt: { gte: start } } });
    return `SEES-${stamp}-${String(count + 1).padStart(4, "0")}`;
  }

  static async dashboard() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [totalMotors, repairsToday, pendingRepairs, completedRepairs, recent] =
      await Promise.all([
        prisma.motor.count(),
        prisma.repair.count({ where: { createdAt: { gte: start }, deletedAt: null } as never }),
        prisma.repair.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_PARTS", "TESTING"] }, deletedAt: null } as never }),
        prisma.repair.count({ where: { status: "COMPLETED", deletedAt: null } as never }),
        prisma.repair.findMany({
          where: { deletedAt: null } as never,
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { customer: true, motor: true, cost: true } as never
        })
      ]);
    return { totalMotors, repairsToday, pendingRepairs, completedRepairs, recent };
  }

  static async search(input: SearchRepairInput) {
    const filters: unknown[] = [{ deletedAt: null }];
    if (input.q) {
      filters.push({
        OR: [
          { reference: { contains: input.q, mode: "insensitive" } },
          { power: { contains: input.q, mode: "insensitive" } },
          { voltage: { contains: input.q, mode: "insensitive" } },
          { rpm: { contains: input.q, mode: "insensitive" } },
          { customer: { name: { contains: input.q, mode: "insensitive" } } },
          { customer: { phone: { contains: input.q, mode: "insensitive" } } },
          { motor: { motorType: { contains: input.q, mode: "insensitive" } } }
        ]
      });
    }
    if (input.customerName) filters.push({ customer: { name: { contains: input.customerName, mode: "insensitive" } } });
    if (input.phoneNumber) filters.push({ customer: { phone: { contains: input.phoneNumber, mode: "insensitive" } } });
    if (input.jobNumber) filters.push({ reference: { contains: input.jobNumber, mode: "insensitive" } });
    if (input.motorType) filters.push({ motor: { motorType: { contains: input.motorType, mode: "insensitive" } } });
    if (input.power) filters.push({ power: { contains: input.power, mode: "insensitive" } });
    if (input.voltage) filters.push({ voltage: { contains: input.voltage, mode: "insensitive" } });
    if (input.rpm) filters.push({ rpm: { contains: input.rpm, mode: "insensitive" } });
    if (input.phase) filters.push({ phase: input.phase });
    if (input.status) filters.push({ status: input.status });
    if (input.date) {
      filters.push({
        createdAt: {
          gte: new Date(`${input.date}T00:00:00`),
          lte: new Date(`${input.date}T23:59:59`)
        }
      });
    }

    const orderBy =
      input.sort === "oldest"
        ? { createdAt: "asc" }
        : input.sort === "customer"
          ? { customer: { name: "asc" } }
          : input.sort === "status"
            ? { status: "asc" }
            : { createdAt: "desc" };
    const where = { AND: filters } as never;
    const [items, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        orderBy: orderBy as never,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: { customer: true, motor: true, cost: true, photos: true } as never
      }),
      prisma.repair.count({ where })
    ]);
    return { items, total, page: input.page, pageSize: input.pageSize, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) };
  }

  static async getById(id: string) {
    return prisma.repair.findFirst({
      where: { id, deletedAt: null } as never,
      include: { customer: true, motor: true, cost: true, photos: true, assignee: true } as never
    });
  }

  static async create(input: RepairInput, userId: string) {
    const reference = input.jobNumber || (await this.generateJobNumber());
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: { name: input.customerName, phone: input.phoneNumber, address: nullable(input.address) }
      });
      const motor = await tx.motor.create({
        data: {
          customerId: customer.id,
          serialNumber: reference,
          manufacturer: nullable(input.manufacturer),
          model: nullable(input.motorCategory || input.motorType),
          powerRating: nullable(input.power),
          voltage: nullable(input.voltage),
          rpm: nullable(input.rpm),
          phase: input.phase,
          motorType: nullable(input.motorType || input.motorCategory),
          frameSize: nullable(input.frameSize),
          mountingType: nullable(input.mountingType),
          status: "IN_REPAIR"
        } as never
      });
      return tx.repair.create({
        data: {
          motorId: motor.id,
          customerId: customer.id,
          assignedTo: userId,
          reference,
          title: `${input.phase.replace("_", " ")} motor repair`,
          description: nullable(input.additionalNotes),
          status: input.status,
          priority: input.priority,
          phase: input.phase,
          power: nullable(input.power),
          voltage: nullable(input.voltage),
          rpm: nullable(input.rpm),
          numberOfSlots: nullable(input.numberOfSlots),
          startingWireSize: nullable(input.startingWireSize),
          runningWireSize: nullable(input.runningWireSize),
          wireSize: nullable(input.wireSize),
          startingCoilPitch: nullable(input.startingCoilPitch),
          runningCoilPitch: nullable(input.runningCoilPitch),
          coilPitch: nullable(input.coilPitch),
          startingTurns: nullable(input.startingTurns),
          runningTurns: nullable(input.runningTurns),
          numberOfTurns: nullable(input.numberOfTurns),
          inspection: input.inspection,
          customFields: input.customFields,
          additionalNotes: nullable(input.additionalNotes),
          repairNotes: nullable(input.repairNotes),
          internalNotes: nullable(input.internalNotes),
          startDate: dateOrNull(input.startDate),
          expectedCompletionDate: dateOrNull(input.expectedCompletionDate),
          deliveryDate: dateOrNull(input.deliveryDate),
          cost: { create: financeData(input) },
          photos: { create: input.photos.map((p) => ({ uploadedBy: userId, url: p.url, caption: p.caption, contentType: p.contentType, sizeBytes: p.sizeBytes })) }
        } as never
      });
    });
  }

  static async update(id: string, input: RepairInput) {
    return prisma.repair.update({
      where: { id },
      data: {
        status: input.status,
        priority: input.priority,
        phase: input.phase,
        power: nullable(input.power),
        voltage: nullable(input.voltage),
        rpm: nullable(input.rpm),
        numberOfSlots: nullable(input.numberOfSlots),
        startingWireSize: nullable(input.startingWireSize),
        runningWireSize: nullable(input.runningWireSize),
        wireSize: nullable(input.wireSize),
        startingCoilPitch: nullable(input.startingCoilPitch),
        runningCoilPitch: nullable(input.runningCoilPitch),
        coilPitch: nullable(input.coilPitch),
        startingTurns: nullable(input.startingTurns),
        runningTurns: nullable(input.runningTurns),
        numberOfTurns: nullable(input.numberOfTurns),
        inspection: input.inspection,
        customFields: input.customFields,
        additionalNotes: nullable(input.additionalNotes),
        repairNotes: nullable(input.repairNotes),
        internalNotes: nullable(input.internalNotes),
        startDate: dateOrNull(input.startDate),
        expectedCompletionDate: dateOrNull(input.expectedCompletionDate),
        deliveryDate: dateOrNull(input.deliveryDate),
        description: nullable(input.additionalNotes),
        customer: { update: { name: input.customerName, phone: input.phoneNumber, address: nullable(input.address) } },
        motor: { update: { manufacturer: nullable(input.manufacturer), model: nullable(input.motorCategory || input.motorType), powerRating: nullable(input.power), voltage: nullable(input.voltage), rpm: nullable(input.rpm), phase: input.phase, motorType: nullable(input.motorType || input.motorCategory), frameSize: nullable(input.frameSize), mountingType: nullable(input.mountingType) } as never },
        cost: { upsert: { create: financeData(input), update: financeData(input) } }
      } as never
    });
  }

  static async softDelete(id: string) {
    return prisma.repair.update({ where: { id }, data: { deletedAt: new Date(), status: "CANCELLED" } as never });
  }
}

function financeData(input: RepairInput) {
  return {
    copperWireCost: input.copperWireCost,
    laborCost: input.laborCost,
    bearingCost: input.bearingCost,
    capacitorCost: input.capacitorCost,
    sparePartsCost: input.sparePartsCost,
    transportationCost: input.transportationCost,
    otherCost: input.otherCost,
    totalCost: totalCost(input),
    customerCharge: input.customerCharge,
    discount: input.discount,
    finalAmount: finalAmount(input),
    profit: profit(input),
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod ?? null
  };
}

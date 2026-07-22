export const runtime = "nodejs";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const uploadDir = path.join(process.env.TEMP ?? "/tmp", "msms-uploads");

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image was uploaded." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });

  await mkdir(uploadDir, { recursive: true });
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({
    url: `/api/uploads/${name}`,
    contentType: file.type,
    sizeBytes: file.size,
    caption: file.name
  });
}

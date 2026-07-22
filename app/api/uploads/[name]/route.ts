export const runtime = "nodejs";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

const uploadDir = path.join(process.env.TEMP ?? "/tmp", "msms-uploads");
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function getContentType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_: Request, context: { params: Promise<{ name: string }> }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await context.params;
  const safeName = path.basename(name);
  const extension = safeName.split(".").pop()?.toLowerCase();

  if (!safeName || !allowedExtensions.has(extension ?? "")) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const filePath = path.join(uploadDir, safeName);

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(safeName),
        "Cache-Control": "private, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}

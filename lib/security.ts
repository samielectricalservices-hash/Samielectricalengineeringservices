import { headers } from "next/headers";
import { securityHeaders } from "@/lib/http-security-headers";

export async function getRequestMetadata() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  return {
    ipAddress: forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null,
    userAgent: headerStore.get("user-agent") ?? null
  };
}

export { securityHeaders };

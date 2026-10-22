// Forwards the browser's /api calls to the Express API, so the staff session cookie is
// first-party to the console origin and the browser needs no CORS (ADR 0012, ADR 0013). The
// API's address is read at runtime, so one image runs in any environment. Next.js never handles
// the data itself (ADR 0004).
import type { NextRequest } from "next/server";
import { apiUrl } from "@/lib/api-url";

export const dynamic = "force-dynamic";

// Hop-by-hop headers, and ones fetch recomputes, must not be copied across the proxy.
const DROP_REQUEST = ["host", "connection", "content-length", "keep-alive", "transfer-encoding"];
const DROP_RESPONSE = ["content-encoding", "content-length", "connection", "transfer-encoding"];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(`/api/${path.map(encodeURIComponent).join("/")}`, apiUrl());
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const name of DROP_REQUEST) headers.delete(name);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Streams the request body through; required by fetch when the body is a stream.
    ...(hasBody ? { duplex: "half" } : {}),
    redirect: "manual",
    cache: "no-store",
  } as RequestInit);

  const responseHeaders = new Headers(response.headers);
  for (const name of DROP_RESPONSE) responseHeaders.delete(name);
  return new Response(response.body, { status: response.status, headers: responseHeaders });
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT };

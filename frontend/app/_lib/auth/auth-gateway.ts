import { getApiUrl } from "./api-url";
import { AUTH_API_PATH } from "../api/api-paths";

const allowedEndpoints = new Set(["login", "register", "me", "logout"]);

function gatewayError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

function makeSessionCookieFirstParty(cookie: string): string {
  if (/SameSite=/i.test(cookie)) {
    return cookie.replace(/SameSite=[^;]+/i, "SameSite=Lax");
  }
  return `${cookie}; SameSite=Lax`;
}

export async function proxyAuthRequest(
  request: Request,
  endpoint: string,
): Promise<Response> {
  if (!allowedEndpoints.has(endpoint)) {
    return gatewayError(404, "NOT_FOUND", "Route not found");
  }

  const headers = new Headers({ accept: "application/json" });
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const upstream = await fetch(`${getApiUrl()}${AUTH_API_PATH}/${endpoint}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const responseHeaders = new Headers({
      "cache-control": "no-store",
    });
    const upstreamContentType = upstream.headers.get("content-type");
    const sessionCookie = upstream.headers.get("set-cookie");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
    if (sessionCookie) {
      responseHeaders.set("set-cookie", makeSessionCookieFirstParty(sessionCookie));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return gatewayError(502, "API_UNAVAILABLE", "The authentication service is unavailable");
  }
}

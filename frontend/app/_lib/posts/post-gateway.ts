import { getApiUrl } from "../auth/api-url";
import { POSTS_API_PATH } from "../api/api-paths";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isAllowedRequest(method: string, path: string[]) {
  if (path.length === 0) return method === "GET" || method === "POST";
  if (path.length === 1 && uuidPattern.test(path[0])) {
    return method === "PATCH" || method === "DELETE";
  }
  if (path.length === 2 && uuidPattern.test(path[0]) && path[1] === "likes") {
    return method === "GET" || method === "POST" || method === "DELETE";
  }
  return false;
}

export async function proxyPostRequest(
  request: Request,
  path: string[],
): Promise<Response> {
  if (!isAllowedRequest(request.method, path)) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Route not found" } },
      { status: 404 },
    );
  }

  const headers = new Headers({ accept: "application/json" });
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  const suffix = path.length ? `/${path.join("/")}` : "";
  const search = new URL(request.url).search;
  const hasBody = request.method === "POST" || request.method === "PATCH";

  try {
    const upstream = await fetch(`${getApiUrl()}${POSTS_API_PATH}${suffix}${search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const responseHeaders = new Headers({ "cache-control": "no-store" });
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { error: { code: "API_UNAVAILABLE", message: "The post service is unavailable" } },
      { status: 502 },
    );
  }
}

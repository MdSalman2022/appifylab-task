import { getApiUrl } from "../auth/api-url";

export const uuidPathSegmentPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function notFoundResponse() {
  return Response.json(
    { error: { code: "NOT_FOUND", message: "Route not found" } },
    { status: 404 },
  );
}

export async function proxyJsonApiRequest(
  request: Request,
  upstreamPath: string,
  unavailableMessage: string,
): Promise<Response> {
  const headers = new Headers({ accept: "application/json" });
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    const upstream = await fetch(
      `${getApiUrl()}${upstreamPath}${new URL(request.url).search}`,
      {
        method: request.method,
        headers,
        body: hasBody ? await request.arrayBuffer() : undefined,
        cache: "no-store",
      },
    );
    const responseHeaders = new Headers({ "cache-control": "no-store" });
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) {
      responseHeaders.set("content-type", upstreamContentType);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { error: { code: "API_UNAVAILABLE", message: unavailableMessage } },
      { status: 502 },
    );
  }
}

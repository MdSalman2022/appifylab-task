import { proxyPostRequest } from "../../../_lib/posts/post-gateway";

type PostRouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handle(request: Request, context: PostRouteContext) {
  const { path = [] } = await context.params;
  return proxyPostRequest(request, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;

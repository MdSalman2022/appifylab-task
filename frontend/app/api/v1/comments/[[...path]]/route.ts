import { proxyCommentRequest } from "../../../../_lib/comments/comment-gateway";

type CommentRouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handle(request: Request, context: CommentRouteContext) {
  const { path = [] } = await context.params;
  return proxyCommentRequest(request, path);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

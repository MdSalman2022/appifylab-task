import { proxyUploadRequest } from "../../../../_lib/uploads/upload-gateway";

type UploadRouteContext = {
  params: Promise<{ path?: string[] }>;
};

export async function POST(request: Request, context: UploadRouteContext) {
  const { path = [] } = await context.params;
  return proxyUploadRequest(request, path);
}

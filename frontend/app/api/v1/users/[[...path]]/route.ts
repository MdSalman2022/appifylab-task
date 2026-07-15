import { proxyUserRequest } from "../../../../_lib/users/user-gateway";

type UserRouteContext = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(request: Request, context: UserRouteContext) {
  const { path = [] } = await context.params;
  return proxyUserRequest(request, path);
}

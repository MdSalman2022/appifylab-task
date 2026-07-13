import { proxyAuthRequest } from "../../../_lib/auth/auth-gateway";

type AuthRouteContext = {
  params: Promise<{ endpoint: string }>;
};

async function handle(request: Request, context: AuthRouteContext) {
  const { endpoint } = await context.params;
  return proxyAuthRequest(request, endpoint);
}

export const GET = handle;
export const POST = handle;

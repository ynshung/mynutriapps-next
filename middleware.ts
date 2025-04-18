import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "./config";
import { unauthorized } from "next/navigation";

// https://hackernoon.com/using-firebase-authentication-with-the-latest-nextjs-features
export async function middleware(request: NextRequest) {

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({decodedToken}, headers) => {
      // TODO - Integrate with backend database to retrieve list of admin users
      if (request.nextUrl.pathname !== "/" && decodedToken.email !== "admin@ynshung.com") {
        return unauthorized();
      }

      return NextResponse.next({
        request: {
          headers
        }
      })
    },
    handleInvalidToken: async () => {
      if (request.nextUrl.pathname !== "/") {
        return redirectToHome(request);
      } else {
        return NextResponse.next();
      } 
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', {error});      
      if (request.nextUrl.pathname !== "/") return redirectToHome(request);
      return NextResponse.next();
    }
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};

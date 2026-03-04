import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/iniciar-sesion(.*)",
  "/registrarse(.*)",
  "/",
  "/api/clerkWebhook",
  "/api/uploadThing",
  "/api/subscriptions(.*)",
  "/anuncios(.*)",
  "/favicon.ico",
  "/privacidad(.*)",
  "/crear",
  "/novedades",
]);

const isPrivateRoute = createRouteMatcher(["/novedades/admin(.*)"]);

export default clerkMiddleware((auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = auth();

  // Explicitly check private routes first (before public route fallback)
  if (!userId && isPrivateRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // For /novedades/:id — allow public access (any path under /novedades that is NOT /admin)
  if (
    !userId &&
    req.nextUrl.pathname.startsWith("/novedades/") &&
    !req.nextUrl.pathname.startsWith("/novedades/admin")
  ) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboarding route to complete onboarding
  if (
    userId &&
    !sessionClaims?.metadata?.onboardingComplete &&
    !req.nextUrl.pathname.includes("/onboarding")
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) {
    return NextResponse.next();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/novedades/admin(.*)",
    "/grupos(.*)",
    "/perfiles(.*)",
    "/pizarras(.*)",
    "/revistas(.*)",
    "/suscribirse(.*)",
    "/suscripcion(.*)",
    "/packs-publicaciones(.*)",
    "/crear(.*)",
    "/editar(.*)",
  ],
};

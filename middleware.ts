import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ['/'],
});
// Config obtained from Clerk's Next.js SDK documentation:
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
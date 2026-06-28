import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Root route page component fallback redirect:
 * - Reads cookieStore to verify token status.
 * - Redirects authenticated requests directly to "/hosted-zones".
 * - Redirects unauthenticated requests to "/login".
 */
export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("route53_jwt_token")?.value;

  if (token) {
    redirect("/hosted-zones");
  } else {
    redirect("/login");
  }
}

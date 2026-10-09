import AuthForm from "@/components/auth/AuthForm";
import { signIn } from "@/lib/auth-actions";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next;

  return <AuthForm type="login" action={signIn} nextPath={next} />;
}

import AuthForm from "@/components/auth/AuthForm";
import { signUp } from "@/lib/auth-actions";

export default function SignupPage() {
  return <AuthForm type="signup" action={signUp} />;
}

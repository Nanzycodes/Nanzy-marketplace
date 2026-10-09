import AuthForm from "@/components/auth/AuthForm";
import { forgotPassword } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  return <AuthForm type="forgot" action={forgotPassword} />;
}

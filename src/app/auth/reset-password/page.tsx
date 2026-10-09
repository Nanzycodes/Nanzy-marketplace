import AuthForm from "@/components/auth/AuthForm";
import { resetPassword } from "@/lib/auth-actions";

export default function ResetPasswordPage() {
  return <AuthForm type="reset" action={resetPassword} />;
}

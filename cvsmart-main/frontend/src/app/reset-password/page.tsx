import ResetPasswordForm from "@/components/auth/reset-password";
import AuthLayout from "@/components/auth/auth-layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset your password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}

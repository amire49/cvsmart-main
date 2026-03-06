import ResetPasswordForm from "@/components/auth/reset-password";
import AuthLayout from "@/components/auth/auth-layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link">
      <ResetPasswordForm />
    </AuthLayout>
  );
}

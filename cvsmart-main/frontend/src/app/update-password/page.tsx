import UpdatePasswordForm from "@/components/auth/update-password-form";
import AuthLayout from "@/components/auth/auth-layout";

export default function UpdatePasswordPage() {
  return (
    <AuthLayout title="Update your password">
      <UpdatePasswordForm />
    </AuthLayout>
  );
}

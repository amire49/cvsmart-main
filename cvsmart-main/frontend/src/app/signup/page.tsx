import SignupForm from "@/components/auth/signup-form";
import AuthLayout from "@/components/auth/auth-layout";

export default function SignupPage() {
  return (
    <AuthLayout title="Create an account" subtitle="Enter your details to get started">
      <SignupForm />
    </AuthLayout>
  );
}

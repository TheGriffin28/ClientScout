import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyEmailOTPForm from "../../components/auth/VerifyEmailOTPForm";

export default function VerifyEmailOTP() {
  return (
    <>
      <PageMeta
        title="Verify Email | ClientScout"
        description="Verify your email with OTP for ClientScout"
      />
      <AuthLayout>
        <VerifyEmailOTPForm />
      </AuthLayout>
    </>
  );
}


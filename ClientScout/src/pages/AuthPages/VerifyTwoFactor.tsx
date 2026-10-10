import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyTwoFactorForm from "../../components/auth/VerifyTwoFactorForm";

export default function VerifyTwoFactor() {
  return (
    <>
      <PageMeta
        title="Two-Factor Authentication | ClientScout"
        description="Complete sign-in with two-factor authentication for ClientScout"
      />
      <AuthLayout>
        <VerifyTwoFactorForm />
      </AuthLayout>
    </>
  );
}


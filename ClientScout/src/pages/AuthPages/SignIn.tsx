import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  console.log("Rendering SignIn page");
  return (
    <>
      <PageMeta
        title="ClientScout"
        description="ClientScout"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}

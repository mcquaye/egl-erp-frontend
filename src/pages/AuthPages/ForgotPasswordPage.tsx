import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import PasswordResetForm from "../../components/auth/PasswordResetForm";

export default function ForgotPasswordPage() {
	return (
		<>
			<PageMeta title='Reset Password | ERP Admin' description='' />
			<AuthLayout>
				<PasswordResetForm />
			</AuthLayout>
		</>
	);
}

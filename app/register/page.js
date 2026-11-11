import AuthForm from "../components/AuthForm";
import { PageShell } from "../components/SiteChrome";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return <PageShell><section className="auth-page"><AuthForm mode="register" /></section></PageShell>;
}

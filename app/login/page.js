import AuthForm from "../components/AuthForm";
import { PageShell } from "../components/SiteChrome";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <PageShell><section className="auth-page"><AuthForm mode="login" /></section></PageShell>;
}

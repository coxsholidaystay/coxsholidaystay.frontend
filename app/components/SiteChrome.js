import Link from "next/link";
import SiteHeader from "./SiteHeader";

export { SiteHeader };

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" href="/" aria-label="Cox's Holiday Stay home">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span className="brand-name">
          COX&apos;S <span>HOLIDAY STAY</span>
        </span>
      </Link>
      <p>Make room for somewhere wonderful.</p>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/rooms">Rooms</Link>
        <Link href="/tours">Tours</Link>
        <Link href="/blog">Journal</Link>
        <Link href="/register">Join us</Link>
      </nav>
      <span className="footer-copyright">
        © {new Date().getFullYear()} Cox&apos;s Holiday Stay
      </span>
    </footer>
  );
}

export function PageShell({ children }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

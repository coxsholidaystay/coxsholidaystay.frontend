import Link from "next/link";

const navigation = [
  { href: "/#stays", label: "Find a stay" },
  { href: "/rooms", label: "Rooms" },
  { href: "/tours", label: "Tour packages" },
  { href: "/blog", label: "Journal" }
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cox's Holiday Stay home">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span className="brand-name">
          COX&apos;S <span>HOLIDAY STAY</span>
        </span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <div className="site-account-nav">
        <Link href="/login">Sign in</Link>
        <Link className="site-account-register" href="/register">Create account</Link>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cox's Holiday Stay home">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span className="brand-name">
          COX&apos;S <span>HOLIDAY STAY</span>
        </span>
      </Link>
      <nav
        className={`main-nav${menuOpen ? " is-open" : ""}`}
        id="main-navigation"
        aria-label="Main navigation"
        onClick={() => setMenuOpen(false)}
      >
        <Link href="/#stays">Find a stay</Link>
        <Link href="/rooms">Rooms</Link>
        <Link href="/tours">Tour packages</Link>
        <Link href="/blog">Journal</Link>
      </nav>
      <Link className="header-link" href="/login">
        Sign in <span aria-hidden="true">↗</span>
      </Link>
      <button
        className={`menu-toggle${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

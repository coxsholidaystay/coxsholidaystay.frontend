import Link from "next/link";
import { SiteFooter, SiteHeader } from "./SiteChrome";

export default function RecoveryPage({
  code,
  eyebrow,
  title,
  description,
  onRetry,
  retryLabel = "Try again"
}) {
  return (
    <>
      <SiteHeader />
      <main className="recovery-page">
        <section className="recovery-card" aria-labelledby="recovery-title">
          <div className="recovery-mark" aria-hidden="true">C</div>
          <p className="eyebrow">{eyebrow}</p>
          <span className="recovery-code">{code}</span>
          <h1 id="recovery-title">{title}</h1>
          <p className="recovery-description">{description}</p>
          <div className="recovery-actions">
            {onRetry && (
              <button className="search-button recovery-primary" type="button" onClick={onRetry}>
                {retryLabel} <span aria-hidden="true">↻</span>
              </button>
            )}
            <Link className={onRetry ? "recovery-secondary" : "search-button recovery-primary"} href="/">
              Back to the homepage {!onRetry && <span aria-hidden="true">↗</span>}
            </Link>
          </div>
          <p className="recovery-help">
            You can keep exploring while we take care of the little hiccup.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import "./globals.css";
import { useEffect } from "react";
import RecoveryPage from "./components/RecoveryPage";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application rendering failed:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <RecoveryPage
          code="A LITTLE PAUSE"
          eyebrow="WE’RE ON IT"
          title="This stay is taking a moment."
          description="Something unexpected got in the way. Your plans are safe—try once more, or head back to exploring."
          onRetry={reset}
          retryLabel="Try again"
        />
      </body>
    </html>
  );
}

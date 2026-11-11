"use client";

import { useEffect } from "react";
import RecoveryPage from "./components/RecoveryPage";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("Page rendering failed:", error);
  }, [error]);

  return (
    <RecoveryPage
      code="A LITTLE PAUSE"
      eyebrow="WE’RE ON IT"
      title="This stay is taking a moment."
      description="Something unexpected got in the way. Your plans are safe—try once more, or head back to exploring."
      onRetry={reset}
      retryLabel="Try again"
    />
  );
}

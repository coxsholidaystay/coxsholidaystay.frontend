"use client";

import { useEffect } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HealthPing() {
  useEffect(() => {
    let active = true;

    async function pingApi() {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${apiBase}/api/health`, {
          cache: "no-store",
          credentials: "omit",
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Scheduled frontend health check received HTTP ${response.status}.`);
        }
        const health = await response.json();
        if (health.status !== "ok") {
          throw new Error("Scheduled frontend health check reports a degraded API.");
        }
      } catch (error) {
        if (active) console.error("Scheduled frontend health request failed:", error);
      } finally {
        window.clearTimeout(timeout);
      }
    }

    const interval = window.setInterval(pingApi, 120_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}

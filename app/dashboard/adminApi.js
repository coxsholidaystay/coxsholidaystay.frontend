"use client";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function adminRequest(path, options = {}) {
  const response = await fetch(`${apiBase}/api/admin${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The management request could not be completed.");
  return data;
}

export function getAdminErrorMessage(error) {
  return error.message === "Failed to fetch"
    ? "The management API is unavailable. Check that the server is running."
    : error.message;
}

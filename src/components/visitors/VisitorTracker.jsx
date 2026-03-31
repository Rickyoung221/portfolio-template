"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    fetch("/api/visitors", {
      method: "POST",
      headers: { Accept: "application/json" },
    }).catch(() => {});
  }, []);

  return null;
}

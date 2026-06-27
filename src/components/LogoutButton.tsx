"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="w-full rounded-xl border border-border py-2.5 text-sm text-muted"
      onClick={async () => {
        await fetch("/api/login", { method: "DELETE" });
        router.replace("/login");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}

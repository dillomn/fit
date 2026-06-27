"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Today", icon: TodayIcon },
  { href: "/workouts", label: "Workouts", icon: DumbbellIcon },
  { href: "/progress", label: "Progress", icon: ChartIcon },
  { href: "/weight", label: "Weight", icon: ScaleIcon },
  { href: "/nutrition", label: "Food", icon: AppleIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-xl items-stretch justify-between px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <Icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

type IconProps = { className?: string };

function TodayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function DumbbellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1" />
      <path d="M18 22l4-4M2 6l4-4M7 17L4 20M20 7l-3-3" />
    </svg>
  );
}
function ChartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 2 5-7" />
    </svg>
  );
}
function ScaleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 7a4 4 0 00-3.5 6h7A4 4 0 0012 7z" />
    </svg>
  );
}
function AppleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 7c1-3 3-4 5-4 0 2-1 4-3 4M12 7c-1.5-2-4-2.5-5.5-1C4 7.5 4 11 6 15c1 2 2 4 3.5 4 1 0 1.5-.6 2.5-.6s1.5.6 2.5.6c1.5 0 2.5-2 3.5-4" />
    </svg>
  );
}

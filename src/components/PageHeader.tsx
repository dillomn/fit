import Link from "next/link";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost shrink-0 text-sm">
          {action.label}
        </Link>
      )}
    </header>
  );
}

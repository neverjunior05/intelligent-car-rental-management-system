import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  children?: ReactNode;
}

export default function EmptyState({
  icon = "📋",
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  children,
}: EmptyStateProps) {
  return (
    <div className="card rounded-3xl border border-app border-dashed p-10 sm:p-14 text-center animate-fade-in flex flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-3xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-app">{title}</h3>
      <p className="mt-1 text-xs text-soft max-w-sm leading-relaxed">{description}</p>

      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <Link href={actionHref} className="btn-primary px-5 py-2 text-xs font-bold inline-block">
              {actionText}
            </Link>
          ) : onActionClick ? (
            <button onClick={onActionClick} className="btn-primary px-5 py-2 text-xs font-bold">
              {actionText}
            </button>
          ) : null}
        </div>
      )}

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

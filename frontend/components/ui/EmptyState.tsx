import Link from "next/link";
import type { ReactNode } from "react";

// Shared "empty state" block (icon + heading + message + optional CTA).
// Previously duplicated across the cart, wishlist, and orders pages with
// only the icon/text/link changing each time.
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({ icon, title, message, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

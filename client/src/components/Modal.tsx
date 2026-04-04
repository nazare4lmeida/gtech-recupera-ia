import React from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-card border border-border bg-surface p-6 shadow-card-lg animate-scale-in">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted transition hover:text-blue"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

const DESIGN: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-navy/8 text-navy border-navy/15" },
  PENDING: { label: "In review", className: "bg-accent/10 text-accent border-accent/25" },
  APPROVED: { label: "Live", className: "bg-[#1f7a4d]/10 text-[#17603c] border-[#1f7a4d]/25" },
  REJECTED: { label: "Needs changes", className: "bg-brown/10 text-brown-700 border-brown/25" },
};

const ORDER: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "Awaiting payment", className: "bg-navy/8 text-navy border-navy/15" },
  PAID: { label: "Paid", className: "bg-accent/10 text-accent border-accent/25" },
  IN_PRODUCTION: { label: "Printing", className: "bg-accent/10 text-accent border-accent/25" },
  SHIPPED: { label: "Shipped", className: "bg-[#1f7a4d]/10 text-[#17603c] border-[#1f7a4d]/25" },
  DELIVERED: { label: "Delivered", className: "bg-[#1f7a4d]/10 text-[#17603c] border-[#1f7a4d]/25" },
  CANCELLED: { label: "Cancelled", className: "bg-brown/10 text-brown-700 border-brown/25" },
};

export function StatusBadge({ status, kind = "design", className }: { status: string; kind?: "design" | "order"; className?: string }) {
  const s = (kind === "design" ? DESIGN : ORDER)[status] ?? { label: status, className: "bg-navy/8 text-navy border-navy/15" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", s.className, className)}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

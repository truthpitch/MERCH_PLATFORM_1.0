import type { Metadata } from "next";
import Link from "next/link";
import { RoleToggle } from "@/components/admin/AdminControls";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
      _count: { select: { designs: true, orders: true } },
      designs: { where: { status: "APPROVED" }, select: { id: true } },
    },
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-navy/10 bg-white">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <caption className="sr-only">All user accounts</caption>
        <thead className="border-b border-navy/10 bg-paper">
          <tr>
            {["User", "Email", "Sign-in", "Designs", "Orders", "Joined", "Role"].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                <p className="font-semibold">{u.name ?? "—"}</p>
                {u.username && u.role !== "ADMIN" ? (
                  <Link href={`/creators/${u.username}`} className="text-xs text-accent hover:underline">
                    @{u.username}
                  </Link>
                ) : (
                  <p className="text-xs text-muted">{u.username ? `@${u.username}` : ""}</p>
                )}
              </td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3 text-xs text-muted">
                {[u.passwordHash ? "Password" : null, ...u.accounts.map((a) => a.provider[0].toUpperCase() + a.provider.slice(1))].filter(Boolean).join(" + ") || "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {u._count.designs} <span className="text-xs text-muted">({u.designs.length} live)</span>
              </td>
              <td className="px-4 py-3 tabular-nums">{u._count.orders}</td>
              <td className="px-4 py-3 text-muted">{u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={u.role === "ADMIN" ? "font-semibold text-brown" : "text-muted"}>{u.role === "ADMIN" ? "Admin" : "User"}</span>
                  <RoleToggle userId={u.id} role={u.role} self={u.id === me.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

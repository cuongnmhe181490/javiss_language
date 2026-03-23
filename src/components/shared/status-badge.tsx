import { Badge } from "@/components/ui/badge";
import { vi } from "@/i18n/dictionaries/vi";

const classMap: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  approved:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  verification_sent:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  blocked: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export function StatusBadge({ status }: { status: keyof typeof vi.userStatus }) {
  return <Badge className={classMap[status]}>{vi.userStatus[status]}</Badge>;
}

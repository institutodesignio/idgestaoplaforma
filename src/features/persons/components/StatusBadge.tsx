import { Badge } from "@/components/ui/badge";
import { PERSON_STATUS_LABEL, type PersonStatus } from "../types";

export function StatusBadge({ status }: { status: PersonStatus | string | null }) {
  const key = (status ?? "") as PersonStatus;
  const label = PERSON_STATUS_LABEL[key] ?? "—";
  return (
    <Badge
      variant={key === "ACTIVE" ? "default" : key === "INACTIVE" ? "secondary" : "outline"}
      className="font-medium"
    >
      {label}
    </Badge>
  );
}

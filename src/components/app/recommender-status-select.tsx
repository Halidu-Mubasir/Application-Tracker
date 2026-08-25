"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRecommenderStatus } from "@/lib/actions/recommenders";
import { RECOMMENDER_STATUSES, RECOMMENDER_STATUS_LABEL } from "@/lib/constants";
import type { RecommenderStatus } from "@prisma/client";

export function RecommenderStatusSelect({
  applicationId,
  recommenderId,
  status,
}: {
  applicationId: string;
  recommenderId: string;
  status: RecommenderStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        const formData = new FormData();
        formData.set("status", value);
        startTransition(() => {
          updateRecommenderStatus(applicationId, recommenderId, formData);
        });
      }}
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RECOMMENDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {RECOMMENDER_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

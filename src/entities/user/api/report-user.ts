import { useMutation } from "@tanstack/react-query";

import { api } from "@/shared/api";

import { type ReportResult, ReportResultSchema } from "../model/types";

export function useReportUserMutation() {
  return useMutation({
    mutationFn: async ({
      reason,
      reportedId,
    }: {
      reason: string;
      reportedId: number;
    }) =>
      ReportResultSchema.parse(
        await api.post<ReportResult>("/api/reports", { reason, reportedId }),
      ),
  });
}

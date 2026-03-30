import React from "react";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrRecruitmentBoard from "../features/hr/components/HrRecruitmentBoard";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HRRecruitmentWorkspace() {
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getCandidates(), []);

  const handleMove = async (candidateId, toStage) => {
    await hrWorkspaceApi.moveCandidateStage(candidateId, toStage);
    await reload();
  };

  return (
    <HrWorkspaceLayout title="Recruitment Board" description="Kanban pipeline for candidate progression and hiring flow visibility.">
      {loading ? <HrLoadingState message="Loading recruitment pipeline..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? <HrRecruitmentBoard candidates={data.items} onMove={handleMove} /> : null}
    </HrWorkspaceLayout>
  );
}


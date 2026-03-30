import React from "react";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrTrendBars from "../features/hr/components/HrTrendBars";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HRPerformanceWorkspace() {
  const { data, error, loading, reload } = useHrResource(
    async () => {
      const [dashboard, reviews] = await Promise.all([
        hrWorkspaceApi.getPerformanceDashboard(),
        hrWorkspaceApi.getPerformanceReviews(),
      ]);

      return { dashboard, reviews };
    },
    [],
  );

  return (
    <HrWorkspaceLayout title="Performance Dashboard" description="Ratings, completion trends, and department-level outcomes.">
      {loading ? <HrLoadingState message="Loading performance data..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <>
          <section className="summary-grid">
            <StatCard title="Average Rating" value={`${data.dashboard.averageRating}/5`} icon="AR" color="#1d4ed8" />
            <StatCard title="Completion Rate" value={`${data.dashboard.completionRate}%`} icon="CR" color="#047857" />
          </section>
          <section className="page-grid page-grid--two">
            <HrTrendBars
              title="Department Ratings"
              items={data.dashboard.departmentPerformance}
              valueKey="rating"
              labelKey="department"
              formatter={(value) => `${value}/5`}
            />
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h3>Review Register</h3>
                  <p>Performance reviews available for operational analysis.</p>
                </div>
              </div>
              <DataTable
                caption="Performance reviews"
                columns={[
                  { key: "employee_id", label: "Employee" },
                  { key: "cycle", label: "Cycle" },
                  { key: "rating", label: "Rating" },
                  { key: "goals_completed", label: "Goals %" },
                  { key: "status", label: "Status" },
                ]}
                rows={data.reviews.items}
              />
            </article>
          </section>
        </>
      ) : null}
    </HrWorkspaceLayout>
  );
}


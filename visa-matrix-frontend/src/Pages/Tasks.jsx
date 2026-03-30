import React from "react";
import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import TablePagination from "../components/TablePagination";
import DashboardLayout from "../layout/DashboardLayout";
import { getTasks } from "../services/mockApi";
import { formatDate, getPageCount, paginateRows } from "../services/erpService";

export default function Tasks() {
  const [tasks] = useState(getTasks());
  const [searchValue, setSearchValue] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = [
      task.title,
      task.application,
      task.assignedAgent,
      task.status,
      task.priority,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const pageSize = 5;
  const pageCount = getPageCount(filteredTasks, pageSize);
  const visibleTasks = paginateRows(filteredTasks, page, pageSize);

  const columns = [
    { key: "title", label: "Task Title" },
    { key: "application", label: "Application" },
    { key: "assignedAgent", label: "Assigned Agent" },
    { key: "priority", label: "Priority" },
    {
      key: "dueDate",
      label: "Due Date",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusPill label={row.status} />,
    },
  ];

  const highPriorityTasks = tasks.filter((task) => task.priority === "High");

  return (
    <DashboardLayout>
      <PageHeader
        title="Tasks / Case Management"
        description="Manage case assignments, due dates, priorities, and workflow follow-ups for the team."
      />

      <section className="summary-grid">
        <StatCard
          title="Open Tasks"
          value={tasks.filter((task) => task.status !== "Completed").length}
          icon="OT"
          color="#2563EB"
        />
        <StatCard
          title="High Priority"
          value={highPriorityTasks.length}
          icon="HP"
          color="#F97316"
        />
        <StatCard
          title="Completed"
          value={tasks.filter((task) => task.status === "Completed").length}
          icon="CP"
          color="#22C55E"
        />
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Agent Task Dashboard</h3>
              <p>Search by title, application, status, or assignee and filter by priority.</p>
            </div>
          </div>

          <div className="filter-row">
            <label className="search-toolbar">
              <span>Search tasks</span>
              <input
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setPage(1);
                }}
                placeholder="Search tasks"
                type="search"
                value={searchValue}
              />
            </label>

            <label className="filter-select">
              <span>Priority</span>
              <select
                onChange={(event) => {
                  setPriorityFilter(event.target.value);
                  setPage(1);
                }}
                value={priorityFilter}
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
          </div>

          <DataTable
            caption="Task management table"
            columns={columns}
            emptyMessage="No tasks match the current filters."
            rowKey="id"
            rows={visibleTasks}
          />

          <TablePagination
            itemLabel="tasks"
            onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            page={page}
            pageCount={pageCount}
          />
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Case Management Focus</h3>
              <p>High-priority work that needs immediate operational attention.</p>
            </div>
          </div>

          <div className="kpi-list">
            {highPriorityTasks.map((task) => (
              <div className="kpi-item" key={task.id}>
                <div className="message-thread">
                  <strong>{task.title}</strong>
                  <p>
                    {task.application} assigned to {task.assignedAgent}
                  </p>
                </div>
                <StatusPill label={task.status} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}

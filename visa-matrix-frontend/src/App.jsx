import React from "react";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Admin from "./Pages/Admin";
import Applications from "./Pages/Applications";
import AuditLogs from "./Pages/AuditLogs";
import Communication from "./Pages/Communication";
import Countries from "./Pages/Countries";
import Customers from "./Pages/Customers";
import Dashboard from "./Pages/Dashboard";
import Documents from "./Pages/Documents";
import HR from "./Pages/HR";
import HRAuditLogsWorkspace from "./Pages/HRAuditLogsWorkspace";
import HRDashboardWorkspace from "./Pages/HRDashboardWorkspace";
import HRDepartmentSetupWorkspace from "./Pages/HRDepartmentSetupWorkspace";
import HREmployeesWorkspace from "./Pages/HREmployeesWorkspace";
import HREmployeeProfileWorkspace from "./Pages/HREmployeeProfileWorkspace";
import HRPayrollWorkspace from "./Pages/HRPayrollWorkspace";
import HRPerformanceWorkspace from "./Pages/HRPerformanceWorkspace";
import HRRecruitmentWorkspace from "./Pages/HRRecruitmentWorkspace";
import HRRolesPermissionsWorkspace from "./Pages/HRRolesPermissionsWorkspace";
import HRSettingsWorkspace from "./Pages/HRSettingsWorkspace";
import HRWorkflowWorkspace from "./Pages/HRWorkflowWorkspace";
import Payments from "./Pages/Payments";
import Reports from "./Pages/Reports";
import ApplicationDetail from "./Pages/ApplicationDetail";
import Login from "./pages/Login";
import QuotationPage from "./Pages/QuotationPage";
import Signup from "./pages/Signup";
import Tasks from "./Pages/Tasks";
import VisaQuestionFlow from "./Pages/VisaQuestionFlow";
import Workflow from "./Pages/Workflow";
import { applyTheme } from "./theme/theme";

export default function App() {
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute module="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute module="applications">
                <Navigate replace to="/applications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute module="applications">
                <Navigate replace to="/applications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute module="customers">
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute module="applications">
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute module="applications">
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/quotation"
            element={
              <ProtectedRoute module="invoicing">
                <QuotationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries"
            element={
              <ProtectedRoute module="countries">
                <Countries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute module="documents">
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute module="invoicing">
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr", "finance"]}
              >
                <HRDashboardWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HREmployeesWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees/:employeeId"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HREmployeeProfileWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employee-profile"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HREmployeeProfileWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/payroll"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr", "finance"]}
              >
                <HRPayrollWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/roles-permissions"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRRolesPermissionsWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/departments"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRDepartmentSetupWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/audit-logs"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRAuditLogsWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/settings"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRSettingsWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/workflow"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRWorkflowWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/recruitment"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRRecruitmentWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/performance"
            element={
              <ProtectedRoute
                module="hr"
                allowedRoles={["super_admin", "admin", "hr"]}
              >
                <HRPerformanceWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute module="workflow">
                <Workflow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visa-question-flow"
            element={
              <ProtectedRoute module="visa_questions">
                <VisaQuestionFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute module="tasks">
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <ProtectedRoute module="notifications">
                <Communication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute module="audit_logs">
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute module="reports">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                module="settings"
                allowedRoles={["super_admin", "admin"]}
              >
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute
                module="settings"
                allowedRoles={["super_admin", "admin"]}
              >
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

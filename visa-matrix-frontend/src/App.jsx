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
import HRDashboardWorkspace from "./Pages/HRDashboardWorkspace";
import HREmployeesWorkspace from "./Pages/HREmployeesWorkspace";
import HREmployeeProfileWorkspace from "./Pages/HREmployeeProfileWorkspace";
import HRPayrollWorkspace from "./Pages/HRPayrollWorkspace";
import HRPerformanceWorkspace from "./Pages/HRPerformanceWorkspace";
import HRRecruitmentWorkspace from "./Pages/HRRecruitmentWorkspace";
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
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <Navigate replace to="/applications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <Navigate replace to="/applications" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id/quotation"
            element={
              <ProtectedRoute>
                <QuotationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries"
            element={
              <ProtectedRoute>
                <Countries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
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
              <ProtectedRoute module="hr">
                <HR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute module="hr">
                <HRDashboardWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute module="hr">
                <HREmployeesWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees/:employeeId"
            element={
              <ProtectedRoute module="hr">
                <HREmployeeProfileWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/payroll"
            element={
              <ProtectedRoute module="hr">
                <HRPayrollWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/workflows"
            element={
              <ProtectedRoute module="hr">
                <HRWorkflowWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/recruitment"
            element={
              <ProtectedRoute module="hr">
                <HRRecruitmentWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/performance"
            element={
              <ProtectedRoute module="hr">
                <HRPerformanceWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <Workflow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visa-question-flow"
            element={
              <ProtectedRoute>
                <VisaQuestionFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
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
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute module="settings">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute module="settings">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

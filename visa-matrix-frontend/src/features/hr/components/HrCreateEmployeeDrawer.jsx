import React, { useMemo, useState } from "react";

const roleTemplates = [
  "Visa Officer",
  "HR Executive",
  "Finance Executive",
  "Operations Manager",
  "Team Lead",
  "Admin",
];

const roleAccess = {
  "Visa Officer": ["CRM", "Applications", "Documents"],
  "HR Executive": ["HR", "Reports", "Notifications", "Workflow"],
  "Finance Executive": ["Payments", "Reports", "Documents"],
  "Operations Manager": ["CRM", "Applications", "Documents", "Reports", "Workflow"],
  "Team Lead": ["CRM", "Applications", "Documents", "Workflow"],
  Admin: ["CRM", "Applications", "Documents", "Payments", "HR", "Reports", "Notifications", "Workflow"],
};

const modules = ["CRM", "Applications", "Documents", "Payments", "HR", "Reports", "Notifications", "Workflow"];

const initialForm = {
  fullName: "",
  employeeCode: "",
  email: "",
  phone: "",
  dateOfJoining: "",
  department: "Operations",
  designation: "",
  loginEmail: "",
  temporaryPassword: "",
  confirmPassword: "",
  sendWelcomeEmail: true,
  manager: "",
  teamLead: "",
  branch: "Bengaluru HQ",
  roleTemplate: "Visa Officer",
  status: "active",
};

export default function HrCreateEmployeeDrawer({ departments, managers, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const allowedModules = useMemo(() => roleAccess[form.roleTemplate] ?? [], [form.roleTemplate]);

  const updateField = (field, value) => {
    setError("");
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "email" && !current.loginEmail ? { loginEmail: value } : {}),
    }));
  };

  const handleSubmit = async (event, draft = false) => {
    event.preventDefault();

    if (!form.manager) {
      setError("Assign Manager is mandatory.");
      return;
    }

    if (!draft && form.temporaryPassword !== form.confirmPassword) {
      setError("Temporary password and confirmation must match.");
      return;
    }

    setSaving(true);
    await onCreate({ ...form, status: draft ? "temporary" : form.status });
    setSaving(false);
    onClose();
  };

  return (
    <div className="hr-drawer-overlay" role="presentation">
      <aside className="hr-drawer" aria-label="Create employee">
        <div className="modal-card__header">
          <div>
            <span className="page-header__eyebrow">Employee Account</span>
            <h3>Create Employee</h3>
            <p>Set up identity, hierarchy, permissions, and access status.</p>
          </div>
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>

        <form className="hr-employee-form" onSubmit={handleSubmit}>
          <section className="panel">
            <div className="panel__header">
              <h3>Basic Details</h3>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Full Name</span>
                <input required value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
              </label>
              <label className="field">
                <span>Employee ID</span>
                <input required value={form.employeeCode} onChange={(event) => updateField("employeeCode", event.target.value)} />
              </label>
              <label className="field">
                <span>Email</span>
                <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
              </label>
              <label className="field">
                <span>Phone Number</span>
                <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
              </label>
              <label className="field">
                <span>Date of Joining</span>
                <input required type="date" value={form.dateOfJoining} onChange={(event) => updateField("dateOfJoining", event.target.value)} />
              </label>
              <label className="field">
                <span>Department</span>
                <select value={form.department} onChange={(event) => updateField("department", event.target.value)}>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field--full">
                <span>Designation</span>
                <input required value={form.designation} onChange={(event) => updateField("designation", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h3>Account Setup</h3>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Login Email</span>
                <input required type="email" value={form.loginEmail} onChange={(event) => updateField("loginEmail", event.target.value)} />
              </label>
              <label className="field">
                <span>Temporary Password</span>
                <input required type="password" value={form.temporaryPassword} onChange={(event) => updateField("temporaryPassword", event.target.value)} />
              </label>
              <label className="field">
                <span>Confirm Password</span>
                <input required type="password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} />
              </label>
              <label className="checkbox-row">
                <input checked={form.sendWelcomeEmail} type="checkbox" onChange={(event) => updateField("sendWelcomeEmail", event.target.checked)} />
                Send Welcome Email
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h3>Reporting Structure</h3>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Assign Manager</span>
                <select required value={form.manager} onChange={(event) => updateField("manager", event.target.value)}>
                  <option value="">Select manager</option>
                  {managers.map((manager) => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Assign Team Lead</span>
                <select value={form.teamLead} onChange={(event) => updateField("teamLead", event.target.value)}>
                  <option value="">Select team lead</option>
                  {managers.map((manager) => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Department</span>
                <select value={form.department} onChange={(event) => updateField("department", event.target.value)}>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Branch</span>
                <select value={form.branch} onChange={(event) => updateField("branch", event.target.value)}>
                  <option>Bengaluru HQ</option>
                  <option>Hyderabad</option>
                  <option>Pune</option>
                  <option>Delhi</option>
                </select>
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h3>Role Template</h3>
            </div>
            <label className="field">
              <span>Role Template</span>
              <select value={form.roleTemplate} onChange={(event) => updateField("roleTemplate", event.target.value)}>
                {roleTemplates.map((roleTemplate) => (
                  <option key={roleTemplate} value={roleTemplate}>
                    {roleTemplate}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h3>Access Preview</h3>
            </div>
            <div className="hr-access-preview">
              {modules.map((moduleName) => {
                const enabled = allowedModules.includes(moduleName);
                return (
                  <span className={enabled ? "hr-access-preview__item hr-access-preview__item--enabled" : "hr-access-preview__item"} key={moduleName}>
                    {enabled ? "✓" : "×"} {moduleName}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <h3>Account Status</h3>
            </div>
            <div className="hr-segmented-control">
              {["active", "restricted", "temporary"].map((status) => (
                <label className={form.status === status ? "status-toggle status-toggle--active" : "status-toggle"} key={status}>
                  <input checked={form.status === status} name="account-status" type="radio" onChange={() => updateField("status", status)} />
                  {status}
                </label>
              ))}
            </div>
          </section>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions hr-drawer-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="secondary-button" type="button" disabled={saving} onClick={(event) => handleSubmit(event, true)}>
              Save Draft
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

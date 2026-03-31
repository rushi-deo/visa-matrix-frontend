import React from "react";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import TablePagination from "../components/TablePagination";
import NewApplicationForm from "../forms/NewApplicationForm";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useCountries } from "../hooks/useCountries";
import { getPageCount } from "../services/erpService";
import { fetchLeads } from "../services/api";
import { createLead, updateLead } from "../services/leads.service";

const emptyLead = {
  leadName: "",
  email: "",
  phone: "",
  interestedCountry: "",
  leadSource: "Website",
  status: "New",
  assignedAgent: "",
  visaType: "",
};

export default function CRM() {
  const { countries } = useCountries();
  const { canAccess } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [scheduleState, setScheduleState] = useState({ date: "", note: "" });
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [leadError, setLeadError] = useState("");
  const [activityMessage, setActivityMessage] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    const nextLeads = await fetchLeads();
    setLeads(nextLeads);
    setLeadError("");
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = [
      lead.leadName,
      lead.email,
      lead.phone,
      lead.interestedCountry,
      lead.leadSource,
      lead.status,
      lead.assignedAgent,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageSize = 5;
  const pageCount = getPageCount(filteredLeads, pageSize);
  const countryOptions = [...new Set(countries.map((country) => country.country))];
  const visaTypeOptions = [...new Set(countries.flatMap((country) => country.visa_types))];

  const openScheduleModal = (lead) => {
    setSelectedLead(lead);
    setScheduleState({ date: lead.consultationDate ?? "", note: "" });
    setShowScheduleModal(true);
  };

  const openConvertModal = (lead) => {
    setSelectedLead(lead);
    setShowConvertModal(true);
  };

  const handleLeadFormChange = (event) => {
    const { name, value } = event.target;

    setLeadForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleLeadCreate = async (event) => {
    event.preventDefault();

    if (
      !leadForm.leadName.trim() ||
      !leadForm.email.trim() ||
      !leadForm.phone.trim() ||
      !leadForm.interestedCountry ||
      !leadForm.assignedAgent.trim()
    ) {
      setLeadError("Lead name, contact details, country, and agent are required.");
      return;
    }

    try {
      await createLead({
        ...leadForm,
        consultationDate: "2026-03-23",
      });
      await loadLeads();
      setLeadForm(emptyLead);
      setLeadError("");
      setShowLeadModal(false);
      setActivityMessage("New lead added to the CRM queue.");
      setPage(1);
    } catch (error) {
      console.error("Failed to create lead:", error);
      setLeadError(error.message ?? "Unable to save lead.");
    }
  };

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedLead || !scheduleState.date) {
      return;
    }

    try {
      await updateLead(selectedLead.id, {
        consultationDate: scheduleState.date,
        status: "Consultation Scheduled",
      });
      await loadLeads();
      setActivityMessage(`Consultation scheduled for ${selectedLead.leadName}.`);
      setShowScheduleModal(false);
    } catch (error) {
      console.error("Failed to update lead schedule:", error);
      setLeadError(error.message ?? "Unable to schedule consultation.");
    }
  };

  const handleConvertSubmit = async (values) => {
    if (!selectedLead) {
      return;
    }

    try {
      await updateLead(selectedLead.id, {
        status: "Converted",
        interestedCountry: values.destinationCountry,
        visaType: values.visaType,
      });
      await loadLeads();
      setActivityMessage(`${selectedLead.leadName} converted into a draft application.`);
      setShowConvertModal(false);
    } catch (error) {
      console.error("Failed to convert lead:", error);
      setLeadError(error.message ?? "Unable to convert lead.");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="CRM / Leads"
        description="Capture, qualify, assign, and convert prospects into visa applications without leaving the ERP."
        action={
          canAccess("invoicing", "create") ? (
            <button className="primary-button" onClick={() => setShowLeadModal(true)} type="button">
              Add Lead
            </button>
          ) : null
        }
      />

      {activityMessage ? (
        <article className="alert-card alert-card--info">
          <span className="alert-card__eyebrow">Pipeline Update</span>
          <strong>{activityMessage}</strong>
        </article>
      ) : null}

      <section className="panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h3>Lead Management</h3>
            <p>Search, filter, and work every prospect before conversion into an active case.</p>
          </div>
        </div>

        <div className="filter-row">
          <label className="search-toolbar">
            <span>Search leads</span>
            <input
              onChange={(event) => {
                setSearchValue(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, country, source, or agent"
              type="search"
              value={searchValue}
            />
          </label>

          <label className="filter-select">
            <span>Status</span>
            <select
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="All">All</option>
              {[...new Set(leads.map((lead) => lead.status))].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p className="empty-state">Loading leads...</p> : null}
        {!loading && leadError ? <p className="form-error">{leadError}</p> : null}
        {!loading && !leadError && filteredLeads.length === 0 ? <p className="empty-state">No Leads Found</p> : null}

        <TablePagination
          itemLabel="lead records"
          onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
          onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          page={page}
          pageCount={pageCount}
        />
      </section>

      <Modal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} title="Add Lead">
        <form onSubmit={handleLeadCreate}>
          <div className="form-grid">
            <label className="field">
              <span>Lead Name</span>
              <input name="leadName" onChange={handleLeadFormChange} value={leadForm.leadName} />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" onChange={handleLeadFormChange} type="email" value={leadForm.email} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" onChange={handleLeadFormChange} value={leadForm.phone} />
            </label>
            <label className="field">
              <span>Interested Country</span>
              <select name="interestedCountry" onChange={handleLeadFormChange} value={leadForm.interestedCountry}>
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Lead Source</span>
              <select name="leadSource" onChange={handleLeadFormChange} value={leadForm.leadSource}>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="Expo">Expo</option>
              </select>
            </label>
            <label className="field">
              <span>Assigned Agent</span>
              <input name="assignedAgent" onChange={handleLeadFormChange} value={leadForm.assignedAgent} />
            </label>
            <label className="field">
              <span>Visa Type</span>
              <select name="visaType" onChange={handleLeadFormChange} value={leadForm.visaType}>
                <option value="">Select visa type</option>
                {visaTypeOptions.map((visaType) => (
                  <option key={visaType} value={visaType}>
                    {visaType}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {leadError ? <p className="form-error">{leadError}</p> : null}

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Save Lead
            </button>
            <button className="secondary-button" onClick={() => setShowLeadModal(false)} type="button">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Consultation">
        <form onSubmit={handleScheduleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Lead</span>
              <input disabled value={selectedLead?.leadName ?? ""} />
            </label>
            <label className="field">
              <span>Consultation Date</span>
              <input
                onChange={(event) =>
                  setScheduleState((currentState) => ({
                    ...currentState,
                    date: event.target.value,
                  }))
                }
                type="date"
                value={scheduleState.date}
              />
            </label>
            <label className="field field--full">
              <span>Notes</span>
              <textarea
                onChange={(event) =>
                  setScheduleState((currentState) => ({
                    ...currentState,
                    note: event.target.value,
                  }))
                }
                placeholder="Add consultation instructions"
                value={scheduleState.note}
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Schedule
            </button>
            <button className="secondary-button" onClick={() => setShowScheduleModal(false)} type="button">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} title="Convert Lead to Application">
        <NewApplicationForm
          countryOptions={countryOptions}
          initialValues={selectedLead}
          onSubmit={handleConvertSubmit}
          submitLabel="Submit"
          visaTypeOptions={visaTypeOptions}
        />
      </Modal>
    </DashboardLayout>
  );
}

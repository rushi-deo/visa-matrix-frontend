import React from "react";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useCountries } from "../hooks/useCountries";

export default function Countries() {
  const { countries, loading, error } = useCountries();
  const [searchValue, setSearchValue] = useState("");
  const [selectedCountryKey, setSelectedCountryKey] = useState("");

  useEffect(() => {
    if (!selectedCountryKey && countries[0]) {
      setSelectedCountryKey(`${countries[0].country}-${countries[0].visaType}`);
    }
  }, [countries, selectedCountryKey]);

  const filteredCountries = useMemo(
    () =>
      countries.filter((country) =>
        [
          country.country,
          country.visaType,
          country.processingTime,
          country.approvalRate,
          country.policyNote,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue.toLowerCase()),
      ),
    [countries, searchValue],
  );

  const selectedCountry =
    filteredCountries.find(
      (country) => `${country.country}-${country.visaType}` === selectedCountryKey,
    ) ??
    filteredCountries[0] ??
    countries[0];

  return (
    <DashboardLayout>
      <PageHeader
        title="Countries & Visa Rules"
        description="Destination-specific timelines, pricing, and country requirements from Supabase with static fallback."
      />

      {error ? (
        <article className="alert-card alert-card--warning">
          <span className="alert-card__eyebrow">Fallback Mode</span>
          <strong>{error}</strong>
        </article>
      ) : null}

      <section className="profile-layout">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Country Rule Matrix</h3>
              <p>Search active destination programs by country, visa type, or operating note.</p>
            </div>
            <label className="search-toolbar">
              <span>Search countries</span>
              <input
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search countries and visa rules"
                type="search"
                value={searchValue}
              />
            </label>
          </div>

          <DataTable
            caption="Country visa rule table"
            columns={[
              { key: "country", label: "Country" },
              { key: "country_code", label: "Code" },
              { key: "visaType", label: "Visa Type" },
              { key: "processingTime", label: "Processing Time" },
              {
                key: "base_price",
                label: "Base Price",
                render: (row) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(row.base_price ?? 0),
              },
              {
                key: "actions",
                label: "Rules",
                render: (row) => (
                  <button
                    className="link-button"
                    onClick={() => setSelectedCountryKey(`${row.country}-${row.visaType}`)}
                    type="button"
                  >
                    View Rules
                  </button>
                ),
              },
            ]}
            emptyMessage={loading ? "Loading countries..." : "No country rules match the current search."}
            rowKey={(row) => `${row.country}-${row.visaType}`}
            rows={filteredCountries}
          />
        </article>

        <article className="country-requirements">
          <span className="profile-card__eyebrow">Country Requirements</span>
          <h3>
            {selectedCountry?.country} - {selectedCountry?.visaType}
          </h3>
          <p>{selectedCountry?.policyNote}</p>

          <dl className="detail-list">
            <div>
              <dt>Processing Time</dt>
              <dd>{selectedCountry?.processingTime}</dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>{selectedCountry?.currency ?? "INR"}</dd>
            </div>
            <div>
              <dt>Interview Requirement</dt>
              <dd>{selectedCountry?.interviewRequired}</dd>
            </div>
            <div>
              <dt>Last Updated</dt>
              <dd>{selectedCountry?.lastUpdated}</dd>
            </div>
          </dl>

          <div>
            <span className="profile-card__eyebrow">Country Requirements</span>
            <ul>
              {(selectedCountry?.requirements?.length
                ? selectedCountry.requirements
                : ["Passport", "Financial proof", "Travel plan", "Supporting documents"]
              ).map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}

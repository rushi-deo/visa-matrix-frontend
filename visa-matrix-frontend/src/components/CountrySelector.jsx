import React from "react";

const getCountryId = (country) => country?.id ?? country?.country_id ?? "";

const getCountryName = (country) =>
  country?.name ?? country?.country ?? country?.label ?? country?.code ?? "Unnamed country";

export default function CountrySelector({
  countries = [],
  error = "",
  loading = false,
  onCountryChange,
  selectedCountry = "",
}) {
  return (
    <div className="form-grid">
      <label className="field field--full">
        <span>Country</span>
        <select
          disabled={loading}
          onChange={(event) => onCountryChange?.(event.target.value)}
          value={selectedCountry}
        >
          <option value="">{loading ? "Loading countries..." : "Select country"}</option>
          {countries.map((country) => {
            const countryId = getCountryId(country);

            return (
              <option key={countryId || getCountryName(country)} value={countryId}>
                {getCountryName(country)}
              </option>
            );
          })}
        </select>
      </label>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

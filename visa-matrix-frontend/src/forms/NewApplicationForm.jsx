import React from "react";
import { useState } from "react";
import { normalizeVisaType } from "../utils/visaType";

const createInitialState = (initialValues = {}) => ({
  customerName: initialValues.customerName ?? initialValues.leadName ?? "",
  passportNumber: initialValues.passportNumber ?? "",
  email: initialValues.email ?? "",
  phone: initialValues.phone ?? "",
  destinationCountry:
    initialValues.destinationCountry ?? initialValues.interestedCountry ?? "",
  visaType: normalizeVisaType(initialValues.visaType ?? initialValues.visa_type) ?? "",
  travelDate: initialValues.travelDate ?? "",
  agentAssigned: initialValues.agentAssigned ?? initialValues.assignedAgent ?? "",
  leadSource: initialValues.leadSource ?? initialValues.lead_source ?? "",
});

export default function NewApplicationForm({
  initialValues,
  countries = [],
  countryOptions = [],
  visaTypeOptions = [],
  onSubmit,
  submitLabel = "Submit",
}) {
  const [values, setValues] = useState(() => createInitialState(initialValues));
  const [errors, setErrors] = useState({});
  const finalCountries = countries && countries.length > 0 ? countries : countryOptions;
  console.log("Countries received in form:", countries?.length);
  const normalizedCountryOptions = finalCountries
    .map((country) =>
      typeof country === "string"
        ? { code: country, name: country }
        : {
            code: country?.code ?? country?.country_code ?? country?.name ?? country?.country ?? "",
            name: country?.name ?? country?.code ?? "",
          },
    )
    .filter((country) => country.code && country.name);
  const selectedCountryCode =
    normalizedCountryOptions.find(
      (country) =>
        country.code === values.destinationCountry || country.name === values.destinationCountry,
    )?.code ?? values.destinationCountry;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!values.customerName.trim()) {
      nextErrors.customerName = "Customer name is required.";
    }

    if (!values.passportNumber.trim()) {
      nextErrors.passportNumber = "Passport number is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    }

    if (!values.destinationCountry) {
      nextErrors.destinationCountry = "Destination country is required.";
    }

    if (!values.visaType) {
      nextErrors.visaType = "Visa type is required.";
    }

    if (!values.travelDate) {
      nextErrors.travelDate = "Travel date is required.";
    }

    if (!values.agentAssigned) {
      nextErrors.agentAssigned = "Assigned agent is required.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const selectedCountryName =
      normalizedCountryOptions.find((country) => country.code === values.destinationCountry)
        ?.name ?? values.destinationCountry;

    onSubmit?.({
      ...values,
      destinationCountry: selectedCountryName,
    });
  };

  const handleReset = () => {
    setValues(createInitialState(initialValues));
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span>Customer Name</span>
          <input
            name="customerName"
            onChange={handleChange}
            placeholder="Enter customer name"
            type="text"
            value={values.customerName}
          />
          {errors.customerName ? <p className="form-error">{errors.customerName}</p> : null}
        </label>

        <label className="field">
          <span>Passport Number</span>
          <input
            name="passportNumber"
            onChange={handleChange}
            placeholder="Enter passport number"
            type="text"
            value={values.passportNumber}
          />
          {errors.passportNumber ? (
            <p className="form-error">{errors.passportNumber}</p>
          ) : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            onChange={handleChange}
            placeholder="Enter email"
            type="email"
            value={values.email}
          />
          {errors.email ? <p className="form-error">{errors.email}</p> : null}
        </label>

        <label className="field">
          <span>Phone</span>
          <input
            name="phone"
            onChange={handleChange}
            placeholder="Enter phone"
            type="text"
            value={values.phone}
          />
          {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
        </label>

        <label className="field">
          <span>Destination Country</span>
          <select
            name="destinationCountry"
            onChange={handleChange}
            value={selectedCountryCode}
          >
            <option value="">Select country</option>
            {normalizedCountryOptions.map((country) => (
              <option
                key={country.code}
                value={country.code}
              >
                {country.name}
              </option>
            ))}
          </select>
          {errors.destinationCountry ? (
            <p className="form-error">{errors.destinationCountry}</p>
          ) : null}
        </label>

        <label className="field">
          <span>Visa Type</span>
          <select name="visaType" onChange={handleChange} value={values.visaType}>
            <option value="">Select visa type</option>
            {visaTypeOptions.map((visaType) => (
              <option key={visaType} value={visaType}>
                {visaType}
              </option>
            ))}
          </select>
          {errors.visaType ? <p className="form-error">{errors.visaType}</p> : null}
        </label>

        <label className="field">
          <span>Travel Date</span>
          <input
            name="travelDate"
            onChange={handleChange}
            type="date"
            value={values.travelDate}
          />
          {errors.travelDate ? <p className="form-error">{errors.travelDate}</p> : null}
        </label>

        <label className="field">
          <span>Agent Assigned</span>
          <input
            name="agentAssigned"
            onChange={handleChange}
            placeholder="Enter assigned agent"
            type="text"
            value={values.agentAssigned}
          />
          {errors.agentAssigned ? (
            <p className="form-error">{errors.agentAssigned}</p>
          ) : null}
        </label>

        <label className="field field--full">
          <span>Lead Source</span>
          <input
            name="leadSource"
            onChange={handleChange}
            placeholder="Enter lead source (e.g., Instagram, Referral, Walk-in)"
            type="text"
            value={values.leadSource}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          {submitLabel}
        </button>
        <button className="secondary-button" onClick={handleReset} type="button">
          Reset
        </button>
      </div>
    </form>
  );
}

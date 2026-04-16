export const DB_VISA_TYPES = ["Tourist", "Business", "Family Visit"];

const visaTypeAliases = {
  "General Visa": "Tourist",
  "Tourist Visa": "Tourist",
  "Business Visa": "Business",
  "Visit Visa": "Family Visit",
};

export const normalizeVisaType = (visaType) => {
  if (visaType === undefined || visaType === null) {
    return visaType;
  }

  if (typeof visaType !== "string") {
    return visaType;
  }

  return visaTypeAliases[visaType] ?? visaType;
};

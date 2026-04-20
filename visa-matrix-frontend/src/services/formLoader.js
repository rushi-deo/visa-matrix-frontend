export async function loadFormByCountry(country) {
  if (!country || typeof country !== "string") {
    return null;
  }

  try {
    const formModule = await import(`../data/forms/${country.toLowerCase()}.json`);
    return formModule.default ?? null;
  } catch (error) {
    console.warn(`Form schema not found for country: ${country}`, error);
    return null;
  }
}

export default loadFormByCountry;

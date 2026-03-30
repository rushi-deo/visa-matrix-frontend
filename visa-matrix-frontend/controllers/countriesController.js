import { getCountries as getCountriesFromNewService } from '../src/services/countries.service.js';
import { getCountries } from '../services/countriesService.js';

export const getCountriesHandler = async (req, res) => {
  try {
    console.log("Using NEW service layer");

    const newData = await getCountriesFromNewService();

    if (newData && newData.length > 0) {
      return res.status(200).json({
        success: true,
        data: newData,
        count: newData.length,
      });
    }

    console.log("Fallback to OLD logic");
  } catch (err) {
    console.error("New service failed, fallback:", err);
  }

  try {
    const countries = await getCountries();
    res.status(200).json({
      success: true,
      data: countries,
      count: countries.length,
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      message: error.message,
    });
  }
};

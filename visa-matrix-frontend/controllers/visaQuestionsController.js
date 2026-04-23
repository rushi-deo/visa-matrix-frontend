import visaQuestionService from "../services/visaQuestionService.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

export const getCountryQuestionsHandler = async (req, res) => {
  const { countryId } = req.params;

  if (!UUID_PATTERN.test(countryId)) {
    throw createBadRequestError("countryId must be a valid UUID.");
  }

  const result = await visaQuestionService.getQuestionsByCountryId(countryId);

  return res.status(200).json(result);
};

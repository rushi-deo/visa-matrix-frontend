import {
  createPollQuestion,
  respondToPollQuestion,
  sendKudos,
  submitFeedback,
} from "../services/engagementService.js";

export const createPollHandler = async (req, res) => {
  const poll = await createPollQuestion(req.body, req.user);
  res.status(201).json({
    success: true,
    data: poll,
  });
};

export const respondToPollHandler = async (req, res) => {
  const response = await respondToPollQuestion(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    data: response,
  });
};

export const createFeedbackHandler = async (req, res) => {
  const feedback = await submitFeedback(req.body, req.user);
  res.status(201).json({
    success: true,
    data: feedback,
  });
};

export const createKudosHandler = async (req, res) => {
  const kudos = await sendKudos(req.body, req.user);
  res.status(201).json({
    success: true,
    data: kudos,
  });
};

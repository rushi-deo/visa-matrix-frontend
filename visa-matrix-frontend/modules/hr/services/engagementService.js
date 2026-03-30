import {
  createFeedback,
  createKudos,
  createPoll,
  createPollResponse,
  getPollById,
} from "../models/engagementModel.js";
import { getEmployeeById } from "../models/employeeModel.js";
import { assertOrThrow } from "./hrErrorService.js";
import { resolveEmployeeForUser } from "./employeeService.js";

const resolveTargetEmployee = async (employeeId, user) => {
  const employee = await getEmployeeById(employeeId, user);
  assertOrThrow(employee, 404, "Target employee not found.");
  return employee.id;
};

const resolveActorEmployeeId = async (user, requestedEmployeeId) => {
  if (user.role === "employee") {
    return (await resolveEmployeeForUser(user)).id;
  }

  if (requestedEmployeeId) {
    return resolveTargetEmployee(requestedEmployeeId, user);
  }

  const selfEmployee = await resolveEmployeeForUser(user).catch(() => null);
  return selfEmployee?.id || user.id;
};

export const createPollQuestion = async (payload, user) => createPoll(payload, user);

export const respondToPollQuestion = async (pollId, payload, user) => {
  const poll = await getPollById(pollId, user);
  assertOrThrow(poll, 404, "Poll not found.");

  const employeeId = await resolveActorEmployeeId(user, payload.employee_id);

  return createPollResponse(
    {
      poll_id: pollId,
      employee_id: employeeId,
      answer: payload.answer,
    },
    user,
  );
};

export const submitFeedback = async (payload, user) => {
  const fromEmployee = await resolveActorEmployeeId(user, payload.from_employee);
  const toEmployee = await resolveTargetEmployee(payload.to_employee, user);

  return createFeedback(
    {
      from_employee: fromEmployee,
      to_employee: toEmployee,
      message: payload.message,
    },
    user,
  );
};

export const sendKudos = async (payload, user) => {
  const fromEmployee = await resolveActorEmployeeId(user, payload.from_employee);
  const toEmployee = await resolveTargetEmployee(payload.to_employee, user);

  return createKudos(
    {
      from_employee: fromEmployee,
      to_employee: toEmployee,
      message: payload.message,
    },
    user,
  );
};

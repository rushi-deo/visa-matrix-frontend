import {
  createAnnouncement,
  createNotifications,
  listAnnouncements,
  listNotifications,
} from "../models/communicationModel.js";
import { listEmployeeProfiles } from "./employeeService.js";
import { resolveEmployeeForUser } from "./employeeService.js";

export const publishAnnouncement = async (payload, user) => {
  const announcement = await createAnnouncement(payload, user);
  const employees = await listEmployeeProfiles({}, user);

  await createNotifications(
    employees.map((employee) => ({
      employee_id: employee.id,
      message: `${announcement.title}: ${announcement.message}`,
      read_status: false,
    })),
    user,
  );

  return announcement;
};

export const listPublishedAnnouncements = async (user) => listAnnouncements(user);

export const listEmployeeNotifications = async (filters, user) => {
  if (user.role !== "employee") {
    return listNotifications(filters, user);
  }

  const employee = await resolveEmployeeForUser(user);
  return listNotifications(
    {
      ...filters,
      employee_id: employee.id,
    },
    user,
  );
};

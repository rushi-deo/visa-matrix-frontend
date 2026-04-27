import {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
} from "../services/applicationsService.js";
import { createAuditLog } from "../services/auditLogService.js";
import { createNotification } from "../services/notificationService.js";

export const getApplicationsHandler = async (req, res) => {
  try {
    const applications = await getApplications(req.user);
    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch applications",
      message: error.message,
    });
  }
};

export const getApplicationHandler = async (req, res) => {
  try {
    console.log("Fetching application:", req.params.id);
    const application = await getApplicationById(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(404).json({
      success: false,
      error: "Application not found",
      message: error.message,
    });
  }
};

export const createApplicationHandler = async (req, res) => {
  try {
    const applicationData = req.body;
    const requiredFields = [
      "customerName",
      "email",
      "destinationCountry",
      "visaType",
    ];
    const missingFields = requiredFields.filter(
      (field) => !applicationData[field],
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missingFields,
      });
    }

    const newApplication = await createApplication(applicationData, req.user);

    await createNotification({
      organization_id:
        newApplication.organization_id ?? req.user.organization_id,
      title: "Application created",
      message: `${newApplication.customerName} application was created for ${newApplication.destinationCountry}.`,
      module: "notifications",
      entity_id: newApplication.id,
    });

    await createAuditLog({
      user_id: req.user.id,
      organization_id:
        newApplication.organization_id ?? req.user.organization_id,
      action: "application_created",
      module: "applications",
      entity_id: newApplication.id,
      metadata: {
        destinationCountry: newApplication.destinationCountry,
        visaType: newApplication.visaType,
      },
    });

    return res.status(201).json({
      success: true,
      data: newApplication,
      message: "Application created successfully",
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create application",
      message: error.message,
    });
  }
};

export const updateApplicationHandler = async (req, res) => {
  try {
    const updatedApplication = await updateApplication(
      req.params.id,
      req.body,
      req.user,
    );

    return res.status(200).json({
      success: true,
      data: updatedApplication,
      message: "Application updated successfully",
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update application",
      message: error.message,
    });
  }
};

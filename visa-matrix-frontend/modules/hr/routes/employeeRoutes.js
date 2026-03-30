import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  createEmployeeHandler,
  deleteEmployeeHandler,
  getEmployeeHandler,
  listDepartmentsHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
} from "../controllers/employeeController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateCreateEmployeeBody,
  validateEmployeeParams,
  validateListEmployeesQuery,
  validateUpdateEmployeeBody,
} from "../validations/employeeValidation.js";

const router = express.Router();

router.get(
  "/departments",
  roleMiddleware("admin", "hr"),
  asyncHandler(listDepartmentsHandler),
);

router.post(
  "/employees",
  roleMiddleware("admin", "hr"),
  validateRequest({ body: validateCreateEmployeeBody }),
  asyncHandler(createEmployeeHandler),
);

router.get(
  "/employees",
  roleMiddleware("admin", "hr"),
  validateRequest({ query: validateListEmployeesQuery }),
  asyncHandler(listEmployeesHandler),
);

router.get(
  "/employees/:id",
  roleMiddleware("admin", "hr"),
  validateRequest({ params: validateEmployeeParams }),
  asyncHandler(getEmployeeHandler),
);

router.put(
  "/employees/:id",
  roleMiddleware("admin", "hr"),
  validateRequest({
    params: validateEmployeeParams,
    body: validateUpdateEmployeeBody,
  }),
  asyncHandler(updateEmployeeHandler),
);

router.delete(
  "/employees/:id",
  roleMiddleware("admin"),
  validateRequest({ params: validateEmployeeParams }),
  asyncHandler(deleteEmployeeHandler),
);

export default router;

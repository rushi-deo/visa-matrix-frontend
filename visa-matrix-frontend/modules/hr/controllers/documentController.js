import { getEmployeeDocuments, uploadEmployeeDocument } from "../services/documentService.js";

export const uploadDocumentHandler = async (req, res) => {
  const document = await uploadEmployeeDocument(req.body, req.user);
  res.status(201).json({
    success: true,
    data: document,
  });
};

export const listDocumentsHandler = async (req, res) => {
  const documents = await getEmployeeDocuments(req.params.employee_id, req.user);
  res.status(200).json({
    success: true,
    data: documents,
    count: documents.length,
  });
};

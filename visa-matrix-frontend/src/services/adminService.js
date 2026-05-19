import apiClient, { extractResponseData } from "./apiClient";

const unwrapItems = (response) => {
  const payload = extractResponseData(response);
  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
};

export const fetchCurrentAccessProfile = async () => {
  const response = await apiClient.get("/admin/auth/me");
  return extractResponseData(response);
};

export const fetchAdminRoles = async () => {
  const response = await apiClient.get("/admin/roles");
  return unwrapItems(response);
};

export const fetchAdminPermissions = async () => {
  const response = await apiClient.get("/admin/permissions");
  return unwrapItems(response);
};

export const fetchRolePermissions = async (roleId) => {
  const response = await apiClient.get(`/admin/roles/${roleId}/permissions`);
  return extractResponseData(response);
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  const response = await apiClient.put(`/admin/roles/${roleId}/permissions`, {
    permissionIds,
  });
  return extractResponseData(response);
};

export const updateRole = async (roleId, payload) => {
  const response = await apiClient.put(`/admin/roles/${roleId}`, payload);
  return extractResponseData(response);
};

export const fetchAdminUsers = async (params = {}) => {
  const response = await apiClient.get("/admin/users", { params });
  const payload = extractResponseData(response);

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination || null,
  };
};

export const updateUserRole = async (userId, roleId) => {
  const response = await apiClient.put(`/admin/users/${userId}/role`, { roleId });
  return extractResponseData(response);
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await apiClient.put(`/admin/users/${userId}/status`, { isActive });
  return extractResponseData(response);
};

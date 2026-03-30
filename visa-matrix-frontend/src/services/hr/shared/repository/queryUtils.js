import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";

export const cloneRecord = (value) => structuredClone(value);

export const normalizePagination = (query = {}) => {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE));

  return { page, pageSize };
};

export const applyQueryOptions = (
  collection,
  { filters = {}, search = "", searchFields = [], sortBy = "updated_at", sortOrder = "desc", page = 1, pageSize = DEFAULT_PAGE_SIZE } = {},
) => {
  const normalizedSearch = String(search ?? "").trim().toLowerCase();

  const filteredItems = collection.filter((item) => {
    const filterMatch = Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return true;
      }

      return String(item[key] ?? "").toLowerCase() === String(value).toLowerCase();
    });

    if (!filterMatch) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return searchFields.some((fieldName) =>
      String(item[fieldName] ?? "").toLowerCase().includes(normalizedSearch),
    );
  });

  const sortedItems = [...filteredItems].sort((left, right) => {
    const leftValue = left[sortBy] ?? "";
    const rightValue = right[sortBy] ?? "";

    if (leftValue === rightValue) {
      return 0;
    }

    const comparison = leftValue > rightValue ? 1 : -1;
    return sortOrder === "asc" ? comparison : comparison * -1;
  });

  const startIndex = (page - 1) * pageSize;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize).map(cloneRecord);

  return {
    items: paginatedItems,
    total: sortedItems.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(sortedItems.length / pageSize)),
  };
};


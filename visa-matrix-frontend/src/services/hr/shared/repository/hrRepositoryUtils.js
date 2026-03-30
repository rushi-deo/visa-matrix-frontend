import { randomUUID } from "node:crypto";
import { supabase } from "../../../../../config/supabaseClient.js";
import { cloneRecord } from "./queryUtils.js";

export const generateId = (prefix) => `${prefix}-${randomUUID()}`;

const safeQuery = async (runner) => {
  if (!supabase) {
    return null;
  }

  try {
    return await runner();
  } catch {
    return null;
  }
};

export const selectRecords = async (tableName, filters = {}) => {
  const result = await safeQuery(async () => {
    let query = supabase.from(tableName).select("*");

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data;
  });

  return result ? cloneRecord(result) : null;
};

export const selectSingleRecord = async (tableName, filters = {}) => {
  const data = await selectRecords(tableName, filters);
  return data?.[0] ?? null;
};

export const insertRecord = async (tableName, payload) =>
  safeQuery(async () => {
    const { data, error } = await supabase.from(tableName).insert(payload).select().single();
    if (error) {
      throw error;
    }

    return cloneRecord(data);
  });

export const updateRecord = async (tableName, identifierField, identifierValue, payload) =>
  safeQuery(async () => {
    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq(identifierField, identifierValue)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return cloneRecord(data);
  });


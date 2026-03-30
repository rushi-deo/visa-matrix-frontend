import {
  applyOrganizationScope,
  createCreatePayload,
  filterByOrganization,
  getSupabaseClient,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

export const createPoll = async (payload, user) => {
  const createPayload = createCreatePayload(
    "poll",
    {
      ...payload,
      created_by: payload.created_by || user?.id || null,
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("polls")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.polls.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const getPollById = async (pollId, user) => {
  try {
    let query = getSupabaseClient().from("polls").select("*").eq("id", pollId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    return filterByOrganization(hrMemoryStore.polls, user).find((record) => record.id === pollId) || null;
  }
};

export const createPollResponse = async (payload, user) => {
  const createPayload = createCreatePayload(
    "poll_response",
    payload,
    user,
    "created_at",
  );

  try {
    const client = getSupabaseClient();
    const { data: existing } = await client
      .from("poll_responses")
      .select("*")
      .eq("poll_id", payload.poll_id)
      .eq("employee_id", payload.employee_id)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await client
        .from("poll_responses")
        .update({ answer: payload.answer })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    }

    const { data, error } = await client
      .from("poll_responses")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    const existingIndex = hrMemoryStore.poll_responses.findIndex(
      (record) => record.poll_id === payload.poll_id && record.employee_id === payload.employee_id,
    );

    if (existingIndex >= 0) {
      hrMemoryStore.poll_responses[existingIndex] = {
        ...hrMemoryStore.poll_responses[existingIndex],
        answer: payload.answer,
      };

      return cloneRecord(hrMemoryStore.poll_responses[existingIndex]);
    }

    hrMemoryStore.poll_responses.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const createFeedback = async (payload, user) => {
  const createPayload = createCreatePayload(
    "feedback",
    {
      ...payload,
      from_employee: payload.from_employee || user?.id || null,
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("feedback")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.feedback.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const createKudos = async (payload, user) => {
  const createPayload = createCreatePayload(
    "kudos",
    {
      ...payload,
      from_employee: payload.from_employee || user?.id || null,
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("kudos")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.kudos.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

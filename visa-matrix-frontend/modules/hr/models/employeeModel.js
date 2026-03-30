import {
  applyOrganizationScope,
  createCreatePayload,
  createUpdatePayload,
  filterByOrganization,
  getSupabaseClient,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

const enrichEmployee = (employee) => ({
  ...employee,
  department:
    hrMemoryStore.departments.find((department) => department.id === employee.department_id) || null,
});

export const listDepartments = async (user) => {
  try {
    let query = getSupabaseClient().from("departments").select("*").order("name");
    query = applyOrganizationScope(query, user);
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.departments, user).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }
};

export const getDepartmentById = async (departmentId, user) => {
  if (!departmentId) {
    return null;
  }

  try {
    let query = getSupabaseClient().from("departments").select("*").eq("id", departmentId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    return (
      filterByOrganization(hrMemoryStore.departments, user).find(
        (department) => department.id === departmentId,
      ) || null
    );
  }
};

export const listEmployees = async (filters = {}, user) => {
  const { search, department, status } = filters;

  try {
    let query = getSupabaseClient()
      .from("employees")
      .select("*, departments(id, name)")
      .order("created_at", { ascending: false });

    query = applyOrganizationScope(query, user);

    if (department) {
      query = query.eq("department_id", department);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.employees, user)
      .map(enrichEmployee)
      .filter((employee) => {
        const matchesSearch =
          !search ||
          employee.name?.toLowerCase().includes(search.toLowerCase()) ||
          employee.email?.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment =
          !department ||
          employee.department_id === department ||
          employee.department?.name?.toLowerCase() === department.toLowerCase();
        const matchesStatus = !status || employee.status === status;

        return matchesSearch && matchesDepartment && matchesStatus;
      })
      .sort((left, right) => `${right.created_at}`.localeCompare(`${left.created_at}`));
  }
};

export const getEmployeeById = async (employeeId, user) => {
  try {
    let query = getSupabaseClient()
      .from("employees")
      .select("*, departments(id, name)")
      .eq("id", employeeId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    const employee = filterByOrganization(hrMemoryStore.employees, user).find(
      (record) => record.id === employeeId,
    );
    return employee ? enrichEmployee(employee) : null;
  }
};

export const getEmployeeByUserId = async (userId, user) => {
  try {
    let query = getSupabaseClient()
      .from("employees")
      .select("*, departments(id, name)")
      .or(`user_id.eq.${userId},id.eq.${userId}`);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  } catch {
    const employee = filterByOrganization(hrMemoryStore.employees, user).find(
      (record) => record.user_id === userId || record.id === userId,
    );
    return employee ? enrichEmployee(employee) : null;
  }
};

export const getEmployeeByEmail = async (email, user) => {
  try {
    let query = getSupabaseClient().from("employees").select("*").eq("email", email);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  } catch {
    return (
      filterByOrganization(hrMemoryStore.employees, user).find((record) => record.email === email) ||
      null
    );
  }
};

export const createEmployee = async (payload, user) => {
  const createPayload = createCreatePayload(
    "emp",
    {
      ...payload,
      status: payload.status || "onboarding",
    },
    user,
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("employees")
      .insert([createPayload])
      .select("*, departments(id, name)")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.employees.unshift(cloneRecord(createPayload));
    return enrichEmployee(createPayload);
  }
};

export const updateEmployee = async (employeeId, payload, user) => {
  const updatePayload = createUpdatePayload(payload);

  try {
    let query = getSupabaseClient().from("employees").update(updatePayload).eq("id", employeeId);
    query = applyOrganizationScope(query, user);

    const { data, error } = await query.select("*, departments(id, name)").single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    const index = hrMemoryStore.employees.findIndex((record) => record.id === employeeId);
    if (index === -1) {
      return null;
    }

    hrMemoryStore.employees[index] = {
      ...hrMemoryStore.employees[index],
      ...cloneRecord(updatePayload),
    };

    return enrichEmployee(hrMemoryStore.employees[index]);
  }
};

export const deleteEmployee = async (employeeId, user) => {
  try {
    let query = getSupabaseClient().from("employees").delete().eq("id", employeeId);
    query = applyOrganizationScope(query, user);
    const { error } = await query;

    if (error) {
      throw error;
    }

    return true;
  } catch {
    const index = hrMemoryStore.employees.findIndex((record) => record.id === employeeId);
    if (index === -1) {
      return false;
    }

    hrMemoryStore.employees.splice(index, 1);
    return true;
  }
};

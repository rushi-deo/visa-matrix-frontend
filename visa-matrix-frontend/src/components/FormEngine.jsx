import { useEffect, useState } from "react";
import { getFormSchema } from "../services/formService";

const styles = {
  container: {
    display: "grid",
    gap: "1rem",
  },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
  },
  title: {
    margin: "0 0 1rem",
    fontSize: "1rem",
    fontWeight: 700,
  },
  fields: {
    display: "grid",
    gap: "0.875rem",
  },
  field: {
    display: "grid",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  input: {
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    font: "inherit",
    padding: "0.625rem 0.75rem",
    width: "100%",
  },
  debug: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.875rem",
    margin: 0,
    overflow: "auto",
    padding: "1rem",
  },
};

export default function FormEngine({ country, visaType }) {
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchFormSchema() {
      if (!country) {
        setFormSchema(null);
        setFormData({});
        return;
      }

      setLoading(true);

      const schema = await getFormSchema(country, visaType);

      if (isActive) {
        setFormSchema(schema);
        setFormData({});
        setLoading(false);
      }
    }

    fetchFormSchema();

    return () => {
      isActive = false;
    };
  }, [country, visaType]);

  function handleChange(fieldId, value) {
    setFormData((currentData) => ({
      ...currentData,
      [fieldId]: value,
    }));
  }

  if (!country) {
    return <p>Select a country</p>;
  }

  if (loading) {
    return <p>Loading form...</p>;
  }

  if (!formSchema) {
    return <p>No form found</p>;
  }

  return (
    <div style={styles.container}>
      {(formSchema.sections ?? []).map((section) => (
        <section key={section.id} style={styles.section}>
          <h3 style={styles.title}>{section.title}</h3>

          <div style={styles.fields}>
            {(section.fields ?? []).map((field) => (
              <label key={field.id} style={styles.field}>
                <span style={styles.label}>{field.label}</span>
                <input
                  required={field.required}
                  style={styles.input}
                  type={field.type}
                  value={formData[field.id] ?? ""}
                  onChange={(event) => handleChange(field.id, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <pre style={styles.debug}>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
}

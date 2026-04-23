import React from "react";

const normalizeOptions = (options) => {
  if (Array.isArray(options)) {
    return options;
  }

  return [];
};

const getOptionValue = (option) => {
  if (option && typeof option === "object") {
    return option.value ?? option.id ?? option.label ?? "";
  }

  return option ?? "";
};

const getOptionLabel = (option) => {
  if (option && typeof option === "object") {
    return option.label ?? option.name ?? option.value ?? "";
  }

  return option ?? "";
};

const getInputType = (questionType) => {
  if (questionType === "date" || questionType === "number") {
    return questionType;
  }

  return "text";
};

export default function DynamicForm({
  answers = {},
  onAnswerChange,
  onSubmit,
  questions = [],
}) {
  if (!questions.length) {
    return (
      <article className="placeholder-card">
        <strong>No questions configured for this country.</strong>
        <p className="empty-state">The backend returned an empty question set.</p>
      </article>
    );
  }

  const renderQuestionInput = (question) => {
    const value = answers[question.id] ?? "";

    if (question.type === "select") {
      const options = normalizeOptions(question.options);

      return (
        <select
          id={question.id}
          name={question.id}
          onChange={(event) => onAnswerChange?.(question.id, event.target.value)}
          required={question.required}
          value={value}
        >
          <option value="">Select an option</option>
          {options.map((option) => {
            const optionValue = String(getOptionValue(option));
            const optionLabel = String(getOptionLabel(option));

            return (
              <option key={optionValue || optionLabel} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      );
    }

    if (question.type === "boolean") {
      return (
        <div className="checkbox-row">
          <input
            checked={Boolean(answers[question.id])}
            id={question.id}
            name={question.id}
            onChange={(event) => onAnswerChange?.(question.id, event.target.checked)}
            type="checkbox"
          />
          <span>Yes</span>
        </div>
      );
    }

    return (
      <input
        id={question.id}
        name={question.id}
        onChange={(event) => onAnswerChange?.(question.id, event.target.value)}
        required={question.required}
        type={getInputType(question.type)}
        value={value}
      />
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        {questions.map((question) => (
          <div className="field" key={question.id}>
            <label htmlFor={question.id}>
              <span>
                {question.label}
                {question.required ? " *" : ""}
              </span>
            </label>
            {renderQuestionInput(question)}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          Save Answers
        </button>
      </div>
    </form>
  );
}

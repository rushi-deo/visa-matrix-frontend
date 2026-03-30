import { createValidationError } from "../errors.js";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const wrapValidator = (parser, options = {}) => ({
  optional: options.optional ?? false,
  defaultValue: options.defaultValue,
  parse(value, fieldName) {
    if (value === undefined || value === null || value === "") {
      if (this.optional) {
        return this.defaultValue;
      }

      throw createValidationError(`Field "${fieldName}" is required.`);
    }

    return parser(value, fieldName);
  },
});

export const dto = {
  string(options = {}) {
    return wrapValidator((value, fieldName) => {
      if (typeof value !== "string") {
        throw createValidationError(`Field "${fieldName}" must be a string.`);
      }

      const normalizedValue = options.trim === false ? value : value.trim();
      if (!options.allowEmpty && normalizedValue.length === 0) {
        throw createValidationError(`Field "${fieldName}" cannot be empty.`);
      }

      return normalizedValue;
    }, options);
  },
  number(options = {}) {
    return wrapValidator((value, fieldName) => {
      const parsedValue = Number(value);
      if (!Number.isFinite(parsedValue)) {
        throw createValidationError(`Field "${fieldName}" must be a number.`);
      }

      if (options.min !== undefined && parsedValue < options.min) {
        throw createValidationError(`Field "${fieldName}" must be >= ${options.min}.`);
      }

      return parsedValue;
    }, options);
  },
  boolean(options = {}) {
    return wrapValidator((value, fieldName) => {
      if (typeof value === "boolean") {
        return value;
      }

      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      throw createValidationError(`Field "${fieldName}" must be a boolean.`);
    }, options);
  },
  enumeration(values, options = {}) {
    return wrapValidator((value, fieldName) => {
      if (!values.includes(value)) {
        throw createValidationError(`Field "${fieldName}" must be one of: ${values.join(", ")}.`);
      }

      return value;
    }, options);
  },
  array(itemValidator = null, options = {}) {
    return wrapValidator((value, fieldName) => {
      if (!Array.isArray(value)) {
        throw createValidationError(`Field "${fieldName}" must be an array.`);
      }

      if (!itemValidator) {
        return value;
      }

      return value.map((item, index) => itemValidator.parse(item, `${fieldName}[${index}]`));
    }, options);
  },
  object(shape = {}, options = {}) {
    return wrapValidator((value, fieldName) => {
      if (!isPlainObject(value)) {
        throw createValidationError(`Field "${fieldName}" must be an object.`);
      }

      return createSchema(shape).parse(value);
    }, options);
  },
  json(options = {}) {
    return wrapValidator((value, fieldName) => {
      if (!isPlainObject(value) && !Array.isArray(value)) {
        throw createValidationError(`Field "${fieldName}" must be a JSON object or array.`);
      }

      return value;
    }, options);
  },
};

export const createSchema = (shape) => ({
  parse(payload = {}) {
    if (!isPlainObject(payload)) {
      throw createValidationError("Payload must be a valid object.");
    }

    return Object.entries(shape).reduce((result, [fieldName, validator]) => {
      const parsedValue = validator.parse(payload[fieldName], fieldName);
      if (parsedValue !== undefined) {
        result[fieldName] = parsedValue;
      }

      return result;
    }, {});
  },
});


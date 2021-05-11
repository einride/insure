type ValidationEntry<T> = (value: unknown) => T;

type ValidationSpec<Entries extends Record<string, unknown>> = {
  [Name in keyof Entries]: ValidationEntry<Entries[Name]>;
};

export function createValidator<Prefs extends Record<string, unknown>>(
  spec: ValidationSpec<Prefs>
) {
  return function validate(maybePrefs: unknown): Prefs {
    const source = (typeof maybePrefs === "object"
      ? { ...maybePrefs }
      : {}) as Partial<Prefs>;

    const output: Record<string, unknown> = {};
    for (const name of Object.keys(spec)) {
      const validate = spec[name];
      output[name] = validate(source[name]);
    }

    return output as Prefs;
  };
}

export function either<T>(valid: T[]) {
  const validEntries = new Set<T>(valid);
  const initial = valid[0];

  return function validate(value: unknown) {
    if (validEntries.has(value as T)) {
      return value as T;
    }

    return initial;
  };
}

export function string<T extends string | undefined>(initial: T) {
  return function validate(value: unknown) {
    if (typeof value === "string") {
      return value as T;
    }

    return initial;
  };
}

export function number<T extends number | undefined>(initial: T) {
  return function validate(value: unknown) {
    if (typeof value === "number") {
      return value as T;
    }

    return initial;
  };
}

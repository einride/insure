# Insure

Library for building validation functions to protect against runtime type errors. Applicable for when you unserialize data which has lost its TypeScript contract, for example user settings stored in LocalStorage. 

```ts
type Prefs = {
  language: "english" | "spanish";
  itemsPerPage: number;
};

const serializedData = window.localStorage.getItem("user-prefs");

// May crash application despite behaving like it is typed.
const unsafe = JSON.parse(serializedData) as Prefs;

const validate = createValidator<Prefs>({
  language: either(["english", "spanish"]),
  itemsPerPage: number(10),
});

// Will ensure that `safe` is compatible with `Prefs` type.
const safe = validate(JSON.parse(serializedData));
```

This lib is not recommended for user input validation where the user may need feedback on poorly formed data.

## Usage

A basic example of a typed insurance pattern.

```ts
import { createValidator, number, string } from "@einride/insure";

type Union = "a" | "b" | "c";

type Shape = {
  optionalEither?: Union;
  requiredEitherAll: Union;
  requiredEitherSome: Union;
  optionalString?: string;
  requiredString: string;
  optionalNumber?: number;
  requiredNumber: number;
};

const validate = createValidator<Shape>({
  optionalEither: either([undefined]),
  requiredEitherAll: either(["a", "b", "c"]),
  requiredEitherSome: either(["c"]),
  optionalString: string(undefined),
  requiredString: string("ABCD"),
  optionalNumber: number(undefined),
  requiredNumber: number(12345),
});
```

Nested example.

```ts
import { createValidator, number, string } from "@einride/insure";

type A = {
  a: number;
  b: string;
};

type B = {
  c: number;
  d: string;
};

const validateA = createValidator<A>({
  a: number(1),
  b: string("A"),
});

const validateB = createValidator<B>({
  c: number(2),
  d: string("B"),
});

const validate = createValidator({
  a: validateA,
  b: validateB,
});
```

Types will be inferred if unspecifed. Some types, like unions, may not behave like you expect unless explicitly defined.

```ts
import { createValidator, number, string } from "@einride/insure";

const validate = createValidator({
  a: number(1),
  b: string("A"),
});

const data = validate({});
```

By validating an empty object you create the default values.

```ts
import { createValidator, number, string } from "@einride/insure";

type TimeFormat = "HH:mm" | "hh:mm A";

const validate = createValidator({
  searchHistoryLength: number(100),
  timeFormat: either<TimeFormat>(["HH:mm", "hh:mm A"]),
});

const DEFAULT_VALUES = validate({});
```

In most cases you will always pass your data thru the validator function and implicitly get defaults.

```ts
import { createValidator, number, string } from "@einride/insure";

type TimeFormat = "HH:mm" | "hh:mm A";

const validate = createValidator({
  searchHistoryLength: number(100),
  timeFormat: either<TimeFormat>(["HH:mm", "hh:mm A"]),
});

function readPrefs() {
    try {
        const serializedData = window.localStorage.getItem("prefs"):
        return JSON.parse(serializedData);
    } catch (error) {
        console.error("Pref parsing failed", error);
        return null;
    }
}

export function getDevicePreferences() {
    const prefs = readPrefs();
    return validate(prefs);
}
```

### Value types

- Number

  The number validator will only let numbers pass thru.
  No type casting will be attempted.
  Allows default to be `undefined`.

  ```ts
  const validate = createValidator({
    size: number(1),
  });

  validate({ size: "foo" }); // Returns {size: 1}
  validate({ size: "5" }); // Returns {size: 1}
  validate({ size: 20 }); // Returns {size: 20}
  ```

- String

  The string validator will only let strings pass thru.
  No type casting will be attempted.
  Allows default to be `undefined`.

  ```ts
  const validate = createValidator({
    defaultId: string(undefined),
  });

  validate({ defaultId: "v8aewbng39" }); // Returns {defaultId: "v8aewbng39"}
  validate({ defaultId: "5" }); // Returns {defaultId: "5"}
  validate({ defaultId: 1234 }); // Returns {defaultId: undefined}
  ```

- Either (one of)

  The either validator will only let values that exist in a set thru.
  No type casting will be attempted.
  Default value will be the value on index 0 of the array of allowed values supplied.
  Allows default to be `undefined`.

  ```ts
  const validate = createValidator({
    language: either(["english", "spanish"]),
  });

  validate({ language: "spanish" }); // Returns {language: "spanish"}
  validate({ language: "italian" }); // Returns {language: "english"}
  validate({ language: false }); // Returns {language: "english"}
  ```

### Custom validators

The only contract for a validator function is that it takes an unknown type, and returns a known type. It should fulfill the [TypeScript Guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) pattern.

```ts
type ValidationEntry<T> = (value: unknown) => T;
```

Basic example.

```ts
function min16Len(value: unknown): string {
  if (typeof value === "string") {
    if (value.length > 15) {
      return value;
    }
  }
  return undefined;
}
```

Validators that require a state can be created using a higher-order function. This is useful when a default should be provided or its implementation characteristics should be configurable.

```ts
function minLen(min: number, fallback: string) {
  return function validate(value: unknown): string {
    if (typeof value === "string") {
      if (value.length > min) {
        return value;
      }
    }
    return fallback;
  }
}

const validator = createValidator({
  defaultId: minLen(16, "abcdefghijklmnopqrstuvwxyz"),
});
```

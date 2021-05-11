# Insure

Library for building insurance layers for unknown data.

Applicable for when you get data from Local Storage and user input.

This lib is not useful for user input validation where the user may need feedback on ill-formed data.

## Usage

A basic example of a typed insurance pattern.

```ts
import { createValidator, number, string } from "@einride/insure";

type Union = "a" | "b" | "c";

type Struct = {
  optionalEither?: Union;
  requiredEitherAll: Union;
  requiredEitherSome: Union;
  optionalString?: string;
  requiredString: string;
  optionalNumber?: number;
  requiredNumber: number;
};

const validate = createValidator<Struct>({
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

Types will be inferred unspecifed. Some types, like unions, may not behave like you expect unless explicitly defined.

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

import { createValidator, number, either, string } from "../validation";

describe("Validation", () => {
  describe("#createValidator", () => {
    it("returns a validation function", () => {
      const validate = createValidator({
        foo: () => 1,
      });

      expect(validate).toBeInstanceOf(Function);
    });

    it("works well with a well defined type structure", () => {
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

      expect(validate({})).toEqual({
        optionalEither: undefined,
        optionalNumber: undefined,
        optionalString: undefined,
        requiredEitherAll: "a",
        requiredEitherSome: "c",
        requiredNumber: 12345,
        requiredString: "ABCD",
      });
    });

    it("supports nesting", () => {
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

      expect(
        validate({
          a: { a: 1000 },
          b: { d: "Q" },
        })
      ).toEqual({
        a: {
          a: 1000,
          b: "A",
        },
        b: {
          c: 2,
          d: "Q",
        },
      });
    });

    it("is capable of type inference", () => {
      createValidator({
        a: number(1),
        b: string("A"),
        c: either([1, "a"]),
      });
    });

    it("gracefully handles bad input", () => {
      const validator = createValidator({
        a: number(1),
        b: string("A"),
      });

      expect(validator(undefined)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validator(null)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validator([])).toEqual({
        a: 1,
        b: "A",
      });

      expect(validator("")).toEqual({
        a: 1,
        b: "A",
      });

      expect(validator(2124)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validator(NaN)).toEqual({
        a: 1,
        b: "A",
      });
    });

    describe("validation function", () => {
      it("ignores values not in spec", () => {
        const validate = createValidator({
          foo: () => 1,
        });

        expect(validate({ bar: 2 })).toEqual({ foo: 1 });
      });
    });

    describe("either validator", () => {
      let validate: ReturnType<typeof createValidator>;

      beforeEach(() => {
        validate = createValidator({
          foo: either([3, 2]),
        });
      });

      it("allows a valid value", () => {
        expect(validate({ foo: 2 })).toEqual({ foo: 2 });
      });

      it("uses default for invalid value", () => {
        expect(validate({ foo: 1 })).toEqual({ foo: 3 });
      });

      it("uses default no value", () => {
        expect(validate({})).toEqual({ foo: 3 });
      });
    });

    describe("string validator", () => {
      it("allows a string", () => {
        const validate = createValidator({
          foo: string(undefined),
        });

        expect(validate({ foo: "a string" })).toEqual({ foo: "a string" });
      });

      it("returns default if not a string", () => {
        const validate = createValidator({
          foo: string("default text"),
        });

        expect(validate({})).toEqual({ foo: "default text" });
        expect(validate({ foo: 2 })).toEqual({ foo: "default text" });
        expect(validate({ foo: true })).toEqual({ foo: "default text" });
      });
    });

    describe("number validator", () => {
      it("allows a number", () => {
        const validate = createValidator({
          foo: number(undefined),
        });

        expect(validate({ foo: 124124.222 })).toEqual({ foo: 124124.222 });
      });

      it("returns default if not a string", () => {
        const validate = createValidator({
          foo: number(13382),
        });

        expect(validate({})).toEqual({ foo: 13382 });
        expect(validate({ foo: "133384" })).toEqual({ foo: 13382 });
        expect(validate({ foo: true })).toEqual({ foo: 13382 });
      });
    });
  });
});

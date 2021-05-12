import { createValidator, number, either, string } from "../validation";

describe("Validation", () => {
  describe("#createValidator", () => {
    it("returns a validation function", () => {
      const validate = createValidator({
        foo: () => 1,
      });

      expect(validate).toBeInstanceOf(Function);
    });

    it("works well with a defined type structure", () => {
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
      const validate = createValidator({
        a: number(1),
        b: string("A"),
      });

      expect(validate(undefined)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validate(null)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validate([])).toEqual({
        a: 1,
        b: "A",
      });

      expect(validate("")).toEqual({
        a: 1,
        b: "A",
      });

      expect(validate(2124)).toEqual({
        a: 1,
        b: "A",
      });

      expect(validate(NaN)).toEqual({
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
      it("allows a valid value", () => {
        const validate = createValidator({
          foo: either([3, 2]),
        });

        expect(validate({ foo: 2 })).toEqual({ foo: 2 });
      });

      it("uses default for invalid value", () => {
        const validate = createValidator({
          foo: either([3, 2]),
        });

        expect(validate({ foo: 1 })).toEqual({ foo: 3 });
      });

      it("uses default when there is no value", () => {
        const validate = createValidator({
          foo: either([3, 2]),
        });

        expect(validate({})).toEqual({ foo: 3 });
      });

      it("allows undefined as default", () => {
        const validate = createValidator({
          foo: either([undefined, 3, 2]),
        });

        expect(validate({ foo: 10 })).toEqual({ foo: undefined });
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

      it("returns default if not a number", () => {
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

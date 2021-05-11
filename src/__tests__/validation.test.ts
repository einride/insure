import { createValidator, number, either, string } from "../validation";

describe("Validation", () => {
  describe("#createValidator", () => {
    it("returns a validation function", () => {
      const validate = createValidator({
        foo: () => 1,
      });

      expect(validate).toBeInstanceOf(Function);
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

import * as source from "../validation";
import * as index from "../index";

it("exports everything", () => {
  expect(source).toEqual(index);
});

import { getErrorMessage } from "@/lib/get-error-message";

describe("getErrorMessage", () => {
  it("should return the message if error is an instance of Error", () => {
    const error = new Error("This is an error");
    const result = getErrorMessage(error);
    expect(result).toBe("This is an error");
  });

  it("should stringify the error if it is a plain object", () => {
    const errorObject = { message: "This is an error message" };
    const result = getErrorMessage(errorObject);
    expect(result).toBe(JSON.stringify(errorObject));
  });

  it("should stringify the error if it is a string", () => {
    const errorString = "String error";
    const result = getErrorMessage(errorString);
    expect(result).toBe(JSON.stringify(errorString));
  });

  it("should stringify the error if it is a number", () => {
    const errorNumber = 404;
    const result = getErrorMessage(errorNumber);
    expect(result).toBe(JSON.stringify(errorNumber));
  });

  it("should handle null or undefined gracefully", () => {
    const resultForNull = getErrorMessage(null);
    expect(resultForNull).toBe("null");

    const resultForUndefined = getErrorMessage(undefined);
    expect(resultForUndefined).toBe(undefined); // JSON.stringify(undefined) returns undefined
  });
});

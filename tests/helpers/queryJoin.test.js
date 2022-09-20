import { queryJoin } from "../../src/helpers/index.js";

describe("query join helper functions", () => {
  it("should return null when parameters object is not init or has no fields", () => {
    // Given
    const testObj = {};

    // When
    const queryJoinString = queryJoin(testObj);
    const queryJoinString1 = queryJoin();

    // Then
    expect(queryJoinString).toBe(null);
    expect(queryJoinString1).toBe(null);
  });

  it("should return expected string", () => {
    // Given
    const expectedString = `a = "a",b = 1,c = "2"`;
    const expectedString1 = "a as ax,b as bx,c as cx";
    const expectedString2 = "a,b,c,d";
    const expectedString3 = "a is null,b is null,c is null,d is null";

    // When
    const queryJoinString = queryJoin({ paramsObj: { a: "a", b: 1, c: "2" } });
    const queryJoinString1 = queryJoin({
      paramsObj: {
        a: { value: "ax", operators: "as" },
        b: { value: "bx", operators: "as" },
        c: { value: "cx", operators: "as" },
      },
    });
    const queryJoinString2 = queryJoin({
      paramsObj: { a: true, b: true, c: true, d: true },
    });
    const queryJoinString3 = queryJoin({
      paramsObj: {
        a: { value: null, operators: "is" },
        b: { value: null, operators: "is" },
        c: { value: null, operators: "is" },
        d: { value: null, operators: "is" },
      },
    });

    // Then
    expect(queryJoinString).toBe(expectedString);
    expect(queryJoinString1).toBe(expectedString1);
    expect(queryJoinString2).toBe(expectedString2);
    expect(queryJoinString3).toBe(expectedString3);
  });
});

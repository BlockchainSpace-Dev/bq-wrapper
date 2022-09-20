import { handleResponse } from "../../src/helpers/index.js";

describe("handle response helper functions", () => {
  it("should return with expected object", () => {
    // Given
    const expectedResponse = {
      status: "success",
      error: null,
      query: null,
      totalRows: 0,
      totalBytesProcessed: 0,
      data: null,
    };

    const expectedResponse1 = {
      ...expectedResponse,
      error: new Error("testing error"),
      query: "SELECT * from testing",
    };

    const expectedResponse2 = {
      ...expectedResponse1,
      totalRows: 1,
      totalBytesProcessed: 2,
    };

    const expectedResponse3 = {
      ...expectedResponse2,
      data: {},
    };

    const testObj = {
      error: new Error("testing error"),
      query: "SELECT * from testing",
    };

    // When
    const response = handleResponse();
    const response1 = handleResponse(testObj);
    const response2 = handleResponse({
      ...testObj,
      process: { totalRows: 1, totalBytesProcessed: 2 },
    });
    const response3 = handleResponse({
      ...testObj,
      process: { totalRows: 1, totalBytesProcessed: 2, data: {} },
    });

    // Then
    expect(response).toStrictEqual(expectedResponse);
    expect(response1).toStrictEqual(expectedResponse1);
    expect(response2).toStrictEqual(expectedResponse2);
    expect(response3).toStrictEqual(expectedResponse3);
  });
});

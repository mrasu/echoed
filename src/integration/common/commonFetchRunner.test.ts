import { CommonFetchRunner } from "@/integration/common/commonFetchRunner";

describe("CommonFetchRunner", () => {
  describe("run", () => {
    it("should call fetch with hook", async () => {
      const mockFetch = jest.fn().mockReturnValue(new Response());
      const mockOnStart = jest.fn();
      const mockOnFinished = jest.fn();

      const runner = new CommonFetchRunner(mockFetch);
      await runner.run(
        "https://example.com",
        undefined,
        mockOnStart,
        mockOnFinished,
      );

      expect(mockFetch).toHaveBeenCalled();
      expect(mockFetch.mock.calls[0]).toEqual([
        "https://example.com",
        {
          headers: {
            traceparent: expect.any(String) as string,
          },
        },
      ]);

      expect(mockOnStart).toHaveBeenCalled();
      expect(mockOnFinished).toHaveBeenCalled();
    });
  });
});

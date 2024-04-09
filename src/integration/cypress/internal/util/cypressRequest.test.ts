import {
  isEchoedHttpRequest,
  isEchoedRequestOption,
} from "@/integration/cypress/internal/util/cypressRequest";
import { ECHOED_USER_AGENT } from "@/server/request";
import { buildCypressRequest } from "@/testUtil/cypress/request";

describe("isEchoedHttpRequest", () => {
  describe("when the request is from echoed", () => {
    describe("when header is array", () => {
      it("should return true", () => {
        const request = buildCypressRequest({
          headers: {
            "User-Agent": [ECHOED_USER_AGENT],
          },
        });
        expect(isEchoedHttpRequest(request)).toBe(true);
      });
    });

    describe("when header is string", () => {
      it("should return true", () => {
        const request = buildCypressRequest({
          headers: {
            "User-Agent": ECHOED_USER_AGENT,
          },
        });
        expect(isEchoedHttpRequest(request)).toBe(true);
      });
    });
  });

  describe("when the request is not from echoed", () => {
    it("should return false", () => {
      const request = buildCypressRequest({
        headers: {
          "User-Agent": [
            "Mozilla/5.0 (..) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/x.x.x",
          ],
        },
      });
      expect(isEchoedHttpRequest(request)).toBe(false);
    });
  });
});

describe("isEchoedRequestOption", () => {
  describe("when the option is made by echoed", () => {
    describe("when header is array", () => {
      it("should return true", () => {
        const request: Partial<Cypress.RequestOptions> = {
          headers: {
            "User-Agent": [ECHOED_USER_AGENT],
          },
        };
        expect(isEchoedRequestOption(request)).toBe(true);
      });
    });

    describe("when header is string", () => {
      it("should return true", () => {
        const request: Partial<Cypress.RequestOptions> = {
          headers: {
            "User-Agent": ECHOED_USER_AGENT,
          },
        };
        expect(isEchoedRequestOption(request)).toBe(true);
      });
    });
  });

  describe("when the option is not made by echoed", () => {
    it("should return false", () => {
      const request: Partial<Cypress.RequestOptions> = {
        headers: {
          "User-Agent": [
            "Mozilla/5.0 (..) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/x.x.x",
          ],
        },
      };
      expect(isEchoedRequestOption(request)).toBe(false);
    });
  });

  describe("when the option doesn't have headers", () => {
    it("should return false", () => {
      const request: Partial<Cypress.RequestOptions> = {};
      expect(isEchoedRequestOption(request)).toBe(false);
    });
  });
});

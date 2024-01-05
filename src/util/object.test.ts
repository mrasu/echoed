import { override } from "@/util/object";

type A = {
  a?: number;
  b?: {
    c?: number;
    d?: number;
  };
  e?: number;
  f?: [
    {
      g?: number;
    },
  ];
};

describe("override", () => {
  const buildBaseTarget = (): A => {
    return {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
      e: 4,
      f: [
        {
          g: 5,
        },
      ],
    };
  };

  describe("when source is empty", () => {
    it("should override nothing", () => {
      const target = buildBaseTarget();

      expect(override(target, {})).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
        e: 4,
        f: [
          {
            g: 5,
          },
        ],
      });
    });
  });

  describe("when source has undefined fields", () => {
    it("should replace to source's array", () => {
      const target = buildBaseTarget();
      const source: A = {
        a: 11,
        b: {
          c: 12,
        },
      };

      expect(override(target, source)).toEqual({
        a: 11,
        b: {
          c: 12,
          d: 3,
        },
        e: 4,
        f: [
          {
            g: 5,
          },
        ],
      });
    });
  });

  describe("when source has array fields", () => {
    it("should override only existing field", () => {
      const target = buildBaseTarget();
      const source: A = {
        f: [
          {
            g: 15,
          },
        ],
      };

      expect(override(target, source)).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
        e: 4,
        f: [
          {
            g: 15,
          },
        ],
      });
    });
  });
});

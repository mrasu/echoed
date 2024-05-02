import { z } from "zod";

export const FixturesSchema = z.array(z.string());
export type FixturesSchema = z.infer<typeof FixturesSchema>;

export class Fixtures {
  static parse(schema: FixturesSchema): Fixtures {
    return new Fixtures(schema);
  }

  constructor(public readonly fixtures: string[]) {}

  toTs(): string {
    return this.fixtures.join(", ");
  }
}

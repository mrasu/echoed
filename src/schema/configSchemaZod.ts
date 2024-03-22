import { Methods } from "@/type/http";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

const attributeRecord = z.record(
  z.string(),
  z
    .string()
    .or(z.boolean())
    .or(z.number())
    .or(z.strictObject({ regexp: z.string() })),
);

const propagationIgnoreAttributes = z.strictObject({
  attributes: attributeRecord.optional(),
  resource: z
    .object({
      attributes: attributeRecord.optional(),
    })
    .optional(),
});

const stringOrRegexp = z.string().or(z.strictObject({ regexp: z.string() }));

export const ConfigSchemaZod = z.strictObject({
  output: z.string(),
  serverPort: z.number().optional(),
  serverStopAfter: z.number().optional(),
  debug: z.boolean().optional(),
  services: z
    .array(
      z.strictObject({
        name: z.string(),
        namespace: z.string().optional(),
        openapi: z
          .union([
            z.string(),
            z.strictObject({
              filePath: z.string(),
              basePath: z.string().optional(),
              coverage: z
                .strictObject({
                  undocumentedOperation: z.strictObject({
                    ignores: z.array(
                      z.strictObject({
                        path: stringOrRegexp,
                        method: z.enum(Methods),
                      }),
                    ),
                  }),
                })
                .optional(),
            }),
          ])
          .optional(),
        proto: z
          .union([
            z.string(),
            z.strictObject({
              filePath: z.string(),
              services: z.array(z.string()).optional(),
              coverage: z
                .strictObject({
                  undocumentedMethod: z.strictObject({
                    ignores: z.array(
                      z.strictObject({
                        service: stringOrRegexp,
                        method: stringOrRegexp,
                      }),
                    ),
                  }),
                })
                .optional(),
            }),
          ])
          .optional(),
      }),
    )
    .optional(),
  propagationTest: z
    .object({
      enabled: z.boolean().optional(),
      ignore: propagationIgnoreAttributes
        .merge(
          z.strictObject({
            conditions: z.array(propagationIgnoreAttributes).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  scenario: z
    .object({
      compile: z
        .object({
          outDir: z.string().optional(),
          cleanOutDir: z.boolean().optional(),
          yamlDir: z.string().optional(),
          retry: z.number().optional(),
          env: z.record(z.string().nullable()).optional(),
          plugin: z
            .object({
              runners: z
                .array(
                  z.strictObject({
                    module: z.string(),
                    name: z.string(),
                    option: z.record(JsonSchema).optional(),
                  }),
                )
                .optional(),
              asserters: z
                .array(
                  z.strictObject({
                    module: z.string(),
                    name: z.string(),
                    option: z.record(JsonSchema).optional(),
                  }),
                )
                .optional(),
              commons: z
                .array(
                  z.strictObject({
                    module: z.string(),
                    names: z.array(z.string()).optional(),
                    default: z.string().optional(),
                  }),
                )
                .optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  overrides: z.array(z.string()).optional(),
});

export type ConfigSchemaZod = z.infer<typeof ConfigSchemaZod>;

export const PartialConfigSchemaZod = ConfigSchemaZod.partial();
export type PartialConfigSchemaZod = z.infer<typeof PartialConfigSchemaZod>;

import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

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
            }),
          ])
          .optional(),
        proto: z
          .union([
            z.string(),
            z.strictObject({
              filePath: z.string(),
              services: z.array(z.string()).optional(),
            }),
          ])
          .optional(),
      }),
    )
    .optional(),
  propagationTest: z
    .object({
      enabled: z.boolean().optional(),
      ignore: z
        .object({
          attributes: z
            .record(z.string(), z.string().or(z.boolean()).or(z.number()))
            .optional(),
          resource: z
            .object({
              attributes: z
                .record(z.string(), z.string().or(z.boolean()).or(z.number()))
                .optional(),
            })
            .optional(),
        })
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

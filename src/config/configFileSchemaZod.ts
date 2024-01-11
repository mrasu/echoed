import { z } from "zod";

export const ConfigFileSchemaZod = z.object({
  output: z.string(),
  serverPort: z.number().optional(),
  serverStopAfter: z.number().optional(),
  debug: z.boolean().optional(),
  services: z
    .array(
      z.object({
        name: z.string(),
        namespace: z.string().optional(),
        openapi: z
          .union([
            z.string(),
            z.object({
              filePath: z.string(),
              basePath: z.string().optional(),
            }),
          ])
          .optional(),
        proto: z
          .union([
            z.string(),
            z.object({
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
  overrides: z.array(z.string()).optional(),
});

export type ConfigFileSchemaZod = z.infer<typeof ConfigFileSchemaZod>;

export const PartialConfigFileSchemaZod = ConfigFileSchemaZod.partial();
export type PartialConfigFileSchemaZod = z.infer<
  typeof PartialConfigFileSchemaZod
>;

import { z } from 'zod';

// Permissive schema: only validate fields the converter actually reads.
// Suunto export files contain hundreds of fields per sample and the device firmware
// adds new fields/variants over time, so a strict schema breaks on unfamiliar data.
// Unknown keys are allowed and stripped by zod's default object behaviour.

const sampleSchema = z.object({
  TimeISO8601: z.string(),
  Depth: z.number().optional(),
  NoDecTime: z.number().optional(),
  Temperature: z.number().optional(),
  TimeToSurface: z.number().optional(),
  Ceiling: z.number().optional(),
  RtGradientFactors: z
    .object({
      gf99: z.number().optional(),
      gfSurface: z.number().optional(),
    })
    .optional(),
  Cylinders: z
    .array(
      z.object({
        Pressure: z.number().nullable().optional(),
      }),
    )
    .optional(),
  DiveEvents: z
    .object({
      DiveStatus: z.boolean().optional(),
    })
    .optional(),
  DiveRouteOrigin: z
    .object({
      Latitude: z.number(),
      Longitude: z.number(),
    })
    .optional(),
});

const windowEntrySchema = z.object({
  TimeISO8601: z.string(),
  Window: z
    .object({
      DiveRecoveryTime: z.number().nullable().optional(),
    })
    .optional(),
});

export const suuntoDiveLogSchema = z.object({
  DeviceLog: z.object({
    Header: z.object({
      DateTime: z.string(),
      Depth: z.object({ Max: z.number() }),
      DepthAverage: z.number(),
      DiveTime: z.number(),
      Duration: z.number(),
      Notes: z.string().nullable().optional(),
      Device: z.object({
        Name: z.string(),
        SerialNumber: z.string(),
        Info: z.object({
          SW: z.string(),
        }),
      }),
    }),
    Samples: z.array(sampleSchema),
    Windows: z.array(windowEntrySchema),
  }),
});

export type SuuntoDiveLog = z.infer<typeof suuntoDiveLogSchema>;

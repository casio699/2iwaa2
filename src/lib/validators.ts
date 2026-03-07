import { z } from "zod";

export const createReportSchema = z.object({
  type: z.enum(["shelter_status", "threat", "damage", "general"]),
  titleAr: z.string().min(3).max(200),
  titleLb: z.string().min(1).max(200).optional(),
  descriptionAr: z.string().max(2000).optional(),
  descriptionLb: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  shelterId: z.string().optional(),
  evidenceUrl: z.string().url().optional(),
});

export const createAlertSchema = z.object({
  titleAr: z.string().min(3).max(200),
  titleLb: z.string().min(1).max(200).optional(),
  bodyAr: z.string().min(3).max(2000),
  bodyLb: z.string().min(1).max(2000).optional(),
  severity: z.enum(["urgent", "warning", "info"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().int().min(50).max(200000).optional(),
});

export const createAreaSubscriptionSchema = z.object({
  areaNameAr: z.string().min(2).max(100),
  areaNameLb: z.string().min(1).max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(50).max(200000),
  webPushSubscriptionJson: z.string().optional(),
  telegramChatId: z.string().optional(),
});

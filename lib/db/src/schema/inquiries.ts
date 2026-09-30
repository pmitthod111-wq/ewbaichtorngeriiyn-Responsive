import { createInsertSchema } from "drizzle-zod";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const inquiryTopicEnum = pgEnum("inquiry_topic", [
  "visit",
  "admission",
  "3d",
  "general",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "in_progress",
  "resolved",
]);

export const inquiriesTable = pgTable("school_inquiries", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  contact: text("contact").notNull(),
  topic: inquiryTopicEnum("topic").notNull(),
  message: text("message"),
  status: inquiryStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
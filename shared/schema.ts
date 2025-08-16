import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  distance: varchar("distance"),
  rating: varchar("rating"),
  isOpen: boolean("is_open").default(true),
  services: text("services").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id),
  doctorName: varchar("doctor_name"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(45), // minutes
  type: varchar("type").notNull(), // 'clinic', 'video'
  status: varchar("status").default('scheduled'), // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatLogs = pgTable("chat_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  sentiment: varchar("sentiment"), // 'positive', 'negative', 'neutral'
  escalationNeeded: boolean("escalation_needed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionnaireResults = pgTable("questionnaire_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  responses: jsonb("responses").notNull(), // Store all Q&A pairs
  riskScore: integer("risk_score"), // 0-100
  category: varchar("category"), // 'sleep', 'mood', 'stress', 'energy'
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  reminderTime: timestamp("reminder_time").notNull(),
  type: varchar("type").notNull(), // 'appointment', 'medication', 'meditation'
  isRecurring: boolean("is_recurring").default(false),
  frequency: varchar("frequency"), // 'daily', 'weekly', 'monthly'
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meditationSessions = pgTable("meditation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  category: varchar("category").notNull(), // 'sleep', 'anxiety', 'focus', 'self-love'
  audioUrl: varchar("audio_url"),
  imageUrl: varchar("image_url"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  streak: integer("streak").default(0),
  totalSessions: integer("total_sessions").default(0),
  totalMinutes: integer("total_minutes").default(0),
  lastMeditationDate: timestamp("last_meditation_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertChatLogSchema = createInsertSchema(chatLogs).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionnaireResultSchema = createInsertSchema(questionnaireResults).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertMeditationSessionSchema = createInsertSchema(meditationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertQuestionnaireResult = z.infer<typeof insertQuestionnaireResultSchema>;
export type QuestionnaireResult = typeof questionnaireResults.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertMeditationSession = z.infer<typeof insertMeditationSessionSchema>;
export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  clinics,
  appointments,
  chatLogs,
  questionnaireResults,
  reminders,
  meditationSessions,
  userProgress,
  insertAppointmentSchema,
  insertChatLogSchema,
  insertQuestionnaireResultSchema,
  insertReminderSchema,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Clinics routes
  app.get("/api/clinics", isAuthenticated, async (req, res) => {
    try {
      const allClinics = await db.select().from(clinics);
      res.json(allClinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      res.status(500).json({ message: "Failed to fetch clinics" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.userId, userId))
        .orderBy(desc(appointments.appointmentDate));
      res.json(userAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const [newAppointment] = await db
        .insert(appointments)
        .values(appointmentData)
        .returning();
      
      res.json(newAppointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Chatbot routes
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a compassionate mental health support assistant for HerVital, an app serving rural communities. 
            Provide supportive, empathetic responses while being mindful of cultural sensitivity. 
            If the user expresses severe distress, suicidal thoughts, or immediate danger, respond with concern and suggest they seek immediate professional help or emergency services.
            Keep responses concise but caring. Focus on self-care tips, coping strategies, and emotional support.
            If appropriate, suggest booking an appointment or trying meditation features within the app.
            Respond in JSON format with: { "response": "your message", "sentiment": "positive/negative/neutral", "escalationNeeded": true/false, "suggestedActions": ["action1", "action2"] }`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Log the conversation
      const chatData = insertChatLogSchema.parse({
        userId,
        message,
        response: aiResponse.response,
        sentiment: aiResponse.sentiment,
        escalationNeeded: aiResponse.escalationNeeded || false,
      });

      await db.insert(chatLogs).values(chatData);

      res.json(aiResponse);
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Questionnaire routes
  app.post("/api/questionnaire", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { responses, category } = req.body;

      if (!responses || !category) {
        return res.status(400).json({ message: "Responses and category are required" });
      }

      // Calculate risk score based on responses (simple algorithm)
      let riskScore = 0;
      const responseValues = Object.values(responses) as string[];
      
      responseValues.forEach((response: string) => {
        if (response.includes('poor') || response.includes('very') || response.includes('severe')) {
          riskScore += 25;
        } else if (response.includes('fair') || response.includes('sometimes')) {
          riskScore += 15;
        } else if (response.includes('good')) {
          riskScore += 5;
        }
      });

      riskScore = Math.min(riskScore, 100);

      // Generate recommendations based on score
      let recommendations = [];
      if (riskScore > 70) {
        recommendations = ["Schedule video consultation", "Contact crisis hotline if needed", "Try daily meditation"];
      } else if (riskScore > 40) {
        recommendations = ["Book appointment with healthcare provider", "Start meditation practice", "Monitor symptoms"];
      } else {
        recommendations = ["Continue healthy habits", "Regular check-ins", "Maintain wellness routine"];
      }

      const questionnaireData = insertQuestionnaireResultSchema.parse({
        userId,
        responses,
        riskScore,
        category,
        recommendations,
      });

      const [result] = await db
        .insert(questionnaireResults)
        .values(questionnaireData)
        .returning();

      res.json(result);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      res.status(500).json({ message: "Failed to save questionnaire" });
    }
  });

  app.get("/api/questionnaire/latest", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [latest] = await db
        .select()
        .from(questionnaireResults)
        .where(eq(questionnaireResults.userId, userId))
        .orderBy(desc(questionnaireResults.createdAt))
        .limit(1);
      
      res.json(latest || null);
    } catch (error) {
      console.error("Error fetching latest questionnaire:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire" });
    }
  });

  // Reminders routes
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userReminders = await db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, userId))
        .orderBy(reminders.reminderTime);
      res.json(userReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminderData = insertReminderSchema.parse({
        ...req.body,
        userId,
      });
      
      const [newReminder] = await db
        .insert(reminders)
        .values(reminderData)
        .returning();
      
      res.json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Meditation routes
  app.get("/api/meditation/sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions = await db.select().from(meditationSessions);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching meditation sessions:", error);
      res.status(500).json({ message: "Failed to fetch meditation sessions" });
    }
  });

  app.get("/api/meditation/featured", isAuthenticated, async (req, res) => {
    try {
      const [featured] = await db
        .select()
        .from(meditationSessions)
        .where(eq(meditationSessions.isFeatured, true))
        .limit(1);
      res.json(featured || null);
    } catch (error) {
      console.error("Error fetching featured meditation:", error);
      res.status(500).json({ message: "Failed to fetch featured meditation" });
    }
  });

  // User progress routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [progress] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));
      res.json(progress || { streak: 0, totalSessions: 0, totalMinutes: 0 });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress/meditation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { duration } = req.body;

      // Get existing progress or create new
      let [progress] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      if (!progress) {
        [progress] = await db
          .insert(userProgress)
          .values({
            userId,
            streak: 1,
            totalSessions: 1,
            totalMinutes: duration,
            lastMeditationDate: new Date(),
          })
          .returning();
      } else {
        // Update existing progress
        const lastDate = progress.lastMeditationDate;
        const today = new Date();
        const isToday = lastDate && 
          lastDate.toDateString() === today.toDateString();
        
        let newStreak = progress.streak;
        if (!isToday) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = lastDate && 
            lastDate.toDateString() === yesterday.toDateString();
          
          newStreak = isYesterday ? (progress.streak || 0) + 1 : 1;
        }

        [progress] = await db
          .update(userProgress)
          .set({
            streak: newStreak,
            totalSessions: (progress.totalSessions || 0) + 1,
            totalMinutes: progress.totalMinutes + duration,
            lastMeditationDate: today,
            updatedAt: today,
          })
          .where(eq(userProgress.userId, userId))
          .returning();
      }

      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

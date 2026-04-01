import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Firebase-only backend - no API routes needed
  // All data operations handled by Firebase Firestore
  
  const httpServer = createServer(app);
  return httpServer;
}

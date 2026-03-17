import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // All items with optional filters
  app.get("/api/items", async (req, res) => {
    const { jurisdiction, status, category, changeType, impactLevel, search } = req.query;

    if (search && typeof search === "string") {
      const results = await storage.searchItems(search);
      return res.json(results);
    }

    const results = await storage.filterItems({
      jurisdiction: jurisdiction as string | undefined,
      status: status as string | undefined,
      category: category as string | undefined,
      changeType: changeType as string | undefined,
      impactLevel: impactLevel as string | undefined,
    });
    res.json(results);
  });

  // Single item by ID
  app.get("/api/items/:id", async (req, res) => {
    const item = await storage.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  });

  // Timeline events
  app.get("/api/timeline", async (_req, res) => {
    const timeline = await storage.getTimeline();
    res.json(timeline);
  });

  // Categories list
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  return httpServer;
}

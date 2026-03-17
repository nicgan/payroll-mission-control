import type { StatutoryItem, TimelineEvent, DashboardStats } from "@shared/schema";
import { statutoryItems, timelineEvents } from "./seed-data";

export interface IStorage {
  getAllItems(): Promise<StatutoryItem[]>;
  getItemsByJurisdiction(jurisdiction: string): Promise<StatutoryItem[]>;
  getItemById(id: string): Promise<StatutoryItem | undefined>;
  searchItems(query: string): Promise<StatutoryItem[]>;
  filterItems(params: {
    jurisdiction?: string;
    status?: string;
    category?: string;
    changeType?: string;
    impactLevel?: string;
  }): Promise<StatutoryItem[]>;
  getStats(): Promise<DashboardStats>;
  getTimeline(): Promise<TimelineEvent[]>;
  getCategories(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private items: StatutoryItem[];
  private timeline: TimelineEvent[];

  constructor() {
    this.items = [...statutoryItems];
    this.timeline = [...timelineEvents];
  }

  async getAllItems(): Promise<StatutoryItem[]> {
    return this.items;
  }

  async getItemsByJurisdiction(jurisdiction: string): Promise<StatutoryItem[]> {
    return this.items.filter(i => i.jurisdiction === jurisdiction);
  }

  async getItemById(id: string): Promise<StatutoryItem | undefined> {
    return this.items.find(i => i.id === id);
  }

  async searchItems(query: string): Promise<StatutoryItem[]> {
    const q = query.toLowerCase();
    return this.items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.subcategory.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  async filterItems(params: {
    jurisdiction?: string;
    status?: string;
    category?: string;
    changeType?: string;
    impactLevel?: string;
  }): Promise<StatutoryItem[]> {
    let result = this.items;
    if (params.jurisdiction) {
      result = result.filter(i => i.jurisdiction === params.jurisdiction);
    }
    if (params.status) {
      result = result.filter(i => i.status === params.status);
    }
    if (params.category) {
      result = result.filter(i => i.category === params.category);
    }
    if (params.changeType) {
      result = result.filter(i => i.changeType === params.changeType);
    }
    if (params.impactLevel) {
      result = result.filter(i => i.impactLevel === params.impactLevel);
    }
    return result;
  }

  async getStats(): Promise<DashboardStats> {
    const byStatus = { RED: 0, AMBER: 0, GREEN: 0 };
    const byJurisdiction: Record<string, { RED: number; AMBER: number; GREEN: number; total: number }> = {
      SG: { RED: 0, AMBER: 0, GREEN: 0, total: 0 },
      HK: { RED: 0, AMBER: 0, GREEN: 0, total: 0 },
      MY: { RED: 0, AMBER: 0, GREEN: 0, total: 0 },
    };

    for (const item of this.items) {
      byStatus[item.status]++;
      if (byJurisdiction[item.jurisdiction]) {
        byJurisdiction[item.jurisdiction][item.status]++;
        byJurisdiction[item.jurisdiction].total++;
      }
    }

    const recentChanges = this.items.filter(i => i.changeType !== "no_change").length;
    const gapItems = this.items.filter(i => i.tags.includes("gap-item")).length;
    const now = new Date();
    const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = this.timeline.filter(e => new Date(e.date) <= sixMonths && new Date(e.date) >= now).length;

    return {
      total: this.items.length,
      byStatus,
      byJurisdiction,
      recentChanges,
      gapItems,
      upcomingDeadlines,
    };
  }

  async getTimeline(): Promise<TimelineEvent[]> {
    return this.timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getCategories(): Promise<string[]> {
    const cats = new Set(this.items.map(i => i.category));
    return Array.from(cats).sort();
  }
}

export const storage = new MemStorage();

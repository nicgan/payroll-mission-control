import { z } from "zod";

// Types for the statutory payroll data
export const jurisdictionEnum = z.enum(["SG", "HK", "MY"]);
export const statusEnum = z.enum(["RED", "AMBER", "GREEN"]);
export const changeTypeEnum = z.enum(["rate_change", "threshold_change", "new_rule", "abolished", "filing_change", "system_change", "no_change"]);
export const confidenceTierEnum = z.enum(["Tier 1", "Tier 2", "Tier 3"]);
export const impactLevelEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);

export type Jurisdiction = z.infer<typeof jurisdictionEnum>;
export type Status = z.infer<typeof statusEnum>;
export type ChangeType = z.infer<typeof changeTypeEnum>;
export type ConfidenceTier = z.infer<typeof confidenceTierEnum>;
export type ImpactLevel = z.infer<typeof impactLevelEnum>;

export interface StatutoryItem {
  id: string;
  jurisdiction: Jurisdiction;
  category: string;
  subcategory: string;
  name: string;
  status: Status;
  description: string;
  currentValue: string;
  previousValue: string | null;
  changeType: ChangeType;
  effectiveDate: string;
  confidenceTier: ConfidenceTier;
  sourceUrl: string;
  sourceName: string;
  notes: string;
  impactLevel: ImpactLevel;
  tags: string[];
}

export interface TimelineEvent {
  id: string;
  jurisdiction: Jurisdiction;
  title: string;
  description: string;
  date: string;
  status: Status;
  relatedItemIds: string[];
  priority: number;
}

export interface DashboardStats {
  total: number;
  byStatus: { RED: number; AMBER: number; GREEN: number };
  byJurisdiction: Record<string, { RED: number; AMBER: number; GREEN: number; total: number }>;
  recentChanges: number;
  gapItems: number;
  upcomingDeadlines: number;
}

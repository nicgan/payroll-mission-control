import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Jurisdiction } from "@shared/schema";

const jurisdictionLabels: Record<string, { name: string; flag: string }> = {
  SG: { name: "Singapore", flag: "SG" },
  HK: { name: "Hong Kong", flag: "HK" },
  MY: { name: "Malaysia", flag: "MY" },
};

export function JurisdictionCard({
  jurisdiction,
  stats,
  loading,
}: {
  jurisdiction: Jurisdiction;
  stats?: { RED: number; AMBER: number; GREEN: number; total: number };
  loading: boolean;
}) {
  const label = jurisdictionLabels[jurisdiction];

  return (
    <Card data-testid={`card-jurisdiction-${jurisdiction.toLowerCase()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">{label.name}</div>
            <div className="text-xs text-muted-foreground">{label.flag}</div>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-10" />
          ) : (
            <div className="text-lg font-semibold tabular-nums">{stats?.total ?? 0}</div>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-3 w-full rounded-full" />
        ) : stats ? (
          <div className="space-y-2">
            {/* Stacked bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              {stats.RED > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(stats.RED / stats.total) * 100}%` }}
                />
              )}
              {stats.AMBER > 0 && (
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${(stats.AMBER / stats.total) * 100}%` }}
                />
              )}
              {stats.GREEN > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(stats.GREEN / stats.total) * 100}%` }}
                />
              )}
            </div>
            {/* Counts */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                {stats.RED} action
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                {stats.AMBER} monitor
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {stats.GREEN} ok
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

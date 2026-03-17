import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DashboardStats, StatutoryItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock, Eye, FileWarning, TrendingUp } from "lucide-react";
import { StatusDot } from "@/components/status-dot";
import { JurisdictionCard } from "@/components/jurisdiction-card";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: items, isLoading: itemsLoading } = useQuery<StatutoryItem[]>({
    queryKey: ["/api/items"],
  });

  const redItems = items?.filter((i) => i.status === "RED") || [];
  const amberItems = items?.filter((i) => i.status === "AMBER") || [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold" data-testid="text-page-title">
          Payroll Statutory Mission Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time compliance status across Singapore, Hong Kong, and Malaysia
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          label="Total Items"
          value={stats?.total}
          icon={<Eye className="w-4 h-4" />}
          loading={statsLoading}
          testId="kpi-total"
        />
        <KPICard
          label="Action Required"
          value={stats?.byStatus.RED}
          icon={<AlertTriangle className="w-4 h-4" />}
          loading={statsLoading}
          variant="red"
          testId="kpi-red"
        />
        <KPICard
          label="Monitor"
          value={stats?.byStatus.AMBER}
          icon={<Clock className="w-4 h-4" />}
          loading={statsLoading}
          variant="amber"
          testId="kpi-amber"
        />
        <KPICard
          label="Compliant"
          value={stats?.byStatus.GREEN}
          icon={<CheckCircle className="w-4 h-4" />}
          loading={statsLoading}
          variant="green"
          testId="kpi-green"
        />
        <KPICard
          label="Changes Active"
          value={stats?.recentChanges}
          icon={<TrendingUp className="w-4 h-4" />}
          loading={statsLoading}
          testId="kpi-changes"
        />
        <KPICard
          label="Gap Items"
          value={stats?.gapItems}
          icon={<FileWarning className="w-4 h-4" />}
          loading={statsLoading}
          variant="amber"
          testId="kpi-gaps"
        />
      </div>

      {/* Jurisdiction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["SG", "HK", "MY"] as const).map((j) => (
          <JurisdictionCard
            key={j}
            jurisdiction={j}
            stats={stats?.byJurisdiction[j]}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Action Required + Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RED items */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <StatusDot status="RED" />
              <h2 className="text-sm font-semibold">Action Required</h2>
              <Badge variant="secondary" className="ml-auto text-xs status-badge-red">
                {redItems.length}
              </Badge>
            </div>
            {itemsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {redItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
                {redItems.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No action required items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AMBER items */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <StatusDot status="AMBER" />
              <h2 className="text-sm font-semibold">Monitoring</h2>
              <Badge variant="secondary" className="ml-auto text-xs status-badge-amber">
                {amberItems.length}
              </Badge>
            </div>
            {itemsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {amberItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
                {amberItems.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No items being monitored
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  loading,
  variant,
  testId,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
  loading: boolean;
  variant?: "red" | "amber" | "green";
  testId: string;
}) {
  const variantClasses = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card data-testid={testId}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <div
            className={`text-xl font-semibold tabular-nums ${variant ? variantClasses[variant] : ""}`}
          >
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ItemRow({ item }: { item: StatutoryItem }) {
  return (
    <div
      className="flex items-start gap-3 p-2 rounded-md hover-elevate cursor-default"
      data-testid={`item-row-${item.id}`}
    >
      <StatusDot status={item.status} className="mt-1.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
            {item.jurisdiction}
          </Badge>
          <span className="text-sm font-medium truncate">{item.name}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {item.description}
        </p>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {item.impactLevel}
      </Badge>
    </div>
  );
}

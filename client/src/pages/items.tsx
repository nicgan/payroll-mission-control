import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StatutoryItem } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/status-dot";
import {
  Search,
  ChevronDown,
  ExternalLink,
  X,
} from "lucide-react";

type SortField = "name" | "status" | "effectiveDate" | "jurisdiction" | "impactLevel";
type SortDir = "asc" | "desc";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery<StatutoryItem[]>({
    queryKey: ["/api/items"],
  });

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category));
    return Array.from(cats).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterJurisdiction !== "all") result = result.filter((i) => i.jurisdiction === filterJurisdiction);
    if (filterStatus !== "all") result = result.filter((i) => i.status === filterStatus);
    if (filterCategory !== "all") result = result.filter((i) => i.category === filterCategory);
    if (filterImpact !== "all") result = result.filter((i) => i.impactLevel === filterImpact);

    // Sort
    const statusOrder = { RED: 0, AMBER: 1, GREEN: 2 };
    const impactOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "status":
          cmp = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "effectiveDate":
          cmp = new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
          break;
        case "jurisdiction":
          cmp = a.jurisdiction.localeCompare(b.jurisdiction);
          break;
        case "impactLevel":
          cmp = impactOrder[a.impactLevel] - impactOrder[b.impactLevel];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [items, search, filterJurisdiction, filterStatus, filterCategory, filterImpact, sortField, sortDir]);

  const hasActiveFilters = filterJurisdiction !== "all" || filterStatus !== "all" || filterCategory !== "all" || filterImpact !== "all" || search.trim() !== "";

  const clearFilters = () => {
    setSearch("");
    setFilterJurisdiction("all");
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterImpact("all");
  };

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" data-testid="text-page-title">Statutory Items</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} of {items.length} items
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
            <X className="w-3 h-3 mr-1" /> Clear filters
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
          <SelectTrigger className="w-[120px]" data-testid="select-jurisdiction">
            <SelectValue placeholder="Jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="SG">Singapore</SelectItem>
            <SelectItem value="HK">Hong Kong</SelectItem>
            <SelectItem value="MY">Malaysia</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px]" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="RED">Action Required</SelectItem>
            <SelectItem value="AMBER">Monitoring</SelectItem>
            <SelectItem value="GREEN">Compliant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[130px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterImpact} onValueChange={setFilterImpact}>
          <SelectTrigger className="w-[120px]" data-testid="select-impact">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortField}-${sortDir}`} onValueChange={(v) => {
          const [f, d] = v.split("-") as [SortField, SortDir];
          setSortField(f);
          setSortDir(d);
        }}>
          <SelectTrigger className="w-[160px]" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status-asc">Status (critical first)</SelectItem>
            <SelectItem value="status-desc">Status (ok first)</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="effectiveDate-asc">Date (earliest)</SelectItem>
            <SelectItem value="effectiveDate-desc">Date (latest)</SelectItem>
            <SelectItem value="jurisdiction-asc">Jurisdiction A-Z</SelectItem>
            <SelectItem value="impactLevel-asc">Impact (high first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No items match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({
  item,
  expanded,
  onToggle,
}: {
  item: StatutoryItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusBadge = {
    RED: "status-badge-red",
    AMBER: "status-badge-amber",
    GREEN: "status-badge-green",
  };

  const changeLabel: Record<string, string> = {
    rate_change: "Rate Change",
    threshold_change: "Threshold Change",
    new_rule: "New Rule",
    abolished: "Abolished",
    filing_change: "Filing Change",
    system_change: "System Change",
    no_change: "No Change",
  };

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <Card data-testid={`card-item-${item.id}`}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-3 cursor-pointer hover-elevate">
            <div className="flex items-center gap-3">
              <StatusDot status={item.status} />
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 tabular-nums">
                {item.jurisdiction}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{item.name}</div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={`text-[10px] px-1.5 py-0 ${statusBadge[item.status]}`}>
                  {item.status}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {item.impactLevel}
                </Badge>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            <div className="border-t pt-3 space-y-3">
              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <DetailField label="Category" value={`${item.category} / ${item.subcategory}`} />
                <DetailField label="Current Value" value={item.currentValue} />
                {item.previousValue && (
                  <DetailField label="Previous Value" value={item.previousValue} />
                )}
                <DetailField label="Change Type" value={changeLabel[item.changeType] || item.changeType} />
                <DetailField label="Effective Date" value={formatDate(item.effectiveDate)} />
                <DetailField label="Confidence" value={item.confidenceTier} />
              </div>

              {/* Notes */}
              {item.notes && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</span>
                  <p className="text-sm mt-0.5">{item.notes}</p>
                </div>
              )}

              {/* Source */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary inline-flex items-center gap-1"
                  data-testid={`link-source-${item.id}`}
                >
                  {item.sourceName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

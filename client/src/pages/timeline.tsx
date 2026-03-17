import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TimelineEvent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusDot } from "@/components/status-dot";
import { CalendarDays, AlertCircle, Clock } from "lucide-react";

export default function TimelinePage() {
  const [filterJurisdiction, setFilterJurisdiction] = useState<string>("all");

  const { data: events = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/timeline"],
  });

  const filtered = filterJurisdiction === "all"
    ? events
    : events.filter((e) => e.jurisdiction === filterJurisdiction);

  const now = new Date();
  const pastEvents = filtered.filter((e) => new Date(e.date) < now);
  const upcomingEvents = filtered.filter((e) => new Date(e.date) >= now);

  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" data-testid="text-page-title">
            Roadmap & Deadlines
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upcoming statutory changes and filing deadlines
          </p>
        </div>
        <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
          <SelectTrigger className="w-[140px]" data-testid="select-timeline-jurisdiction">
            <SelectValue placeholder="Jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="SG">Singapore</SelectItem>
            <SelectItem value="HK">Hong Kong</SelectItem>
            <SelectItem value="MY">Malaysia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Upcoming</h2>
              <Badge variant="secondary" className="text-xs">{upcomingEvents.length}</Badge>
            </div>
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <TimelineCard key={event.id} event={event} isUpcoming />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Past */}
          {pastEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground">Past Events</h2>
                <Badge variant="secondary" className="text-xs">{pastEvents.length}</Badge>
              </div>
              <div className="relative opacity-70">
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <TimelineCard key={event.id} event={event} isUpcoming={false} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TimelineCard({ event, isUpcoming }: { event: TimelineEvent; isUpcoming: boolean }) {
  const now = new Date();
  const eventDate = new Date(event.date);
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const urgencyColor = isUpcoming && daysUntil <= 30
    ? "text-red-600 dark:text-red-400"
    : isUpcoming && daysUntil <= 90
    ? "text-amber-600 dark:text-amber-400"
    : "text-muted-foreground";

  const priorityLabel: Record<number, string> = {
    1: "Critical",
    2: "Important",
    3: "Standard",
  };

  return (
    <div className="flex gap-3 relative" data-testid={`timeline-event-${event.id}`}>
      {/* Dot on the line */}
      <div className="flex flex-col items-center z-10 pt-3">
        <StatusDot status={event.status} className="w-2.5 h-2.5" />
      </div>

      <Card className="flex-1">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                  {event.jurisdiction}
                </Badge>
                <span className="text-sm font-medium">{event.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-medium tabular-nums">
                {formatDate(event.date)}
              </div>
              {isUpcoming && (
                <div className={`text-[10px] mt-0.5 tabular-nums ${urgencyColor}`}>
                  {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              P{event.priority} — {priorityLabel[event.priority] || "Standard"}
            </Badge>
            {isUpcoming && daysUntil <= 30 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3" /> Imminent
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

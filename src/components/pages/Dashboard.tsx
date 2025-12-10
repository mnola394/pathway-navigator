import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { BarChart } from "@/components/common/BarChart";
import { FlaskConical, Atom, FileText, TrendingUp } from "lucide-react";
import {
  mockStats,
  mockReactions,
  mockCompounds,
  mockSolventUsage,
} from "@/data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getDashboardStats,
  type DashboardStats,
  getTopSolvents,
  type TopSolvent,
  getRecentReactions,
  type RecentReaction,
  getPopularCompounds,
  type PopularCompound,
} from "@/services/chemkgService";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [topSolvents, setTopSolvents] = useState<TopSolvent[] | null>(null);
  const [loadingSolvents, setLoadingSolvents] = useState(true);
  const [solventError, setSolventError] = useState<string | null>(null);

  const [recentReactions, setRecentReactions] = useState<RecentReaction[] | null>(null);
  const [loadingReactions, setLoadingReactions] = useState(true);
  const [reactionsError, setReactionsError] = useState<string | null>(null);

  const [popularCompounds, setPopularCompounds] = useState<PopularCompound[] | null>(
    null
  );
  const [loadingCompounds, setLoadingCompounds] = useState(true);
  const [compoundsError, setCompoundsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats from GraphDB:", err);
        if (isMounted) setStatsError("Failed to load live stats, showing mock data.");
      })
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    getTopSolvents()
      .then((data) => {
        if (isMounted) setTopSolvents(data);
      })
      .catch((err) => {
        console.error("Failed to load top solvents from GraphDB:", err);
        if (isMounted) setSolventError("Failed to load solvents, showing mock data.");
      })
      .finally(() => {
        if (isMounted) setLoadingSolvents(false);
      });

    getRecentReactions()
      .then((data) => {
        if (isMounted) setRecentReactions(data);
      })
      .catch((err) => {
        console.error("Failed to load recent reactions from GraphDB:", err);
        if (isMounted) setReactionsError("Failed to load reactions, showing mock data.");
      })
      .finally(() => {
        if (isMounted) setLoadingReactions(false);
      });

    getPopularCompounds()
      .then((data) => {
        if (isMounted) setPopularCompounds(data);
      })
      .catch((err) => {
        console.error("Failed to load popular compounds from GraphDB:", err);
        if (isMounted) setCompoundsError("Failed to load compounds, showing mock data.");
      })
      .finally(() => {
        if (isMounted) setLoadingCompounds(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveStats: DashboardStats = stats ?? {
    totalReactions: mockStats.totalReactions,
    totalCompounds: mockStats.totalCompounds,
    patentsCovered: mockStats.patentsCovered,
  };

  const effectiveRecentReactions: RecentReaction[] =
    recentReactions ??
    mockReactions.map((r) => ({
      rxn: r.id,
      reactionId: r.id,
      year: null,
      reactionSmiles: "",
    }));

  const effectivePopularCompounds: PopularCompound[] =
    popularCompounds ??
    mockCompounds.map((c) => ({
      compound: c.smiles,
      smiles: c.smiles,
      label: c.exampleRoles.join(" & "),
      reactionsInvolved: c.roleCount,
    }));

  const solventChartData =
    topSolvents && topSolvents.length > 0
      ? (() => {
          const maxCount = Math.max(...topSolvents.map((s) => s.timesUsed));
          return topSolvents.map((s) => ({
            name: s.label || s.smiles || s.solvent,
            value: s.timesUsed,
            percentage: maxCount > 0 ? (s.timesUsed / maxCount) * 100 : 0,
          }));
        })()
      : mockSolventUsage.map((s) => ({
          name: s.name,
          value: s.count,
          percentage: s.percentage,
        }));

  const anyError = statsError || solventError || reactionsError || compoundsError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of the Chemical Knowledge Graph
        </p>
        {anyError && (
          <p className="text-xs text-red-500 mt-1">
            {anyError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Reactions"
          value={
            loadingStats && !stats
              ? "…"
              : effectiveStats.totalReactions.toLocaleString()
          }
          icon={FlaskConical}
          iconColor="text-reaction"
        />
        <StatCard
          title="Total Compounds"
          value={
            loadingStats && !stats
              ? "…"
              : effectiveStats.totalCompounds.toLocaleString()
          }
          icon={Atom}
          iconColor="text-compound"
        />
        <StatCard
          title="Patents Covered"
          value={
            loadingStats && !stats
              ? "…"
              : `${effectiveStats.patentsCovered.toLocaleString()} grants`
          }
          icon={FileText}
          iconColor="text-primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top Solvents by Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={solventChartData} colorClass="bg-solvent" />
          {loadingSolvents && (
            <p className="text-xs text-muted-foreground mt-2">
              Loading solvent usage…
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-reaction" />
              Recent Reactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Reaction ID</TableHead>
                  <TableHead className="text-xs">Reaction SMILES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveRecentReactions.slice(0, 5).map((reaction) => (
                  <TableRow key={reaction.rxn}>
                    <TableCell className="font-mono text-xs">
                      {reaction.reactionId ?? reaction.rxn}
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {reaction.reactionSmiles || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loadingReactions && (
              <p className="text-xs text-muted-foreground mt-2">
                Loading recent reactions…
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Atom className="w-4 h-4 text-compound" />
              Popular Compounds Across Any Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">SMILES</TableHead>
                  <TableHead className="text-xs text-center">
                    Reactions Involved
                  </TableHead>
                  <TableHead className="text-xs">Label</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectivePopularCompounds.slice(0, 5).map((compound) => (
                  <TableRow key={compound.compound}>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {compound.smiles ?? "—"}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {compound.reactionsInvolved}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {compound.label ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loadingCompounds && (
              <p className="text-xs text-muted-foreground mt-2">
                Loading popular compounds…
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

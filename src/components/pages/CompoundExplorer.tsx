// src/components/CompoundExplorer.tsx
import { useEffect, useState } from "react";
import { Atom, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ReactionDetailsDrawer } from "@/components/common/ReactionDetailsDrawer";

import {
  searchCompounds,
  type CompoundSearchResult,
} from "@/services/searchService";

import {
  getCompoundRoleStatsBySmiles,
  getCompoundRoleReactionsBySmiles,
  type CompoundRoleStats,
  type CompoundRoleReaction,
} from "@/services/compoundRoleService";

export function CompoundExplorer() {
  // --- SMILES search / typeahead state ----------------------
  const [searchValue, setSearchValue] = useState(""); // selected SMILES/text
  const [typeaheadTerm, setTypeaheadTerm] = useState("");
  const [suggestions, setSuggestions] = useState<CompoundSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // --- results state ----------------------------------------
  const [stats, setStats] = useState<CompoundRoleStats | null>(null);
  const [roleReactions, setRoleReactions] = useState<CompoundRoleReaction[]>(
    []
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- reaction drawer state --------------------------------
  const [selectedReactionId, setSelectedReactionId] = useState<string | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openReactionDrawer = (reactionId: string | null) => {
    if (!reactionId) return;
    setSelectedReactionId(reactionId);
    setDrawerOpen(true);
  };

  // -------- typeahead: searchCompounds on typeaheadTerm -----
  useEffect(() => {
    const q = typeaheadTerm.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    (async () => {
      try {
        const res = await searchCompounds(q, 8);
        if (!cancelled) setSuggestions(res);
      } catch (err) {
        console.error("CompoundExplorer searchCompounds error:", err);
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [typeaheadTerm]);

  const pickSuggestion = (c: CompoundSearchResult) => {
    const value = c.smiles ?? c.label ?? "";
    if (!value) return;
    setSearchValue(value);
    setTypeaheadTerm("");
    setSuggestions([]);
  };

  // -------- main “Search” action: fetch stats + reactions ----
  const handleSearch = async () => {
    const q = searchValue.trim();
    if (!q) {
      setStats(null);
      setRoleReactions([]);
      setError(null);
      return;
    }

    setLoadingDetails(true);
    setError(null);

    try {
      const [s, reactions] = await Promise.all([
        getCompoundRoleStatsBySmiles(q),
        getCompoundRoleReactionsBySmiles(q),
      ]);

      setStats(s);
      setRoleReactions(reactions);
    } catch (err) {
      console.error("CompoundExplorer role fetch error:", err);
      setError("Failed to load compound role details from GraphDB.");
      setStats(null);
      setRoleReactions([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Optionally: auto-run search if you want initial demo value
  // useEffect(() => {
  //   setSearchValue("BrCCO");
  //   setTypeaheadTerm("BrCCO");
  //   handleSearch();
  // }, []);

  const totalReactions =
    stats?.totalRoles ??
    new Set(roleReactions.map((r) => r.reactionIri)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Compound Explorer
        </h1>
        <p className="text-muted-foreground mt-1">
          Inspect how a compound participates in reactions (reactant, product,
          solvent, catalyst, agent).
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 block">SMILES</Label>
              <div className="relative">
                <Atom className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter SMILES or name (e.g., BrCCO)"
                  className="pl-9 font-mono"
                  value={searchValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchValue(v);
                    setTypeaheadTerm(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  onBlur={() => {
                    // tiny delay so click on suggestion still works
                    setTimeout(() => {
                      setSuggestions([]);
                    }, 150);
                  }}
                />

                {/* Suggestions dropdown */}
                {typeaheadTerm.trim().length >= 2 && suggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto text-xs">
                    {searchLoading && (
                      <p className="p-2 text-muted-foreground">
                        Searching compounds…
                      </p>
                    )}
                    {!searchLoading &&
                      suggestions.map((c) => (
                        <button
                          key={c.compoundIri || c.smiles}
                          type="button"
                          className="w-full px-2 py-1.5 text-left hover:bg-muted flex flex-col"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            pickSuggestion(c);
                          }}
                        >
                          <span className="font-mono">
                            {c.smiles ?? "(no SMILES)"}
                          </span>
                          {c.label && (
                            <span className="text-[11px] text-muted-foreground">
                              {c.label}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            Score {c.score} • {c.reactionCount} reactions
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}
          {loadingDetails && !error && (
            <p className="text-sm text-muted-foreground mt-3">
              Loading compound roles from GraphDB…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Role Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Compound Roles
            {stats && (
              <Badge variant="secondary" className="ml-2 font-mono">
                {stats.label ?? stats.smiles ?? "Unnamed compound"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!stats && !loadingDetails && !error && (
            <p className="text-sm text-muted-foreground">
              Enter a SMILES or name and click <span className="font-semibold">Search</span>{" "}
              to view role statistics.
            </p>
          )}

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  Total reactions
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.totalRoles}
                </span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  As Reactant
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.asReactant}
                </span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  As Product
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.asProduct}
                </span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  As Solvent
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.asSolvent}
                </span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  As Catalyst
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.asCatalyst}
                </span>
              </div>

              <div className="p-3 rounded-lg border bg-muted/40 flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  As Agent
                </span>
                <span className="text-lg font-semibold font-mono">
                  {stats.asAgent}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Reactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Reactions with this compound
            <Badge variant="secondary" className="ml-2 font-mono">
              {loadingDetails
                ? "…"
                : `${roleReactions.length} rows • ${totalReactions} distinct reactions`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roleReactions.length === 0 && !loadingDetails && !error && (
            <p className="text-sm text-muted-foreground">
              No reactions found (or search not run yet).
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[120px]">Role</TableHead>
                <TableHead className="text-xs w-[160px]">Reaction ID</TableHead>
                <TableHead className="text-xs">Reaction IRI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleReactions.map((r) => (
                <TableRow
                  key={`${r.role}-${r.reactionIri}`}
                  className={
                    r.reactionId
                      ? "cursor-pointer hover:bg-muted/50"
                      : "opacity-75"
                  }
                  onClick={() => openReactionDrawer(r.reactionId)}
                >
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {r.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary">
                    {r.reactionId ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] max-w-[420px] truncate">
                    {r.reactionIri}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reaction details drawer (re-using existing component) */}
      <ReactionDetailsDrawer
        reactionId={selectedReactionId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

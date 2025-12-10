import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReactionDetailsDrawer } from "@/components/common/ReactionDetailsDrawer";
import { Search, FlaskConical, Filter } from "lucide-react";

import {
  searchReactions,
  type ReactionSearchResult,
} from "@/services/reactionSearchService";
import {
  searchCompounds,
  type CompoundSearchResult,
} from "@/services/searchService";

type TriState = "any" | "yes" | "no";

export function ReactionExplorer() {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [textQuery, setTextQuery] = useState("");
  const [reactantSmiles, setReactantSmiles] = useState("");
  const [productSmiles, setProductSmiles] = useState("");
  const [catalystFilter, setCatalystFilter] = useState<TriState>("any");
  const [solventFilter, setSolventFilter] = useState<TriState>("any");

  const [results, setResults] = useState<ReactionSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reactantSearchTerm, setReactantSearchTerm] = useState("");
  const [reactantSuggestions, setReactantSuggestions] = useState<
    CompoundSearchResult[]
  >([]);
  const [reactantSearchLoading, setReactantSearchLoading] = useState(false);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSuggestions, setProductSuggestions] = useState<
    CompoundSearchResult[]
  >([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const handleRowClick = (reactionId: string | null) => {
    if (!reactionId) return;
    setSelectedReaction(reactionId);
    setDrawerOpen(true);
  };

  const applyFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await searchReactions({
        text: textQuery || undefined,
        reactantSmiles: reactantSmiles || undefined,
        productSmiles: productSmiles || undefined,
        requireCatalyst:
          catalystFilter === "any"
            ? undefined
            : catalystFilter === "yes"
            ? true
            : false,
        requireSolvent:
          solventFilter === "any"
            ? undefined
            : solventFilter === "yes"
            ? true
            : false,
        limit: 50,
        offset: 0,
      });

      setResults(res);
    } catch (e: any) {
      console.error("searchReactions error:", e);
      setError("Failed to load reactions from GraphDB.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, []);

  useEffect(() => {
    const q = reactantSearchTerm.trim();
    if (q.length < 2) {
      setReactantSuggestions([]);
      setReactantSearchLoading(false);
      return;
    }

    let cancelled = false;
    setReactantSearchLoading(true);

    (async () => {
      try {
        const res = await searchCompounds(q, 8);
        if (!cancelled) setReactantSuggestions(res);
      } catch (err) {
        console.error("reactant searchCompounds error:", err);
        if (!cancelled) setReactantSuggestions([]);
      } finally {
        if (!cancelled) setReactantSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reactantSearchTerm]);

  const pickReactantSuggestion = (r: CompoundSearchResult) => {
    const value = r.smiles ?? r.label ?? "";
    if (!value) return;
    setReactantSmiles(value);
    setReactantSearchTerm("");
    setReactantSuggestions([]);
  };

  useEffect(() => {
    const q = productSearchTerm.trim();
    if (q.length < 2) {
      setProductSuggestions([]);
      setProductSearchLoading(false);
      return;
    }

    let cancelled = false;
    setProductSearchLoading(true);

    (async () => {
      try {
        const res = await searchCompounds(q, 8);
        if (!cancelled) setProductSuggestions(res);
      } catch (err) {
        console.error("product searchCompounds error:", err);
        if (!cancelled) setProductSuggestions([]);
      } finally {
        if (!cancelled) setProductSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productSearchTerm]);

  const pickProductSuggestion = (r: CompoundSearchResult) => {
    const value = r.smiles ?? r.label ?? "";
    if (!value) return;
    setProductSmiles(value);
    setProductSearchTerm("");
    setProductSuggestions([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reaction Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search reactions in the knowledge graph
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Search (ID / SMILES / label / patent)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder='e.g. "chloro", "US03930837", "I.ClC1=…"'
                  className="pl-9"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[260px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Reactant contains
              </label>
              <div className="relative">
                <Input
                  placeholder='SMILES / name, e.g. "BrCCO"'
                  value={reactantSmiles}
                  onChange={(e) => {
                    setReactantSmiles(e.target.value);
                    setReactantSearchTerm(e.target.value);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setReactantSuggestions([]);
                    }, 150);
                  }}
                />
                {reactantSearchTerm.trim().length >= 2 &&
                  reactantSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto text-xs">
                      {reactantSearchLoading && (
                        <p className="p-2 text-muted-foreground">
                          Searching reactants…
                        </p>
                      )}
                      {!reactantSearchLoading &&
                        reactantSuggestions.map((r) => (
                          <button
                            key={r.compoundIri || r.smiles}
                            type="button"
                            className="w-full px-2 py-1.5 text-left hover:bg-muted flex flex-col"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pickReactantSuggestion(r);
                            }}
                          >
                            <span className="font-mono">
                              {r.smiles ?? "(no SMILES)"}
                            </span>
                            {r.label && (
                              <span className="text-[11px] text-muted-foreground">
                                {r.label}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              Score {r.score} • {r.reactionCount} reactions
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="w-[260px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Product contains
              </label>
              <div className="relative">
                <Input
                  placeholder="SMILES / name"
                  value={productSmiles}
                  onChange={(e) => {
                    setProductSmiles(e.target.value);
                    setProductSearchTerm(e.target.value);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setProductSuggestions([]);
                    }, 150);
                  }}
                />
                {productSearchTerm.trim().length >= 2 &&
                  productSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto text-xs">
                      {productSearchLoading && (
                        <p className="p-2 text-muted-foreground">
                          Searching products…
                        </p>
                      )}
                      {!productSearchLoading &&
                        productSuggestions.map((r) => (
                          <button
                            key={r.compoundIri || r.smiles}
                            type="button"
                            className="w-full px-2 py-1.5 text-left hover:bg-muted flex flex-col"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pickProductSuggestion(r);
                            }}
                          >
                            <span className="font-mono">
                              {r.smiles ?? "(no SMILES)"}
                            </span>
                            {r.label && (
                              <span className="text-[11px] text-muted-foreground">
                                {r.label}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              Score {r.score} • {r.reactionCount} reactions
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="w-[160px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Catalyst
              </label>
              <Select
                value={catalystFilter}
                onValueChange={(v: TriState) => setCatalystFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Require catalyst</SelectItem>
                  <SelectItem value="no">No catalyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Solvent
              </label>
              <Select
                value={solventFilter}
                onValueChange={(v: TriState) => setSolventFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Require solvent</SelectItem>
                  <SelectItem value="no">No solvent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-reaction" />
            Reactions
            <Badge variant="secondary" className="ml-2 font-mono">
              {loading ? "…" : `${results.length} results`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground mb-3">
              Loading reactions from GraphDB…
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[130px]">Reaction ID</TableHead>
                <TableHead className="text-xs w-[120px]">Patent ID</TableHead>
                <TableHead className="text-xs">Reactants</TableHead>
                <TableHead className="text-xs">Products</TableHead>
                <TableHead className="text-xs">Reaction SMILES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 && !loading && !error && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-xs text-muted-foreground text-center py-6"
                  >
                    No reactions found for the current filters.
                  </TableCell>
                </TableRow>
              )}

              {results.map((rxn) => (
                <TableRow
                  key={rxn.reactionIri}
                  className={
                    rxn.reactionId
                      ? "cursor-pointer hover:bg-muted/50"
                      : "opacity-70"
                  }
                  onClick={() => handleRowClick(rxn.reactionId)}
                >
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    {rxn.reactionId ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {rxn.patentId ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[260px] truncate">
                    {rxn.reactantSmiles.length > 0
                      ? rxn.reactantSmiles.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[260px] truncate">
                    {rxn.productSmiles.length > 0
                      ? rxn.productSmiles.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[320px] truncate">
                    {rxn.reactionSmiles ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReactionDetailsDrawer
        reactionId={selectedReaction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

// src/components/PathwayExplorer.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactionDetailsDrawer } from "@/components/common/ReactionDetailsDrawer";
import {
  Search,
  Route,
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Plus,
  Trash2,
} from "lucide-react";

import { getMultiSetPaths, type DetailedPath } from "@/services/pathwayService";
import {
  searchCompounds,
  type CompoundSearchResult,
} from "@/services/searchService";

const roles = [
  { id: "reactants", label: "Reactants" },
  { id: "products", label: "Products" },
  { id: "agents", label: "Agents" },
  { id: "catalysts", label: "Catalysts" },
  { id: "solvents", label: "Solvents" },
];

type ActiveField =
  | { kind: "start"; index: number }
  | { kind: "target"; index: number }
  | null;

export function PathwayExplorer() {
  const [maxSteps, setMaxSteps] = useState([1]);
  const [selectedRoles, setSelectedRoles] = useState(["reactants", "products"]);
  const [shortestOnly, setShortestOnly] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Multiple start/target compounds as arrays of strings
  const [startCompounds, setStartCompounds] = useState<string[]>([""]);
  const [targetCompounds, setTargetCompounds] = useState<string[]>([""]);

  // GraphDB detailed path results
  const [paths, setPaths] = useState<DetailedPath[] | null>(null);
  const [loadingPaths, setLoadingPaths] = useState(false);
  const [pathsError, setPathsError] = useState<string | null>(null);

  // ---- Compound search state (shared for start/target) ----
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CompoundSearchResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);

  // Run search when searchTerm changes
  useEffect(() => {
    if (!searchTerm.trim() || !activeField) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    (async () => {
      try {
        const res = await searchCompounds(searchTerm, 10);
        if (!cancelled) {
          setSearchResults(res);
        }
      } catch (err) {
        console.error("searchCompounds error:", err);
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, activeField]);

  const handleSearch = async () => {
    const cleanedStarts = startCompounds.map((s) => s.trim()).filter(Boolean);
    const cleanedTargets = targetCompounds.map((s) => s.trim()).filter(Boolean);

    if (cleanedStarts.length === 0 || cleanedTargets.length === 0) {
      setPathsError("Please provide at least one start and one target SMILES.");
      setHasSearched(true);
      setPaths(null);
      return;
    }

    console.log("Start compounds:", cleanedStarts);
    console.log("Target compounds:", cleanedTargets);
    console.log("Exact steps (multi-set paths):", maxSteps[0]);

    setHasSearched(true);
    setLoadingPaths(true);
    setPathsError(null);

    try {
      const results = await getMultiSetPaths(
        cleanedStarts,
        cleanedTargets,
        maxSteps[0]
      );
      setPaths(results);
    } catch (err: any) {
      console.error("Error fetching multi-set pathways:", err);
      setPaths(null);
      setPathsError(
        "Failed to query GraphDB for multi-set pathways. Check the console for details."
      );
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleReactionClick = (reactionId: string) => {
    console.log("Open reaction details for:", reactionId);
    setSelectedReaction(reactionId);
    setDrawerOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  // ---- Input change handlers now also update search state ----
  const handleStartChange = (index: number, value: string) => {
    setStartCompounds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setActiveField({ kind: "start", index });
    setSearchTerm(value);
  };

  const handleTargetChange = (index: number, value: string) => {
    setTargetCompounds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setActiveField({ kind: "target", index });
    setSearchTerm(value);
  };

  const addStartField = () => {
    setStartCompounds((prev) => [...prev, ""]);
  };

  const addTargetField = () => {
    setTargetCompounds((prev) => [...prev, ""]);
  };

  const removeStartField = (index: number) => {
    setStartCompounds((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
    if (activeField?.kind === "start" && activeField.index === index) {
      setActiveField(null);
      setSearchResults([]);
    }
  };

  const removeTargetField = (index: number) => {
    setTargetCompounds((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
    if (activeField?.kind === "target" && activeField.index === index) {
      setActiveField(null);
      setSearchResults([]);
    }
  };

  // When user picks a suggestion from dropdown
  const handlePickSuggestion = (
    field: ActiveField,
    result: CompoundSearchResult
  ) => {
    const valueToUse = result.smiles ?? result.label ?? "";

    if (!valueToUse || !field) return;

    if (field.kind === "start") {
      setStartCompounds((prev) => {
        const next = [...prev];
        next[field.index] = valueToUse;
        return next;
      });
    } else {
      setTargetCompounds((prev) => {
        const next = [...prev];
        next[field.index] = valueToUse;
        return next;
      });
    }

    setActiveField(null);
    setSearchResults([]);
    setSearchTerm("");
  };

  const isActiveField = (kind: "start" | "target", index: number) =>
    activeField?.kind === kind && activeField.index === index;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pathway Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Discover multi-step reaction pathways between compounds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pathway Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Start Compounds */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Start Compound SMILES
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={addStartField}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {startCompounds.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder={
                          index === 0 ? "BrCCO" : "Another SMILES / name / ID"
                        }
                        className="font-mono text-sm"
                        value={value}
                        onChange={(e) =>
                          handleStartChange(index, e.target.value)
                        }
                        onFocus={() => {
                          setActiveField({ kind: "start", index });
                          setSearchTerm(value);
                        }}
                        onBlur={() => {
                          // small timeout so click on suggestion still works
                          setTimeout(() => {
                            if (
                              activeField?.kind === "start" &&
                              activeField.index === index
                            ) {
                              setActiveField(null);
                              setSearchResults([]);
                            }
                          }, 150);
                        }}
                      />
                      {isActiveField("start", index) &&
                        searchTerm.trim().length >= 2 && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto">
                            {searchLoading ? (
                              <p className="p-2 text-xs text-muted-foreground">
                                Searching compounds…
                              </p>
                            ) : searchResults.length === 0 ? (
                              <p className="p-2 text-xs text-muted-foreground">
                                No matches.
                              </p>
                            ) : (
                              searchResults.map((r) => (
                                <button
                                  key={r.compoundIri || `${r.smiles}-${index}`}
                                  type="button"
                                  className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex flex-col"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handlePickSuggestion(
                                      { kind: "start", index },
                                      r
                                    );
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
                                    Score {r.score} • {r.reactionCount}{" "}
                                    reactions
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeStartField(index)}
                      disabled={startCompounds.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can specify multiple starting compounds. Type SMILES, a
                name, or an ID to search the knowledge graph.
              </p>
            </div>

            {/* Target Compounds */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Target Compound SMILES
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={addTargetField}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {targetCompounds.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder={
                          index === 0
                            ? "C(C)S(=O)(=O)OCCBr"
                            : "Another SMILES / name / ID"
                        }
                        className="font-mono text-sm"
                        value={value}
                        onChange={(e) =>
                          handleTargetChange(index, e.target.value)
                        }
                        onFocus={() => {
                          setActiveField({ kind: "target", index });
                          setSearchTerm(value);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            if (
                              activeField?.kind === "target" &&
                              activeField.index === index
                            ) {
                              setActiveField(null);
                              setSearchResults([]);
                            }
                          }, 150);
                        }}
                      />
                      {isActiveField("target", index) &&
                        searchTerm.trim().length >= 2 && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto">
                            {searchLoading ? (
                              <p className="p-2 text-xs text-muted-foreground">
                                Searching compounds…
                              </p>
                            ) : searchResults.length === 0 ? (
                              <p className="p-2 text-xs text-muted-foreground">
                                No matches.
                              </p>
                            ) : (
                              searchResults.map((r) => (
                                <button
                                  key={r.compoundIri || `${r.smiles}-${index}`}
                                  type="button"
                                  className="w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex flex-col"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handlePickSuggestion(
                                      { kind: "target", index },
                                      r
                                    );
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
                                    Score {r.score} • {r.reactionCount}{" "}
                                    reactions
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeTargetField(index)}
                      disabled={targetCompounds.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can specify multiple target compounds as well.
              </p>
            </div>

            {/* Exact Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Max Steps</Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {maxSteps[0]}
                </span>
              </div>
              <Slider
                value={maxSteps}
                onValueChange={setMaxSteps}
                min={1}
                max={4}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Returns pathways with Maximum this many reaction steps.
              </p>
            </div>

            {/* Shortest Path Toggle (optional UI, not used in multi-set query) */}
            {/* <div className="flex items-center justify-between">
              <Label htmlFor="shortest" className="text-sm font-medium">
                Only show shortest paths
              </Label>
              <Switch
                id="shortest"
                checked={shortestOnly}
                onCheckedChange={setShortestOnly}
              />
            </div> */}

            {/* Search Button */}
            <Button onClick={handleSearch} className="w-full">
              <Route className="w-4 h-4 mr-2" />
              Find Pathways
            </Button>

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Start/target fields now search the knowledge graph by SMILES,
                name, reaction text, or patent IDs. Pick compounds, then run a
                multi-step path query between them.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="pathways" className="h-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Results
                </CardTitle>
                <TabsList className="h-8">
                  <TabsTrigger value="pathways" className="text-xs">
                    <Route className="w-3 h-3 mr-1" />
                    Pathways
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="pathways" className="mt-0 space-y-4">
                {!hasSearched ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Route className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Enter one or more start and target compounds, choose the
                      number of steps, then click &quot;Find Pathways&quot; to
                      see detailed reaction sequences.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loadingPaths && (
                      <p className="text-sm text-muted-foreground">
                        Searching GraphDB for detailed pathways…
                      </p>
                    )}
                    {pathsError && (
                      <p className="text-sm text-red-500">{pathsError}</p>
                    )}

                    {paths && paths.length > 0 && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Found {paths.length} detailed path
                          {paths.length === 1 ? "" : "s"}
                          {/* with exactly{" "}
                          {maxSteps[0]} step
                          {maxSteps[0] === 1 ? "" : "s"} */}
                          .
                        </p>
                        <div className="space-y-2">
                          {paths.map((p, index) => {
                            // startSmiles may be string or string[]
                            const startSmilesValue = Array.isArray(
                              p.startSmiles
                            )
                              ? p.startSmiles[0] ?? ""
                              : p.startSmiles;

                            const totalSteps =
                              p.stepCount ?? p.reactions.length;

                            // Build explicit step list: from, to, reactionId
                            const steps = Array.from(
                              { length: totalSteps },
                              (_, i) => {
                                const from =
                                  i === 0
                                    ? startSmilesValue
                                    : p.intermediates[i - 1] ?? "(unknown)";

                                const to =
                                  i === totalSteps - 1
                                    ? p.targetSmiles
                                    : p.intermediates[i] ?? "(unknown)";

                                const reactionId = p.reactions[i]?.id ?? null;

                                return { from, to, reactionId };
                              }
                            );

                            // Optional compact chain string for quick glance
                            const chain = [
                              startSmilesValue,
                              ...p.intermediates.filter(
                                (x) => x && x.length > 0
                              ),
                              p.targetSmiles,
                            ];

                            return (
                              <Card
                                key={`${startSmilesValue}-${p.targetSmiles}-${index}`}
                              >
                                <CardContent className="py-3 space-y-3">
                                  {/* Header + compact chain */}
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                      Path {index + 1} ({totalSteps} step
                                      {totalSteps === 1 ? "" : "s"})
                                    </p>
                                    <p className="text-[11px] font-mono text-muted-foreground">
                                      {chain.join("  →  ")}
                                    </p>
                                  </div>

                                  {/* Explicit per-step breakdown */}
                                  <div className="space-y-2">
                                    {steps.map((step, stepIndex) => (
                                      <div
                                        key={stepIndex}
                                        className="rounded-md bg-muted/40 px-2 py-1.5 text-[11px] space-y-0.5"
                                      >
                                        <p className="font-medium text-foreground">
                                          Step {stepIndex + 1}
                                        </p>
                                        <p className="font-mono">
                                          {step.from}{" "}
                                          <span className="mx-1 text-muted-foreground">
                                            →
                                          </span>
                                          {step.to}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          via reaction{" "}
                                          {step.reactionId ? (
                                            <Button
                                              type="button"
                                              variant="link"
                                              className="h-auto p-0 text-[10px] font-mono align-baseline"
                                              onClick={() =>
                                                handleReactionClick(
                                                  step.reactionId!
                                                )
                                              }
                                            >
                                              {step.reactionId}
                                            </Button>
                                          ) : (
                                            "ID not available"
                                          )}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {!loadingPaths &&
                      !pathsError &&
                      (!paths || paths.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No detailed paths of exactly {maxSteps[0]} steps found
                          for the given compounds.
                        </p>
                      )}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <ReactionDetailsDrawer
        reactionId={selectedReaction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

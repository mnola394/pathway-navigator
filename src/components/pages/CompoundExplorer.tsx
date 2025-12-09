// src/components/CompoundExplorer.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ReactionDetailsDrawer } from "@/components/common/ReactionDetailsDrawer";
import { Search, Atom, FlaskConical, Beaker, ArrowRight } from "lucide-react";

import {
  getCompoundRoleStatsBySmiles,
  getCompoundRoleReactionsBySmiles,
  type CompoundRoleStats,
  type CompoundRoleReaction,
} from "@/services/compoundRoleService";

// View model we use in the UI, derived from stats + reaction lists
interface SelectedCompoundVM {
  compoundIri: string;
  smiles: string;
  label: string | null;
  roleCount: number;
  exampleRoles: string[];
  asReactant: string[];
  asProduct: string[];
  asSolvent: string[];
  asCatalyst: string[];
  asAgent: string[];
}

const ROLE_LABELS: Record<string, string> = {
  hasReactant: "Reactant",
  hasProduct: "Product",
  hasSolvent: "Solvent",
  hasCatalyst: "Catalyst",
  hasAgent: "Agent",
};

export function CompoundExplorer() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCompound, setSelectedCompound] =
    useState<SelectedCompoundVM | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const q = searchValue.trim();
    if (!q) {
      setError("Please enter a SMILES string to search.");
      setSelectedCompound(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedCompound(null);

    try {
      // run both queries in parallel
      const [stats, reactions] = await Promise.all([
        getCompoundRoleStatsBySmiles(q),
        getCompoundRoleReactionsBySmiles(q),
      ]);

      if (!stats) {
        setError("No compound found for that SMILES.");
        setSelectedCompound(null);
        return;
      }

      // Group reactions by role
      const byRole: Record<string, string[]> = {
        hasReactant: [],
        hasProduct: [],
        hasSolvent: [],
        hasCatalyst: [],
        hasAgent: [],
      };

      reactions.forEach((r: CompoundRoleReaction) => {
        if (!r.reactionId) return;
        if (byRole[r.role]) {
          byRole[r.role].push(r.reactionId);
        }
      });

      // Build example role labels from non-empty groups
      const exampleRoles: string[] = Object.entries(byRole)
        .filter(([_, ids]) => ids.length > 0)
        .map(([role]) => ROLE_LABELS[role] ?? role.replace("has", ""));

      const vm: SelectedCompoundVM = {
        compoundIri: stats.compoundIri,
        smiles: stats.smiles ?? q,
        label: stats.label ?? null,
        roleCount: stats.totalRoles,
        exampleRoles,
        asReactant: byRole.hasReactant,
        asProduct: byRole.hasProduct,
        asSolvent: byRole.hasSolvent,
        asCatalyst: byRole.hasCatalyst,
        asAgent: byRole.hasAgent,
      };

      setSelectedCompound(vm);
    } catch (e) {
      console.error("CompoundExplorer search error:", e);
      setError("Failed to query GraphDB for this compound. Check console for details.");
      setSelectedCompound(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReactionClick = (reactionId: string) => {
    setSelectedReaction(reactionId);
    setDrawerOpen(true);
  };

  // Collect all neighboring reactions (deduped)
  const allNeighborReactions: string[] =
    selectedCompound
      ? Array.from(
          new Set([
            ...selectedCompound.asReactant,
            ...selectedCompound.asProduct,
            ...selectedCompound.asSolvent,
            ...selectedCompound.asCatalyst,
            ...selectedCompound.asAgent,
          ])
        )
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compound Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Inspect compounds and discover their roles in reactions
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 block">SMILES</Label>
              <div className="relative">
                <Atom className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter SMILES (e.g., BrCCO)"
                  className="pl-9 font-mono"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>
            </div>
            {/* <div className="w-[200px]">
              <Label className="text-sm font-medium mb-2 block">
                Label / Name (optional)
              </Label>
              <Input
                placeholder="e.g., 2-bromoethanol"
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div> */}
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Searching…" : "Search Compound"}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-1">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {selectedCompound && (
        <>
          {/* Compound Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Atom className="w-4 h-4 text-compound" />
                Compound Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-mono font-semibold text-foreground break-all">
                    {selectedCompound.smiles}
                  </h3>
                  {selectedCompound.label && (
                    <p className="text-muted-foreground mt-1">
                      {selectedCompound.label}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    <span className="font-semibold">IRI:</span>{" "}
                    {selectedCompound.compoundIri}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {selectedCompound.roleCount} roles
                </Badge>
              </div>

              {selectedCompound.exampleRoles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCompound.exampleRoles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-reaction">
                    {selectedCompound.asReactant.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As Reactant
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-compound">
                    {selectedCompound.asProduct.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As Product
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-solvent">
                    {selectedCompound.asSolvent.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As Solvent
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-catalyst">
                    {selectedCompound.asCatalyst.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As Catalyst
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* As Reactant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-reaction" />
                  As Reactant
                  <Badge variant="secondary" className="ml-auto">
                    {selectedCompound.asReactant.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCompound.asReactant.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompound.asReactant.map((rxnId) => (
                      <button
                        key={rxnId}
                        onClick={() => handleReactionClick(rxnId)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className="font-mono text-sm text-foreground">
                          {rxnId}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reactions found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* As Product */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-compound" />
                  As Product
                  <Badge variant="secondary" className="ml-auto">
                    {selectedCompound.asProduct.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCompound.asProduct.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompound.asProduct.map((rxnId) => (
                      <button
                        key={rxnId}
                        onClick={() => handleReactionClick(rxnId)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className="font-mono text-sm text-foreground">
                          {rxnId}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reactions found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Neighboring Reactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                All Neighboring Reactions
                <Badge variant="secondary" className="ml-2 font-mono">
                  {allNeighborReactions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                All reactions where this compound appears in any role:
              </p>
              {allNeighborReactions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allNeighborReactions.map((rxnId, idx) => (
                    <button
                      key={`${rxnId}-${idx}`}
                      onClick={() => handleReactionClick(rxnId)}
                      className="px-3 py-1.5 rounded-lg bg-reaction text-reaction-foreground text-sm font-mono hover:opacity-90 transition-opacity"
                    >
                      {rxnId}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No neighboring reactions found.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCompound && !loading && !error && (
        <Card className="py-12">
          <CardContent>
            <div className="text-center">
              <Atom className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Enter a SMILES string and click &quot;Search Compound&quot; to explore.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ReactionDetailsDrawer
        reactionId={selectedReaction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

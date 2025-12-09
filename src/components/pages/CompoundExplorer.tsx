import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SmilesBadge } from "@/components/common/SmilesBadge";
import { ReactionDetailsDrawer } from "@/components/common/ReactionDetailsDrawer";
import { mockCompounds } from "@/data/mockData";
import { Search, Atom, FlaskConical, Beaker, ArrowRight } from "lucide-react";

export function CompoundExplorer() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCompound, setSelectedCompound] = useState<typeof mockCompounds[0] | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = () => {
    // Mock: find first matching compound or use first one
    const found = mockCompounds.find(
      (c) =>
        c.smiles.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.label?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setSelectedCompound(found || mockCompounds[0]);
  };

  const handleReactionClick = (reactionId: string) => {
    setSelectedReaction(reactionId);
    setDrawerOpen(true);
  };

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
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 block">SMILES</Label>
              <div className="relative">
                <Atom className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter SMILES (e.g., CCO)"
                  className="pl-9 font-mono"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
            <div className="w-[200px]">
              <Label className="text-sm font-medium mb-2 block">
                Label / Name (optional)
              </Label>
              <Input placeholder="e.g., Ethanol" />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search Compound
            </Button>
          </div>
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
                  <h3 className="text-xl font-mono font-semibold text-foreground">
                    {selectedCompound.smiles}
                  </h3>
                  {selectedCompound.label && (
                    <p className="text-muted-foreground mt-1">
                      {selectedCompound.label}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="font-mono">
                  {selectedCompound.roleCount} roles
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCompound.exampleRoles.map((role, idx) => (
                  <Badge key={idx} variant="outline" className="capitalize">
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-reaction">
                    {selectedCompound.asReactant.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">As Reactant</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-compound">
                    {selectedCompound.asProduct.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">As Product</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-solvent">
                    {selectedCompound.asSolvent.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">As Solvent</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-catalyst">
                    {selectedCompound.asCatalyst.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">As Catalyst</p>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                All reactions where this compound appears in any role:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ...selectedCompound.asReactant,
                  ...selectedCompound.asProduct,
                  ...selectedCompound.asSolvent,
                  ...selectedCompound.asCatalyst,
                ].map((rxnId, idx) => (
                  <button
                    key={`${rxnId}-${idx}`}
                    onClick={() => handleReactionClick(rxnId)}
                    className="px-3 py-1.5 rounded-lg bg-reaction text-reaction-foreground text-sm font-mono hover:opacity-90 transition-opacity"
                  >
                    {rxnId}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCompound && (
        <Card className="py-12">
          <CardContent>
            <div className="text-center">
              <Atom className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Enter a SMILES string and click "Search Compound" to explore
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

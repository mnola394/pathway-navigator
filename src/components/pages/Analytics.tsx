import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart } from "@/components/common/BarChart";
import { Badge } from "@/components/ui/badge";
import {
  mockYieldDistribution,
  mockSolventUsage,
  mockCatalystUsage,
  mockIntermediates,
} from "@/data/mockData";
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Sparkles,
  Network,
} from "lucide-react";

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          High-level statistics and insights from the knowledge graph
        </p>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Distribution of Yields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Reaction yield ranges across the knowledge graph
            </p>
            <BarChart
              data={mockYieldDistribution.map((y) => ({
                name: y.range,
                value: y.count,
                percentage: y.percentage,
              }))}
              colorClass="bg-primary"
              maxBars={5}
            />
          </CardContent>
        </Card>

        {/* High-Yield Reactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-reaction" />
              High-Yield Reactions by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Reactions with yields above 80% for selected products
            </p>
            <div className="space-y-4">
              <Select defaultValue="product1">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product1">c1ccccc1OC(=O)C</SelectItem>
                  <SelectItem value="product2">CCOC(=O)C</SelectItem>
                  <SelectItem value="product3">CCCCO</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                {[
                  { id: "RXN-0003", patent: "US03941123", yield: 91 },
                  { id: "RXN-0007", patent: "US03963145", yield: 94 },
                  { id: "RXN-0010", patent: "US03975234", yield: 96 },
                ].map((rxn) => (
                  <div
                    key={rxn.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <span className="font-mono text-sm text-foreground">
                        {rxn.id}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {rxn.patent}
                      </span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {rxn.yield}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Connected Intermediates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Network className="w-4 h-4 text-compound" />
              Most Connected Intermediates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              High-degree compounds serving as intermediates
            </p>
            <div className="space-y-3">
              {mockIntermediates.map((compound, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm text-foreground truncate max-w-[180px]">
                      {compound.smiles}
                    </p>
                    {compound.label && (
                      <p className="text-xs text-muted-foreground">
                        {compound.label}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono shrink-0">
                    {compound.reactionCount} rxns
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Catalyst & Solvent Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solvents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-solvent" />
              Top 10 Solvents by Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={mockSolventUsage.map((s) => ({
                name: s.name,
                value: s.count,
                percentage: s.percentage,
              }))}
              colorClass="bg-solvent"
              maxBars={10}
            />
          </CardContent>
        </Card>

        {/* Catalysts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-catalyst" />
              Top 10 Catalysts by Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={mockCatalystUsage.map((c) => ({
                name: c.name,
                value: c.count,
                percentage: c.percentage,
              }))}
              colorClass="bg-catalyst"
              maxBars={10}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bridge Compounds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            Bridge Compounds (High Connectivity)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Compounds that connect multiple reaction clusters and serve as key
            intermediates in synthesis pathways
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockIntermediates.slice(0, 4).map((compound, idx) => (
              <div
                key={idx}
                className="p-4 bg-muted/50 rounded-lg text-center border border-border"
              >
                <div className="w-10 h-10 rounded-full bg-compound/10 flex items-center justify-center mx-auto mb-2">
                  <Network className="w-5 h-5 text-compound" />
                </div>
                <p className="font-mono text-xs text-foreground truncate">
                  {compound.smiles}
                </p>
                {compound.label && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {compound.label}
                  </p>
                )}
                <p className="text-xs font-medium text-primary mt-2">
                  {compound.reactionCount} connections
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

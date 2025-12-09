import { useState } from "react";
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
import { mockReactions } from "@/data/mockData";
import { Search, FlaskConical, Filter, Check, X } from "lucide-react";

export function ReactionExplorer() {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = (reactionId: string) => {
    setSelectedReaction(reactionId);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reaction Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search reactions in the knowledge graph
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Reaction ID or Patent ID"
                  className="pl-9"
                />
              </div>
            </div>

            {/* <div className="w-[160px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Filter by Year
              </label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="1976">1976</SelectItem>
                  <SelectItem value="1977">1977</SelectItem>
                  <SelectItem value="1978">1978</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="w-[180px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Filter by Role
              </label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reactions</SelectItem>
                  <SelectItem value="catalyst">Has catalyst</SelectItem>
                  <SelectItem value="solvent">Has solvent</SelectItem>
                  <SelectItem value="agent">Has agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-reaction" />
            Reactions
            <Badge variant="secondary" className="ml-2 font-mono">
              {mockReactions.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[120px]">Reaction ID</TableHead>
                <TableHead className="text-xs w-[120px]">Patent ID</TableHead>
                <TableHead className="text-xs text-center w-[100px]">
                  #Reactants
                </TableHead>
                <TableHead className="text-xs text-center w-[100px]">
                  #Products
                </TableHead>
                <TableHead className="text-xs text-center w-[100px]">
                  Has Solvent?
                </TableHead>
                <TableHead className="text-xs text-center w-[100px]">
                  Has Catalyst?
                </TableHead>
                <TableHead className="text-xs text-center w-[80px]">
                  Yield
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReactions.map((reaction) => (
                <TableRow
                  key={reaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(reaction.id)}
                >
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    {reaction.id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {reaction.patentId}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {reaction.reactants.length}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {reaction.products.length}
                  </TableCell>
                  <TableCell className="text-center">
                    {reaction.solvents.length > 0 ? (
                      <Check className="w-4 h-4 text-reaction mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {reaction.catalysts.length > 0 ? (
                      <Check className="w-4 h-4 text-catalyst mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs font-mono">
                    {reaction.yield ? `${reaction.yield}%` : "—"}
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

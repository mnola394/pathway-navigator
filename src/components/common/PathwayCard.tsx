import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmilesBadge } from "./SmilesBadge";
import { ReactionBadge } from "./ReactionBadge";
import { ArrowRight, FileText, TrendingUp } from "lucide-react";
import { Pathway } from "@/data/mockData";

interface PathwayCardProps {
  pathway: Pathway;
  onReactionClick: (reactionId: string) => void;
}

export function PathwayCard({ pathway, onReactionClick }: PathwayCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {pathway.steps} step{pathway.steps > 1 ? "s" : ""}
            </Badge>
            <span className="text-muted-foreground">{pathway.id}</span>
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>Avg yield: {pathway.avgYield}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {pathway.compounds.map((compound, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <SmilesBadge
                smiles={compound}
                variant={idx === 0 ? "reactant" : idx === pathway.compounds.length - 1 ? "product" : "default"}
              />
              {idx < pathway.reactions.length && (
                <>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <ReactionBadge
                    reactionId={pathway.reactions[idx]}
                    onClick={() => onReactionClick(pathway.reactions[idx])}
                  />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Patents: {pathway.patents.join(", ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

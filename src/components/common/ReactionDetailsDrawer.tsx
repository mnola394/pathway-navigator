import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SmilesBadge } from "./SmilesBadge";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

import {
  getReactionParticipants,
  type ReactionParticipant,
} from "@/services/pathwayService"; 
interface ReactionDetailsDrawerProps {
  reactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactionDetailsDrawer({
  reactionId,
  open,
  onOpenChange,
}: ReactionDetailsDrawerProps) {
  const [participants, setParticipants] = useState<ReactionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !reactionId) {
      return;
    }

    setLoading(true);
    setError(null);
    setParticipants([]);

    getReactionParticipants(reactionId)
      .then((res) => {
        console.log("ReactionDetailsDrawer participants:", res); 
        setParticipants(res);
      })
      .catch((err) => {
        console.error("Failed to load reaction details", err);
        setError("Failed to load reaction details from GraphDB.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, reactionId]);

  const patentId =
    participants.length > 0 ? participants[0].patentId ?? null : null;
  const patentIri =
    participants.length > 0 ? participants[0].patentIri ?? null : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="
          reaction-scroll
          w-full sm:max-w-3xl mx-auto max-h-[100vh]
          overflow-y-auto bg-card rounded-t-xl sm:rounded-xl border
        "
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-reaction flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-reaction-foreground" />
            </div>
            <div>
              <SheetTitle className="text-foreground">
                Reaction {reactionId ?? ""}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Reaction details and components (from GraphDB)
              </SheetDescription>

              {patentId && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 text-md px-2 py-1 rounded-full"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="uppercase tracking-wide">Patent</span>
                    <span className="font-mono">{patentId}</span>
                  </Badge>

                  {patentIri && (
                    <span className="text-[11px] text-muted-foreground break-all">
                      {patentIri}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading reaction details…
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && participants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No components found for this reaction.
            </p>
          )}

          {!loading && !error && participants.length > 0 && (
            <>
              {renderRoleSection("Reactants", "hasReactant", participants)}
              {renderRoleSection("Products", "hasProduct", participants)}
              {renderRoleSection("Agents", "hasAgent", participants)}
              {renderRoleSection("Catalysts", "hasCatalyst", participants)}
              {renderRoleSection("Solvents", "hasSolvent", participants)}

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  SPARQL used
                </h4>
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">
                  {`PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?role ?cmpSmiles ?cmpLabel
  ?patent ?patentId
WHERE {
  # Lookup reaction by ID, then get patent + participants
  ?rxn ck:reactionId "${reactionId ?? ""}" .

  # Patent documentation
  ?rxn ck:documentedIn ?patent .
  OPTIONAL { ?patent ck:hasPatentId ?patentId }

  # Reaction components
  ?rxn ?prop ?cmp .

  VALUES ?prop {
    ck:hasReactant
    ck:hasProduct
    ck:hasCatalyst
    ck:hasSolvent
    ck:hasAgent
  }

  BIND(REPLACE(STR(?prop), "http://example.org/chemkg#", "") AS ?role)

  OPTIONAL { ?cmp ck:smiles ?cmpSmiles }
  OPTIONAL { ?cmp ck:label  ?cmpLabel }
}
ORDER BY ?role ?cmpSmiles`}
                </pre>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


function renderRoleSection(
  title: string,
  roleKey: string,
  participants: ReactionParticipant[]
) {
  const items = participants.filter((p) => p.role === roleKey);

  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((p, idx) => {
          const label = p.smiles ?? p.label ?? "(unknown)";
          let variant:
            | "reactant"
            | "product"
            | "catalyst"
            | "solvent"
            | undefined;
          if (roleKey === "hasReactant") variant = "reactant";
          if (roleKey === "hasProduct") variant = "product";
          if (roleKey === "hasCatalyst") variant = "catalyst";
          if (roleKey === "hasSolvent") variant = "solvent";

          return <SmilesBadge key={idx} smiles={label} variant={variant} />;
        })}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Database,
  Route,
  Code,
  Lightbulb,
  ExternalLink,
  FlaskConical,
  FileText,
  Network,
} from "lucide-react";

export function About() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About / Help</h1>
        <p className="text-muted-foreground mt-1">
          Learn what this demo does, how the chemical knowledge graph is built,
          and how to use the Pathway Explorer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            What is Pathway Explorer?
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed">
            Pathway Explorer is a small, focused{" "}
            <span className="font-medium">chemical reaction knowledge graph</span>{" "}
            demo. It lets you search for compounds, inspect reactions from
            patents, and discover multi-step synthetic routes between
            compounds using SPARQL over an RDF graph.
          </p>
          <p className="text-foreground leading-relaxed mt-2">
            Instead of free-text searching the patents, you explore the network
            of <span className="font-medium">compounds</span> and{" "}
            <span className="font-medium">reactions</span>: who reacts with
            whom, which patents they appear in, and how to get from a set of
            starting materials to a desired target molecule.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Route className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Pathway Discovery
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Find one- to multi-step routes between compounds, with support
                  for multiple starting and target SMILES and a step cap.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <FlaskConical className="w-5 h-5 text-reaction shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Reaction Explorer
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse reactions from individual patents and inspect all
                  reactants, products, solvents, catalysts, and agents for a
                  given reaction.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Network className="w-5 h-5 text-compound shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Compound Explorer
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search for a compound by SMILES or name and see how often it
                  appears, in which roles, and in which reactions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            How the Chemical Knowledge Graph is Built
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            The current graph is a <span className="font-medium">1976-only</span>{" "}
            snapshot built from USPTO chemical patent grants. CML (Chemical
            Markup Language) files are converted into RDF triples and loaded
            into GraphDB.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                1
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Data Source: USPTO 1976 Grants
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reaction information is extracted from the{" "}
                  <span className="font-medium">USPTO 1976 grant CML</span>{" "}
                  collection (one XML file per grant week). Each CML file
                  contains reaction SMILES, participants, and metadata.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                2
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  CML Parsing & Normalization
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  A Python ETL pipeline parses CML, extracts{" "}
                  <span className="font-medium">
                    reactants, products, solvents, catalysts, and agents
                  </span>
                  , and normalizes compounds by SMILES into unique nodes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                3
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  RDF Generation & Ontology
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Each patent reaction becomes a <code>ck:Reaction</code> node.
                  Compounds are <code>ck:Compound</code> nodes linked via{" "}
                  <code>ck:hasReactant</code>, <code>ck:hasProduct</code>,{" "}
                  <code>ck:hasSolvent</code>, <code>ck:hasAgent</code>, and{" "}
                  <code>ck:hasCatalyst</code>. An OWL ontology defines these
                  classes and properties.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                4
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Loading into GraphDB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The generated Turtle file (<code>uspto_1976_chemkg.ttl</code>)
                  and the ontology (<code>ontology.owl</code>) are imported into
                  GraphDB. All app features (search, stats, pathways) are
                  implemented as SPARQL queries against this repository.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            Future Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Data & Coverage
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Add 2001 USPTO applications and more grant years.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Link compounds to external resources (PubChem, ChEMBL).
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Store more reaction conditions (temperature, time, yields).
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                Pathway & UI Enhancements
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Smarter pathway ranking (shortest first, role filters, and
                  cost functions).
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Better error messages and debugging for complex paths.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Visual graph views for compounds and reactions.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Current UI Sections
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <Badge variant="outline" className="justify-center">
                Pathway Explorer
              </Badge>
              <Badge variant="outline" className="justify-center">
                Reaction Explorer
              </Badge>
              <Badge variant="outline" className="justify-center">
                Compound Explorer
              </Badge>
              <Badge variant="outline" className="justify-center">
                Dashboard Stats
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <Badge>React</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>shadcn/ui</Badge>
            <Badge variant="outline">GraphDB</Badge>
            <Badge variant="outline">SPARQL</Badge>
            <Badge variant="outline">RDF / OWL</Badge>
            <Badge variant="outline">USPTO CML ETL (Python)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
          Learn about Pathway Explorer and the Chemical Knowledge Graph
        </p>
      </div>

      {/* What is Pathway Explorer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            What is Pathway Explorer?
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed">
            Pathway Explorer is a web-based tool for navigating and exploring
            chemical reaction pathways stored in a knowledge graph. Think of it
            as a "search engine for chemistry" — but instead of free-text
            queries, you explore via structured filters, compound searches, and
            pathway discovery tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Route className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Pathway Discovery
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Find multi-step reaction routes between any two compounds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <FlaskConical className="w-5 h-5 text-reaction shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Reaction Exploration
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Browse reactions by patent, year, or chemical role
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Network className="w-5 h-5 text-compound shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  Graph Analytics
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analyze yields, catalysts, solvents, and intermediates
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How the KG is Built */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            How the Chemical Knowledge Graph is Built
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            The knowledge graph is constructed from publicly available chemical
            patent data and stored in GraphDB for efficient querying.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                1
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Data Source: USPTO 1976 Grants Dataset
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chemical reactions extracted from US patent grants issued in
                  1976, containing detailed reaction schemas in CML format.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                2
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  CML Parsing & Extraction
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chemical Markup Language (CML) files are parsed to extract
                  reactants, products, agents, catalysts, solvents, and yields.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                3
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  RDF Generation (OWL Ontology)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extracted data is transformed into RDF triples aligned with a
                  custom OWL ontology for chemical reactions and compounds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                4
              </Badge>
              <div>
                <p className="font-medium text-foreground text-sm">
                  SPARQL on GraphDB
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The RDF graph is loaded into GraphDB, enabling powerful SPARQL
                  queries for pathway discovery, analytics, and exploration.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Work */}
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
                Data Integration
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Integration with PubChemRDF
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  ChEMBL-RDF compound linking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Extended USPTO years coverage
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                <Code className="w-4 h-4" />
                Feature Enhancements
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Yield and condition metadata
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Provenance-aware exploration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reaction shrink-0" />
                  Per-patent and per-reaction views
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Planned UI Endpoints
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <Badge variant="outline" className="justify-center">
                Start/Target Search
              </Badge>
              <Badge variant="outline" className="justify-center">
                Step Cap Filter
              </Badge>
              <Badge variant="outline" className="justify-center">
                Provenance Drawer
              </Badge>
              <Badge variant="outline" className="justify-center">
                Node Expansion
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>React</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>shadcn/ui</Badge>
            <Badge variant="outline">GraphDB (Backend)</Badge>
            <Badge variant="outline">SPARQL</Badge>
            <Badge variant="outline">RDF/OWL</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

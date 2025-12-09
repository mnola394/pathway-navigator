// src/services/chemkgService.ts
import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

/* ---------- STATS (already have this) ---------- */

export interface DashboardStats {
  totalReactions: number;
  totalCompounds: number;
  patentsCovered: number;
}

const DASHBOARD_STATS_QUERY = `
PREFIX ck: <http://example.org/chemkg#>

SELECT
    (COUNT(DISTINCT ?rxn) AS ?totalReactions)
    (COUNT(DISTINCT ?cmp) AS ?totalCompounds)
    (COUNT(DISTINCT ?pat) AS ?totalPatents)
WHERE {
    { ?rxn a ck:Reaction }
    UNION
    { ?cmp a ck:Compound }
    UNION
    { ?pat a ck:Patent }
}
`;

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await executeSparqlQuery(DASHBOARD_STATS_QUERY, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  const binding = data.results.bindings[0];
  if (!binding) throw new Error("No dashboard stats returned from chemkg");

  return {
    totalReactions: Number(binding.totalReactions.value),
    totalCompounds: Number(binding.totalCompounds.value),
    patentsCovered: Number(binding.totalPatents.value),
  };
}

/* ---------- TOP SOLVENTS BY USAGE ---------- */

export interface TopSolvent {
  solvent: string;          // IRI
  smiles?: string | null;
  label?: string | null;
  timesUsed: number;
}

const TOP_SOLVENTS_QUERY = `
PREFIX ck: <http://example.org/chemkg#>

SELECT
    ?solvent
    ?smiles
    ?label
    (COUNT(DISTINCT ?rxn) AS ?timesUsed)
WHERE {
    ?rxn ck:hasSolvent ?solvent .

    OPTIONAL { ?solvent ck:smiles ?smiles }
    OPTIONAL { ?solvent ck:label  ?label  }
}
GROUP BY ?solvent ?smiles ?label
ORDER BY DESC(?timesUsed)
LIMIT 20
`;

export async function getTopSolvents(): Promise<TopSolvent[]> {
  const data: SparqlJsonResult = await executeSparqlQuery(TOP_SOLVENTS_QUERY, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b) => ({
    solvent: b.solvent.value,
    smiles: b.smiles?.value ?? null,
    label: b.label?.value ?? null,
    timesUsed: Number(b.timesUsed.value),
  }));
}

/* ---------- RECENT REACTIONS ---------- */

export interface RecentReaction {
  rxn: string;                 // IRI
  reactionId?: string | null;
  year?: number | null;
  reactionSmiles?: string | null;
}

const RECENT_REACTIONS_QUERY = `
PREFIX ck: <http://example.org/chemkg#>

SELECT
    ?rxn
    ?reactionId
    ?year
    ?reactionSmiles
WHERE {
    ?rxn a ck:Reaction .

    OPTIONAL { ?rxn ck:reactionId     ?reactionId }
    OPTIONAL { ?rxn ck:year           ?year }
    OPTIONAL { ?rxn ck:reactionSmiles ?reactionSmiles }
}
ORDER BY DESC(?year) DESC(?reactionId)
LIMIT 20
`;

export async function getRecentReactions(): Promise<RecentReaction[]> {
  const data: SparqlJsonResult = await executeSparqlQuery(RECENT_REACTIONS_QUERY, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b) => ({
    rxn: b.rxn.value,
    reactionId: b.reactionId?.value ?? null,
    year: b.year ? Number(b.year.value) : null,
    reactionSmiles: b.reactionSmiles?.value ?? null,
  }));
}

/* ---------- POPULAR COMPOUNDS ACROSS ANY ROLE ---------- */

export interface PopularCompound {
  compound: string;           // IRI
  smiles?: string | null;
  label?: string | null;
  reactionsInvolved: number;
}

const POPULAR_COMPOUNDS_QUERY = `
PREFIX ck: <http://example.org/chemkg#>

SELECT
    ?compound
    ?smiles
    ?label
    (COUNT(DISTINCT ?rxn) AS ?reactionsInvolved)
WHERE {
    ?rxn a ck:Reaction ;
         ?roleProp ?compound .

    FILTER(?roleProp IN (
        ck:hasReactant,
        ck:hasProduct,
        ck:hasSolvent,
        ck:hasCatalyst
    ))

    OPTIONAL { ?compound ck:smiles ?smiles }
    OPTIONAL { ?compound ck:label  ?label  }
}
GROUP BY ?compound ?smiles ?label
ORDER BY DESC(?reactionsInvolved)
LIMIT 30
`;

export async function getPopularCompounds(): Promise<PopularCompound[]> {
  const data: SparqlJsonResult = await executeSparqlQuery(POPULAR_COMPOUNDS_QUERY, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b) => ({
    compound: b.compound.value,
    smiles: b.smiles?.value ?? null,
    label: b.label?.value ?? null,
    reactionsInvolved: Number(b.reactionsInvolved.value),
  }));
}

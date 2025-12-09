// src/services/compoundRoleService.ts
import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

// --- helpers ----------------------------------------------------

/** Escape " and backslash for use in SPARQL string literals. */
function escapeLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// --- types ------------------------------------------------------

export interface CompoundRoleStats {
  compoundIri: string;
  smiles: string | null;
  label: string | null;

  /** number of DISTINCT reactions where it appears in any of the 5 roles */
  totalRoles: number;

  asReactant: number;
  asProduct: number;
  asSolvent: number;
  asCatalyst: number;
  asAgent: number;
}

export interface CompoundRoleReaction {
  /** "hasReactant", "hasProduct", "hasSolvent", "hasCatalyst", "hasAgent" */
  role: string;
  reactionIri: string;
  reactionId: string | null;
}

// --- query builders: by IRI (preferred) -------------------------

/**
 * Stats query: counts per role + total, binding the given compound IRI.
 */
function buildRoleStatsQueryByIri(compoundIri: string): string {
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?compound
  ?smiles
  ?label
  (COUNT(DISTINCT ?rxn) AS ?totalRoles)
  (SUM(?isReactant) AS ?asReactant)
  (SUM(?isProduct)  AS ?asProduct)
  (SUM(?isSolvent)  AS ?asSolvent)
  (SUM(?isCatalyst) AS ?asCatalyst)
  (SUM(?isAgent)    AS ?asAgent)
WHERE {
  # pick the compound by IRI
  BIND(<${compoundIri}> AS ?compound)

  OPTIONAL { ?compound ck:smiles ?smiles . }
  OPTIONAL { ?compound ck:label  ?label  . }

  # any reaction where it appears in *any* role
  ?rxn ?prop ?compound .

  VALUES ?prop {
    ck:hasReactant
    ck:hasProduct
    ck:hasSolvent
    ck:hasCatalyst
    ck:hasAgent
  }

  # flags for each role
  BIND(IF(?prop = ck:hasReactant, 1, 0) AS ?isReactant)
  BIND(IF(?prop = ck:hasProduct,  1, 0) AS ?isProduct)
  BIND(IF(?prop = ck:hasSolvent,  1, 0) AS ?isSolvent)
  BIND(IF(?prop = ck:hasCatalyst, 1, 0) AS ?isCatalyst)
  BIND(IF(?prop = ck:hasAgent,    1, 0) AS ?isAgent)
}
GROUP BY ?compound ?smiles ?label
`;
}

/**
 * Reaction list query: list of reactions per role for a compound IRI.
 */
function buildRoleReactionsQueryByIri(compoundIri: string): string {
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
  ?role
  ?rxn
  ?reactionId
WHERE {
  # pick the compound by IRI
  BIND(<${compoundIri}> AS ?compound)

  ?rxn ?prop ?compound .

  VALUES ?prop {
    ck:hasReactant
    ck:hasProduct
    ck:hasSolvent
    ck:hasCatalyst
    ck:hasAgent
  }

  OPTIONAL { ?rxn ck:reactionId ?reactionId . }

  BIND(REPLACE(STR(?prop), "http://example.org/chemkg#", "") AS ?role)
}
ORDER BY ?role ?reactionId
LIMIT 200
`;
}

// --- optional: query builders by SMILES (for quick testing) -----

function buildRoleStatsQueryBySmiles(smiles: string): string {
  const lit = escapeLiteral(smiles);
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?compound
  ?smiles
  ?label
  (COUNT(DISTINCT ?rxn) AS ?totalRoles)
  (SUM(?isReactant) AS ?asReactant)
  (SUM(?isProduct)  AS ?asProduct)
  (SUM(?isSolvent)  AS ?asSolvent)
  (SUM(?isCatalyst) AS ?asCatalyst)
  (SUM(?isAgent)    AS ?asAgent)
WHERE {
  # pick the compound by SMILES
  ?compound ck:smiles "${lit}" .
  OPTIONAL { ?compound ck:smiles ?smiles . }
  OPTIONAL { ?compound ck:label  ?label  . }

  ?rxn ?prop ?compound .

  VALUES ?prop {
    ck:hasReactant
    ck:hasProduct
    ck:hasSolvent
    ck:hasCatalyst
    ck:hasAgent
  }

  BIND(IF(?prop = ck:hasReactant, 1, 0) AS ?isReactant)
  BIND(IF(?prop = ck:hasProduct,  1, 0) AS ?isProduct)
  BIND(IF(?prop = ck:hasSolvent,  1, 0) AS ?isSolvent)
  BIND(IF(?prop = ck:hasCatalyst, 1, 0) AS ?isCatalyst)
  BIND(IF(?prop = ck:hasAgent,    1, 0) AS ?isAgent)
}
GROUP BY ?compound ?smiles ?label
`;
}

function buildRoleReactionsQueryBySmiles(smiles: string): string {
  const lit = escapeLiteral(smiles);
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
  ?role
  ?rxn
  ?reactionId
WHERE {
  ?compound ck:smiles "${lit}" .

  ?rxn ?prop ?compound .

  VALUES ?prop {
    ck:hasReactant
    ck:hasProduct
    ck:hasSolvent
    ck:hasCatalyst
    ck:hasAgent
  }

  OPTIONAL { ?rxn ck:reactionId ?reactionId . }

  BIND(REPLACE(STR(?prop), "http://example.org/chemkg#", "") AS ?role)
}
ORDER BY ?role ?reactionId
LIMIT 200
`;
}

// --- public API: by IRI (recommended) ---------------------------

export async function getCompoundRoleStatsByIri(
  compoundIri: string
): Promise<CompoundRoleStats | null> {
  const query = buildRoleStatsQueryByIri(compoundIri);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  if (data.results.bindings.length === 0) return null;

  const b = data.results.bindings[0];

  const parseIntSafely = (v?: { value: string }) =>
    v?.value != null ? Number(v.value) || 0 : 0;

  return {
    compoundIri: b.compound?.value ?? compoundIri,
    smiles: b.smiles?.value ?? null,
    label: b.label?.value ?? null,
    totalRoles: parseIntSafely(b.totalRoles),
    asReactant: parseIntSafely(b.asReactant),
    asProduct: parseIntSafely(b.asProduct),
    asSolvent: parseIntSafely(b.asSolvent),
    asCatalyst: parseIntSafely(b.asCatalyst),
    asAgent: parseIntSafely(b.asAgent),
  };
}

export async function getCompoundRoleReactionsByIri(
  compoundIri: string
): Promise<CompoundRoleReaction[]> {
  const query = buildRoleReactionsQueryByIri(compoundIri);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b) => ({
    role: b.role?.value ?? "",
    reactionIri: b.rxn?.value ?? "",
    reactionId: b.reactionId?.value ?? null,
  }));
}

// --- optional API: by SMILES (useful from a quick input) --------

export async function getCompoundRoleStatsBySmiles(
  smiles: string
): Promise<CompoundRoleStats | null> {
  const query = buildRoleStatsQueryBySmiles(smiles);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  if (data.results.bindings.length === 0) return null;

  const b = data.results.bindings[0];

  const parseIntSafely = (v?: { value: string }) =>
    v?.value != null ? Number(v.value) || 0 : 0;

  return {
    compoundIri: b.compound?.value ?? "",
    smiles: b.smiles?.value ?? smiles,
    label: b.label?.value ?? null,
    totalRoles: parseIntSafely(b.totalRoles),
    asReactant: parseIntSafely(b.asReactant),
    asProduct: parseIntSafely(b.asProduct),
    asSolvent: parseIntSafely(b.asSolvent),
    asCatalyst: parseIntSafely(b.asCatalyst),
    asAgent: parseIntSafely(b.asAgent),
  };
}

export async function getCompoundRoleReactionsBySmiles(
  smiles: string
): Promise<CompoundRoleReaction[]> {
  const query = buildRoleReactionsQueryBySmiles(smiles);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b) => ({
    role: b.role?.value ?? "",
    reactionIri: b.rxn?.value ?? "",
    reactionId: b.reactionId?.value ?? null,
  }));
}

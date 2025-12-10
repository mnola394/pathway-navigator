import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

function escapeLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export interface CompoundRoleStats {
  compoundIri: string;
  smiles: string | null;
  label: string | null;
  totalRoles: number;
  asReactant: number;
  asProduct: number;
  asSolvent: number;
  asCatalyst: number;
  asAgent: number;
}

export interface CompoundRoleReaction {
  role: string;
  reactionIri: string;
  reactionId: string | null;
}

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
  BIND(<${compoundIri}> AS ?compound)

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

function buildRoleReactionsQueryByIri(compoundIri: string): string {
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
  ?role
  ?rxn
  ?reactionId
WHERE {
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

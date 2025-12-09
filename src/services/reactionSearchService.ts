// src/services/reactionSearchService.ts
import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

const escapeLiteral = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export interface ReactionSearchFilters {
  text?: string;                 // free-text query (reaction ID, SMILES, labels, patent ID…)
  reactantSmiles?: string;       // only reactions where this SMILES is a reactant
  productSmiles?: string;        // only reactions where this SMILES is a product
  requireCatalyst?: boolean;     // true = must have catalyst, false = must NOT have catalyst, undefined = ignore
  requireSolvent?: boolean;      // same as above but for solvent
  limit?: number;
  offset?: number;
}

export interface ReactionSearchResult {
  reactionIri: string;
  reactionId: string | null;
  reactionSmiles: string | null;
  patentId: string | null;
  reactantSmiles: string[];   // from GROUP_CONCAT
  productSmiles: string[];    // from GROUP_CONCAT
}

/**
 * Build the SPARQL query string for reaction search.
 */
export function buildReactionSearchQuery(options: ReactionSearchFilters): string {
  const {
    text,
    reactantSmiles,
    productSmiles,
    requireCatalyst,
    requireSolvent,
    limit = 50,
    offset = 0,
  } = options;

  // free-text term (empty string disables filter)
  const q =
    text && text.trim().length > 0
      ? `"${escapeLiteral(text.trim().toLowerCase())}"`
      : '""';

  // optional reactant / product filters
  let reactantFilter = "";
  if (reactantSmiles && reactantSmiles.trim().length > 0) {
    const lit = `"${escapeLiteral(reactantSmiles.trim())}"`;
    reactantFilter = `
      FILTER EXISTS {
        ?rxn ck:hasReactant ?r2 .
        ?r2 ck:smiles ${lit} .
      }
    `;
  }

  let productFilter = "";
  if (productSmiles && productSmiles.trim().length > 0) {
    const lit = `"${escapeLiteral(productSmiles.trim())}"`;
    productFilter = `
      FILTER EXISTS {
        ?rxn ck:hasProduct ?p2 .
        ?p2 ck:smiles ${lit} .
      }
    `;
  }

  // catalyst toggle
  let catalystFilter = "";
  if (requireCatalyst === true) {
    catalystFilter = `FILTER EXISTS { ?rxn ck:hasCatalyst ?cat . }`;
  } else if (requireCatalyst === false) {
    catalystFilter = `FILTER NOT EXISTS { ?rxn ck:hasCatalyst ?cat . }`;
  }

  // solvent toggle
  let solventFilter = "";
  if (requireSolvent === true) {
    solventFilter = `FILTER EXISTS { ?rxn ck:hasSolvent ?solv . }`;
  } else if (requireSolvent === false) {
    solventFilter = `FILTER NOT EXISTS { ?rxn ck:hasSolvent ?solv . }`;
  }

  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
  ?rxn
  ?reactionId
  ?reactionSmiles
  ?patentId
  (GROUP_CONCAT(DISTINCT ?rSmiles; separator=", ") AS ?reactantSmiles)
  (GROUP_CONCAT(DISTINCT ?pSmiles; separator=", ") AS ?productSmiles)
WHERE {
  ?rxn a ck:Reaction .

  OPTIONAL { ?rxn ck:reactionId     ?reactionId . }
  OPTIONAL { ?rxn ck:reactionSmiles ?reactionSmiles . }
  OPTIONAL {
    ?rxn ck:documentedIn ?patent .
    OPTIONAL { ?patent ck:hasPatentId ?patentId . }
  }

  # --- reactants / products ---
  OPTIONAL {
    ?rxn ck:hasReactant ?r .
    OPTIONAL { ?r ck:smiles ?rSmiles . }
    OPTIONAL { ?r ck:label  ?rLabel  . }
  }

  OPTIONAL {
    ?rxn ck:hasProduct ?p .
    OPTIONAL { ?p ck:smiles ?pSmiles . }
    OPTIONAL { ?p ck:label  ?pLabel  . }
  }

  # --- free-text search term (empty string disables) ---
  BIND( ${q} AS ?q )

  FILTER(
      ?q = "" ||
      (BOUND(?reactionId)     && CONTAINS(LCASE(?reactionId),     ?q)) ||
      (BOUND(?reactionSmiles) && CONTAINS(LCASE(?reactionSmiles), ?q)) ||
      (BOUND(?patentId)       && CONTAINS(LCASE(?patentId),       ?q)) ||
      (BOUND(?rSmiles)        && CONTAINS(LCASE(?rSmiles),        ?q)) ||
      (BOUND(?pSmiles)        && CONTAINS(LCASE(?pSmiles),        ?q)) ||
      (BOUND(?rLabel)         && CONTAINS(LCASE(?rLabel),         ?q)) ||
      (BOUND(?pLabel)         && CONTAINS(LCASE(?pLabel),         ?q))
  )

  ${reactantFilter}
  ${productFilter}
  ${catalystFilter}
  ${solventFilter}
}
GROUP BY
  ?rxn ?reactionId ?reactionSmiles ?patentId
ORDER BY COALESCE(?reactionId, ?reactionSmiles)
LIMIT ${limit}
OFFSET ${offset}
`;
}

/**
 * Execute reaction search and parse results into a TS-friendly shape.
 */
export async function searchReactions(
  options: ReactionSearchFilters
): Promise<ReactionSearchResult[]> {
  const query = buildReactionSearchQuery(options);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  return data.results.bindings.map((b: any) => {
    const reactants = b.reactantSmiles?.value ?? "";
    const products = b.productSmiles?.value ?? "";

    return {
      reactionIri: b.rxn?.value ?? "",
      reactionId: b.reactionId?.value ?? null,
      reactionSmiles: b.reactionSmiles?.value ?? null,
      patentId: b.patentId?.value ?? null,
      reactantSmiles: reactants
        ? reactants.split(/\s*,\s*/).filter(Boolean)
        : [],
      productSmiles: products
        ? products.split(/\s*,\s*/).filter(Boolean)
        : [],
    };
  });
}

// src/services/searchService.ts
import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

export interface CompoundSearchResult {
  compoundIri: string;
  smiles: string | null;
  label: string | null;
  score: number;
  reactionCount: number;
}

/**
 * Escape " and \ for use inside a SPARQL string literal.
 */
const escapeLiteral = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/**
 * Build the scored compound search query.
 */
const COMPOUND_SEARCH_QUERY = (term: string, limit = 20): string => {
  const escaped = escapeLiteral(term); // we let SPARQL do LCASE()

  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?compound
  ?smiles
  ?label
  (SUM(?matchScore) AS ?score)
  (COUNT(DISTINCT ?rxn) AS ?reactionCount)
WHERE {
  # your input term (case-insensitive)
  BIND(LCASE("${escaped}") AS ?q)

  ?compound a ck:Compound .
  OPTIONAL { ?compound ck:smiles ?smiles . }
  OPTIONAL { ?compound ck:label  ?label  . }

  # attach any reactions / patents involving this compound
  OPTIONAL {
    ?rxn (ck:hasReactant|ck:hasProduct|ck:hasAgent) ?compound .

    OPTIONAL { ?rxn ck:reactionSmiles ?rxnSmiles . }
    OPTIONAL { ?rxn ck:reactionId     ?rxnId      . }

    OPTIONAL {
      ?rxn ck:documentedIn ?patent .
      OPTIONAL { ?patent ck:hasPatentId ?patentId }
    }
  }

  # ---------- scoring ----------

  # SMILES score
  BIND(
    IF(BOUND(?smiles) && LCASE(?smiles) = ?q,
       20,
       IF(BOUND(?smiles) && CONTAINS(LCASE(?smiles), ?q),
          10,
          0
       )
    )
    AS ?scoreSmiles
  )

  # label / common name score
  BIND(
    IF(BOUND(?label) && CONTAINS(LCASE(?label), ?q),
       8,
       0
    )
    AS ?scoreLabel
  )

  # reaction-level matches
  BIND(
    IF(BOUND(?rxnSmiles) && CONTAINS(LCASE(?rxnSmiles), ?q),
       4,
       0
    )
    AS ?scoreRxnSmiles
  )

  BIND(
    IF(BOUND(?rxnId) && CONTAINS(LCASE(?rxnId), ?q),
       2,
       0
    )
    AS ?scoreRxnId
  )

  # patent ID match
  BIND(
    IF(BOUND(?patentId) && CONTAINS(LCASE(?patentId), ?q),
       1,
       0
    )
    AS ?scorePatent
  )

  # total score for this (compound, reaction) row
  BIND(
    (?scoreSmiles + ?scoreLabel + ?scoreRxnSmiles + ?scoreRxnId + ?scorePatent)
    AS ?matchScore
  )

  # ignore non-matches
  FILTER(?matchScore > 0)
}
GROUP BY ?compound ?smiles ?label
HAVING (SUM(?matchScore) > 0)
ORDER BY DESC(?score) DESC(?reactionCount)
LIMIT ${limit}
`;
};

/**
 * High-level API: search compounds by a free-text or SMILES-like term.
 */
export async function searchCompounds(
  term: string,
  limit = 20
): Promise<CompoundSearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) {
    return [];
  }

  const query = COMPOUND_SEARCH_QUERY(trimmed, limit);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  const bindings = data.results?.bindings ?? [];

  const results: CompoundSearchResult[] = bindings.map((b: any) => ({
    compoundIri: b.compound?.value ?? "",
    smiles: b.smiles?.value ?? null,
    label: b.label?.value ?? null,
    score: b.score ? Number(b.score.value) : 0,
    reactionCount: b.reactionCount ? Number(b.reactionCount.value) : 0,
  }));

  console.log("searchCompounds results:", results);
  return results;
}

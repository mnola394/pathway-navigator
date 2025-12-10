import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

export interface CompoundSearchResult {
  compoundIri: string;
  smiles: string | null;
  label: string | null;
  score: number;
  reactionCount: number;
}

const escapeLiteral = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const COMPOUND_SEARCH_QUERY = (term: string, limit = 20): string => {
  const escaped = escapeLiteral(term);
  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?compound
  ?smiles
  ?label
  ( ?scoreSmiles + ?scoreLabel AS ?score )
  ( COUNT(DISTINCT ?rxn) AS ?reactionCount )
WHERE {
  BIND(LCASE("${escaped}") AS ?q)

  ?compound a ck:Compound .
  OPTIONAL { ?compound ck:smiles ?smiles . }
  OPTIONAL { ?compound ck:label  ?label  . }

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

  BIND(
    IF(BOUND(?label) && CONTAINS(LCASE(?label), ?q),
       8,
       0
    )
    AS ?scoreLabel
  )

  FILTER(?scoreSmiles + ?scoreLabel > 0)

  OPTIONAL {
    ?rxn (ck:hasReactant|ck:hasProduct|ck:hasAgent) ?compound .
  }
}
GROUP BY ?compound ?smiles ?label ?scoreSmiles ?scoreLabel
ORDER BY DESC(?score) DESC(?reactionCount)
LIMIT ${limit}
`;
};

export async function searchCompounds(
  term: string,
  limit = 20
): Promise<CompoundSearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

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

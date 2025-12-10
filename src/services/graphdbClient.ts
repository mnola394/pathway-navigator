
const GRAPHDB_BASE_URL = "/graphdb";

interface ExecuteSparqlOptions {
  repositoryId: string;
  infer?: boolean;
  timeoutMs?: number;
}

export interface SparqlJsonResult {
  head: { vars: string[] };
  results: {
    bindings: Array<{
      [key: string]: { type: string; value: string; "xml:lang"?: string; datatype?: string };
    }>;
  };
}

export async function executeSparqlQuery(
  query: string,
  { repositoryId, infer = true, timeoutMs = 30000 }: ExecuteSparqlOptions
): Promise<SparqlJsonResult> {
  const endpoint = `${GRAPHDB_BASE_URL}/repositories/${repositoryId}`;

  const params = new URLSearchParams();
  params.set("infer", infer ? "true" : "false");
  params.set("timeout", timeoutMs.toString());

  const res = await fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/sparql-results+json",
    },
    body: query,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphDB error ${res.status}: ${text}`);
  }

  return res.json();
}

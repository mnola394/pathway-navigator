import { executeSparqlQuery, type SparqlJsonResult } from "./graphdbClient";

const REPOSITORY_ID = "chemkg";

export interface PathSummary {
  startSmiles: string;
  targetSmiles: string;
  steps: number;
}


const escapeLiteral = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');


export const PATH_FIND_TEMPLATE = (
  startList: string[],
  targetList: string[],
  maxSteps: number
): string => {
  if (startList.length === 0) {
    throw new Error("PATH_FIND_TEMPLATE: startList must not be empty");
  }
  if (targetList.length === 0) {
    throw new Error("PATH_FIND_TEMPLATE: targetList must not be empty");
  }
  if (maxSteps < 1) {
    throw new Error("PATH_FIND_TEMPLATE: maxSteps must be >= 1");
  }

  const startValues = startList.map((s) => `"${escapeLiteral(s)}"`).join(" ");
  const targetValues = targetList.map((s) => `"${escapeLiteral(s)}"`).join(" ");

  const stepBlocks = Array.from({ length: maxSteps }, (_, i) => {
    const step = i + 1;
    const path = Array(step)
      .fill("(^ck:hasReactant/ck:hasProduct)")
      .join("/");

    return `
        ${step === 1 ? "" : "UNION"}
        {
            ?start ${path} ?target .
            BIND(${step} AS ?steps)
        }`;
  }).join("\n");

  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
    ?startSmiles
    ?targetSmiles
    ?steps
WHERE {

    # START COMPOUNDS
    VALUES ?startSmiles {
        ${startValues}
    }

    # TARGET COMPOUNDS
    VALUES ?targetSmiles {
        ${targetValues}
    }

    # Map to URIs
    ?start  ck:smiles ?startSmiles .
    ?target ck:smiles ?targetSmiles .

    # ----- GENERATED STEP BLOCKS -----
    ${stepBlocks}
}
ORDER BY ?steps
LIMIT 200
`;
};

export interface FindPathsOptions {
  startSmiles: string[];
  targetSmiles: string[];
  maxSteps: number;
  shortestOnly?: boolean;
}


export async function findPaths({
  startSmiles,
  targetSmiles,
  maxSteps,
  shortestOnly = false,
}: FindPathsOptions): Promise<PathSummary[]> {
  const query = PATH_FIND_TEMPLATE(startSmiles, targetSmiles, maxSteps);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  const rows: PathSummary[] = data.results.bindings.map((b) => ({
    startSmiles: b.startSmiles.value,
    targetSmiles: b.targetSmiles.value,
    steps: Number(b.steps.value),
  }));

  if (!shortestOnly) {
    return rows;
  }

  // If shortestOnly: keep only the minimum-steps path for each (start, target) pair
  const bestByPair = new Map<string, PathSummary>();

  for (const row of rows) {
    const key = `${row.startSmiles}→${row.targetSmiles}`;
    const existing = bestByPair.get(key);
    if (!existing || row.steps < existing.steps) {
      bestByPair.set(key, row);
    }
  }

  return Array.from(bestByPair.values()).sort((a, b) => a.steps - b.steps);
}


export interface ReactionParticipant {
  role: string; 
  smiles?: string | null;
  label?: string | null;
  patentIri?: string | null; 
  patentId?: string | null; 
}

const REACTION_PARTICIPANTS_QUERY = (reactionId: string) => `
PREFIX ck: <http://example.org/chemkg#>

SELECT
  ?role ?cmpSmiles ?cmpLabel
  ?patent ?patentId
WHERE {
  # Lookup reaction by ID, then get patent + participants
  ?rxn ck:reactionId "${escapeLiteral(reactionId)}" .

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
ORDER BY ?role ?cmpSmiles
`;

export async function getReactionParticipants(
  reactionId: string
): Promise<ReactionParticipant[]> {
  const query = REACTION_PARTICIPANTS_QUERY(reactionId);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: REPOSITORY_ID,
    infer: true,
    timeoutMs: 60000,
  });

  const rows = data.results.bindings.map((b) => ({
    role: b.role?.value ?? "",
    smiles: b.cmpSmiles?.value ?? null,
    label: b.cmpLabel?.value ?? null,
    patentIri: b.patent?.value ?? null,
    patentId: b.patentId?.value ?? null,
  }));

  console.log("getReactionParticipants rows:", rows);
  return rows;
}


export const buildMultiSetPathQuery = (
  starts: string[],
  targets: string[],
  maxSteps: number
): string => {
  if (starts.length === 0) {
    throw new Error("buildMultiSetPathQuery: starts must not be empty");
  }
  if (targets.length === 0) {
    throw new Error("buildMultiSetPathQuery: targets must not be empty");
  }
  if (maxSteps < 1) {
    throw new Error("buildMultiSetPathQuery: maxSteps must be >= 1");
  }

  const startLits = starts.map((s) => `"${escapeLiteral(s)}"`);
  const targetLits = targets.map((s) => `"${escapeLiteral(s)}"`);

  const targetValsValues = targetLits.join(" ");

  const startValsIn = startLits.join(", ");
  const targetValsIn = targetLits.join(", ");

  
  const unionBranches: string[] = [];

  for (let L = 1; L <= maxSteps; L++) {
    const lines: string[] = [];

    lines.push(`
      # First reaction (uses a specific start compound in the chain)
      ?rxn1 ck:hasReactant ?startNode ;
            ck:hasProduct  ${L === 1 ? "?target" : "?mid1"} .
      ?startNode ck:smiles ?startSmiles .
      FILTER(?startSmiles IN (${startValsIn})).
    `);

    if (L === 1) {
   
      lines.push(`
        OPTIONAL { ?rxn1 ck:reactionId ?rxn1Id }
        BIND(?rxn1 AS ?rxnLast)
      `);
    } else {
      lines.push(`
        ?mid1 ck:smiles ?mid1Smiles .
      `);

      for (let i = 2; i <= L - 1; i++) {
        const prevMid = `?mid${i - 1}`;
        const curMid = `?mid${i}`;
        lines.push(`
          ?rxn${i} ck:hasReactant ${prevMid} ;
                 ck:hasProduct  ${curMid} .
          ${curMid} ck:smiles ?mid${i}Smiles .
        `);
      }

      const lastMid = `?mid${L - 1}`;
      lines.push(`
        ?rxn${L} ck:hasReactant ${lastMid} ;
                ck:hasProduct  ?target .
      `);

      for (let i = 1; i <= L; i++) {
        lines.push(`OPTIONAL { ?rxn${i} ck:reactionId ?rxn${i}Id }`);
      }
      lines.push(`BIND(?rxn${L} AS ?rxnLast)`);
    }

    const block = `
    ${L === 1 ? "" : "UNION"}
    {
      ${lines.join("\n")}
    }`;

    unionBranches.push(block);
  }

  const unionBlock = unionBranches.join("\n");

  const reactionVars = Array.from(
    { length: maxSteps },
    (_, i) => `?rxn${i + 1} ?rxn${i + 1}Id`
  ).join(" ");

  const midSmilesVars =
    maxSteps > 1
      ? Array.from(
          { length: maxSteps - 1 },
          (_, i) => `?mid${i + 1}Smiles`
        ).join(" ")
      : "";

  const allOfConstraints = `
    # First reaction must use ALL required start SMILES as reactants
    {
      SELECT ?rxn1
      WHERE {
        ?rxn1 ck:hasReactant ?sReact .
        ?sReact ck:smiles ?sReactSmiles .
        FILTER(?sReactSmiles IN (${startValsIn}))
      }
      GROUP BY ?rxn1
      HAVING (COUNT(DISTINCT ?sReactSmiles) = ${starts.length})
    }

    # Last reaction must produce ALL required target SMILES as products
    {
      SELECT ?rxnLast
      WHERE {
        ?rxnLast ck:hasProduct ?tProd .
        ?tProd ck:smiles ?tProdSmiles .
        FILTER(?tProdSmiles IN (${targetValsIn}))
      }
      GROUP BY ?rxnLast
      HAVING (COUNT(DISTINCT ?tProdSmiles) = ${targets.length})
    }
  `;

  return `
PREFIX ck: <http://example.org/chemkg#>

SELECT DISTINCT
  ${reactionVars}
  ${midSmilesVars}
  ?targetSmiles
WHERE {

  # Allowed target endpoints
  VALUES ?targetSmiles { ${targetValsValues} }
  ?target ck:smiles ?targetSmiles .

  # Path branches of length 1..${maxSteps}
  ${unionBlock}

  # Multi-set constraints (all starts in rxn1, all targets in rxnLast)
  ${allOfConstraints}
}
`;
};

export interface DetailedPath {
  startSmiles: string[];    
  targetSmiles: string;     
  intermediates: string[];  
  reactions: { id: string | null }[];
  stepCount: number;        
}

export async function getMultiSetPaths(
  starts: string[],
  targets: string[],
  steps: number
): Promise<DetailedPath[]> {
  const query = buildMultiSetPathQuery(starts, targets, steps);

  const data: SparqlJsonResult = await executeSparqlQuery(query, {
    repositoryId: "chemkg",
    infer: true,
    timeoutMs: 60000,
  });

  const paths: DetailedPath[] = data.results.bindings
    .map((b: any) => {
      const startSmiles =
        b.startSmiles?.value ?? (starts.length === 1 ? starts[0] : "");
      const targetSmiles =
        b.targetSmiles?.value ?? (targets.length === 1 ? targets[0] : "");

      let stepCount = 0;
      for (let i = 1; i <= steps; i++) {
        const rxnVar = b[`rxn${i}`];
        const rxnIdVar = b[`rxn${i}Id`];
        if (rxnVar || rxnIdVar) {
          stepCount = i;
        }
      }

      if (stepCount === 0) {
        return null;
      }

      const intermediates: string[] = [];
      for (let i = 1; i <= stepCount - 1; i++) {
        const midVar = b[`mid${i}Smiles`];
        if (midVar && midVar.value) {
          intermediates.push(midVar.value);
        }
      }

      const reactions = Array.from({ length: stepCount }, (_, i) => {
        const idx = i + 1;
        const rxnIdBinding = b[`rxn${idx}Id`];
        return {
          id: rxnIdBinding?.value ?? null,
        };
      });

      return {
        startSmiles,
        targetSmiles,
        intermediates,
        reactions,
        stepCount,
      };
    })
    .filter((p): p is DetailedPath => p !== null);

  console.log("getMultiSetPaths result:", paths);
  return paths;
}

Pathway Explorer

Chemical Reaction Knowledge Graph (USPTO 1976)

Pathway Explorer is a web-based tool for exploring chemical reaction pathways, searching compounds, browsing reactions, and examining relationships between chemical entities. The system is built on an RDF knowledge graph stored in GraphDB and queried through SPARQL. The interface is implemented using React and TypeScript.

Features
Pathway Discovery

Finds multi-step synthetic routes between compounds

Supports multiple start and target compounds

User can set the maximum number of steps

Displays intermediates and reaction identifiers in sequence

Reaction Explorer

Search reactions by text or by compounds involved

Shows all reaction participants, including reactants, products, agents, solvents, and catalysts

Displays patent information and reaction SMILES

Compound Explorer

Search compounds by SMILES or by label

Shows SMILES, name (if available), and the roles the compound appears in

Lists all reactions involving the selected compound

Knowledge Graph Backend

Implemented using GraphDB Free Edition

Uses a custom OWL ontology describing reactions, compounds, patents, and roles

All queries are executed with SPARQL 1.1

Data Source and Processing Pipeline
Dataset

The project uses the 1976 USPTO chemical grant patent data (CML format).
Each entry contains:

reaction SMILES

reactants, products, catalysts, solvents, and other agents

patent document ID

ETL Pipeline

Parse USPTO CML XML files

Extract reaction participants

Normalize SMILES (RDKit canonicalization and atom-map removal)

Generate RDF triples using the ontology

Export triples as uspto_1976_chemkg.ttl

Import ontology and generated triples into GraphDB

The resulting knowledge graph contains approximately:

18,000 reactions

26,000 compounds

260,000 triples

Technology Stack

React and TypeScript

TailwindCSS and shadcn/ui

GraphDB Free Edition

SPARQL 1.1

RDF / OWL ontology

Python ETL scripts

RDKit for SMILES normalization

Installation and Setup
1. Clone the Repository
git clone https://github.com/your-username/pathway-explorer.git
cd pathway-explorer

2. Install Frontend Dependencies
npm install
npm run dev


Frontend runs at:
http://localhost:5173

3. Install and Start GraphDB

Download from Ontotext:
https://www.ontotext.com/products/graphdb/

Run GraphDB:

Windows: graphdb.exe

macOS/Linux: bin/graphdb

Workbench URL:
http://localhost:7200

4. Create GraphDB Repository

Repository ID: chemkg
Ruleset: OWL2-RL

5. Import Required Files

Import into the same repository:

ontology.owl

uspto_1976_chemkg.ttl

After import, the repository should contain ~260,000 triples.

6. Configure Frontend to Connect to GraphDB

Edit: src/services/graphdbClient.ts

const GRAPHDB_BASE_URL = "http://localhost:7200";
const REPOSITORY_ID = "chemkg";

Using the Application
Compound Search

Enter a SMILES string or name to view compound details and reactions.

Reaction Explorer

Browse reactions, participants, reaction SMILES, and associated patents.

Pathway Explorer

Enter a starting compound, target compound, and number of steps to generate possible synthetic pathways.

Troubleshooting

If no results appear, check that both ontology and data files were imported into the same repository.

SPARQL query errors may occur if SMILES strings contain invalid characters.

For slow searches, refine input compounds or reduce the maximum pathway depth.

Future Work

Add USPTO data from additional years

Integrate PubChemRDF and ChEMBL-RDF

Extend ontology to include reaction conditions

Add ranking or scoring of pathways

Add visual graph exploration features

export interface Reaction {
  id: string;
  patentId: string;
  year: number;
  reactants: string[];
  products: string[];
  agents: string[];
  catalysts: string[];
  solvents: string[];
  yield?: number;
}

export interface Compound {
  smiles: string;
  label?: string;
  roleCount: number;
  exampleRoles: string[];
  asReactant: string[];
  asProduct: string[];
  asSolvent: string[];
  asCatalyst: string[];
}

export interface Pathway {
  id: string;
  steps: number;
  reactions: string[];
  compounds: string[];
  patents: string[];
  avgYield: number;
}

export const mockReactions: Reaction[] = [
  {
    id: "RXN-0001",
    patentId: "US03930836",
    year: 1976,
    reactants: ["BrCCO", "CC(C)=O"],
    products: ["CC(C)OCCO"],
    agents: ["NaOH"],
    catalysts: [],
    solvents: ["CCO"],
    yield: 85,
  },
  {
    id: "RXN-0002",
    patentId: "US03930836",
    year: 1976,
    reactants: ["CC(C)OCCO", "ClS(=O)(=O)CCl"],
    products: ["C(C)S(=O)(=O)OCCBr"],
    agents: ["Et3N"],
    catalysts: ["DMAP"],
    solvents: ["CH2Cl2"],
    yield: 72,
  },
  {
    id: "RXN-0003",
    patentId: "US03941123",
    year: 1976,
    reactants: ["c1ccccc1Br", "CC(=O)O"],
    products: ["c1ccccc1OC(=O)C"],
    agents: ["K2CO3"],
    catalysts: ["Pd(OAc)2"],
    solvents: ["DMF"],
    yield: 91,
  },
  {
    id: "RXN-0004",
    patentId: "US03941123",
    year: 1976,
    reactants: ["CCO", "CC(=O)Cl"],
    products: ["CCOC(=O)C"],
    agents: ["Pyridine"],
    catalysts: [],
    solvents: ["THF"],
    yield: 88,
  },
  {
    id: "RXN-0005",
    patentId: "US03952789",
    year: 1976,
    reactants: ["c1ccccc1", "HNO3"],
    products: ["c1ccc(cc1)[N+](=O)[O-]"],
    agents: ["H2SO4"],
    catalysts: [],
    solvents: [],
    yield: 76,
  },
  {
    id: "RXN-0006",
    patentId: "US03952789",
    year: 1976,
    reactants: ["CCCCO", "PBr3"],
    products: ["CCCCBr"],
    agents: [],
    catalysts: [],
    solvents: ["Et2O"],
    yield: 82,
  },
  {
    id: "RXN-0007",
    patentId: "US03963145",
    year: 1976,
    reactants: ["c1ccccc1CHO", "CH3MgBr"],
    products: ["c1ccccc1C(C)O"],
    agents: [],
    catalysts: [],
    solvents: ["THF"],
    yield: 94,
  },
  {
    id: "RXN-0008",
    patentId: "US03963145",
    year: 1976,
    reactants: ["CC(=O)CC(=O)C", "NH2OH"],
    products: ["CC(=NOH)CC(=O)C"],
    agents: ["NaOAc"],
    catalysts: [],
    solvents: ["EtOH", "H2O"],
    yield: 67,
  },
  {
    id: "RXN-0009",
    patentId: "US03975234",
    year: 1976,
    reactants: ["c1ccc2c(c1)cccc2", "Br2"],
    products: ["c1ccc2c(c1)c(Br)ccc2"],
    agents: ["FeBr3"],
    catalysts: [],
    solvents: ["CCl4"],
    yield: 79,
  },
  {
    id: "RXN-0010",
    patentId: "US03975234",
    year: 1976,
    reactants: ["CCCC=O", "NaBH4"],
    products: ["CCCCO"],
    agents: [],
    catalysts: [],
    solvents: ["MeOH"],
    yield: 96,
  },
  {
    id: "RXN-0011",
    patentId: "US03987456",
    year: 1976,
    reactants: ["c1ccccc1NH2", "CH3COCl"],
    products: ["c1ccccc1NC(=O)C"],
    agents: ["Et3N"],
    catalysts: [],
    solvents: ["CH2Cl2"],
    yield: 89,
  },
  {
    id: "RXN-0012",
    patentId: "US03987456",
    year: 1976,
    reactants: ["CC(C)(C)OH", "SOCl2"],
    products: ["CC(C)(C)Cl"],
    agents: [],
    catalysts: [],
    solvents: [],
    yield: 71,
  },
];

export const mockCompounds: Compound[] = [
  {
    smiles: "BrCCO",
    label: "2-Bromoethanol",
    roleCount: 15,
    exampleRoles: ["reactant", "product"],
    asReactant: ["RXN-0001", "RXN-0015", "RXN-0023"],
    asProduct: ["RXN-0006", "RXN-0018"],
    asSolvent: [],
    asCatalyst: [],
  },
  {
    smiles: "CCO",
    label: "Ethanol",
    roleCount: 142,
    exampleRoles: ["solvent", "reactant"],
    asReactant: ["RXN-0004", "RXN-0025"],
    asProduct: ["RXN-0010"],
    asSolvent: ["RXN-0001", "RXN-0008", "RXN-0015"],
    asCatalyst: [],
  },
  {
    smiles: "CH2Cl2",
    label: "Dichloromethane",
    roleCount: 234,
    exampleRoles: ["solvent"],
    asReactant: [],
    asProduct: [],
    asSolvent: ["RXN-0002", "RXN-0011", "RXN-0019"],
    asCatalyst: [],
  },
  {
    smiles: "THF",
    label: "Tetrahydrofuran",
    roleCount: 189,
    exampleRoles: ["solvent"],
    asReactant: [],
    asProduct: [],
    asSolvent: ["RXN-0004", "RXN-0007", "RXN-0022"],
    asCatalyst: [],
  },
  {
    smiles: "Pd(OAc)2",
    label: "Palladium acetate",
    roleCount: 56,
    exampleRoles: ["catalyst"],
    asReactant: [],
    asProduct: [],
    asSolvent: [],
    asCatalyst: ["RXN-0003", "RXN-0016", "RXN-0028"],
  },
  {
    smiles: "DMAP",
    label: "4-Dimethylaminopyridine",
    roleCount: 78,
    exampleRoles: ["catalyst", "agent"],
    asReactant: [],
    asProduct: [],
    asSolvent: [],
    asCatalyst: ["RXN-0002", "RXN-0014"],
  },
  {
    smiles: "c1ccccc1",
    label: "Benzene",
    roleCount: 312,
    exampleRoles: ["reactant", "solvent"],
    asReactant: ["RXN-0005"],
    asProduct: [],
    asSolvent: ["RXN-0012", "RXN-0017"],
    asCatalyst: [],
  },
  {
    smiles: "DMF",
    label: "N,N-Dimethylformamide",
    roleCount: 198,
    exampleRoles: ["solvent"],
    asReactant: [],
    asProduct: [],
    asSolvent: ["RXN-0003", "RXN-0009", "RXN-0021"],
    asCatalyst: [],
  },
];

export const mockPathways: Pathway[] = [
  {
    id: "PATH-001",
    steps: 2,
    reactions: ["RXN-0001", "RXN-0002"],
    compounds: ["BrCCO", "CC(C)OCCO", "C(C)S(=O)(=O)OCCBr"],
    patents: ["US03930836"],
    avgYield: 78,
  },
  {
    id: "PATH-002",
    steps: 3,
    reactions: ["RXN-0001", "RXN-0004", "RXN-0002"],
    compounds: ["BrCCO", "CC(C)OCCO", "CCOC(=O)C", "C(C)S(=O)(=O)OCCBr"],
    patents: ["US03930836", "US03941123"],
    avgYield: 72,
  },
  {
    id: "PATH-003",
    steps: 1,
    reactions: ["RXN-0002"],
    compounds: ["CC(C)OCCO", "C(C)S(=O)(=O)OCCBr"],
    patents: ["US03930836"],
    avgYield: 72,
  },
];

export const mockStats = {
  totalReactions: 18118,
  totalCompounds: 26266,
  patentsCovered: 1976,
  avgYield: 74.3,
};

export const mockSolventUsage = [
  { name: "DCM", count: 2340, percentage: 45 },
  { name: "THF", count: 1890, percentage: 36 },
  { name: "DMF", count: 1560, percentage: 30 },
  { name: "EtOH", count: 1420, percentage: 27 },
  { name: "MeOH", count: 1180, percentage: 22 },
  { name: "Toluene", count: 980, percentage: 19 },
  { name: "Et2O", count: 760, percentage: 14 },
  { name: "DMSO", count: 620, percentage: 12 },
];

export const mockCatalystUsage = [
  { name: "Pd(OAc)2", count: 560, percentage: 38 },
  { name: "Pd/C", count: 480, percentage: 32 },
  { name: "DMAP", count: 380, percentage: 25 },
  { name: "Pt/Al2O3", count: 290, percentage: 19 },
  { name: "Rh(PPh3)3Cl", count: 210, percentage: 14 },
  { name: "NiCl2", count: 180, percentage: 12 },
];

export const mockYieldDistribution = [
  { range: "0-30%", count: 1820, percentage: 10 },
  { range: "31-50%", count: 3274, percentage: 18 },
  { range: "51-70%", count: 5435, percentage: 30 },
  { range: "71-90%", count: 5977, percentage: 33 },
  { range: "91-100%", count: 1612, percentage: 9 },
];

export const mockIntermediates = [
  { smiles: "CC(C)OCCO", label: "Isopropyl glycol ether", reactionCount: 142 },
  { smiles: "c1ccc(cc1)O", label: "Phenol", reactionCount: 128 },
  { smiles: "CC(=O)O", label: "Acetic acid", reactionCount: 115 },
  { smiles: "CCCC=O", label: "Butyraldehyde", reactionCount: 98 },
  { smiles: "c1ccccc1Br", label: "Bromobenzene", reactionCount: 87 },
];

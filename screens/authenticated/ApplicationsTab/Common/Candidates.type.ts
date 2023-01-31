export interface ContextType {
  contactUnlocksLeft: number;
  databaseUnlocksLeft: number;
  totalContactUnlocks: number;
  totalDatabaseUnlocks: number;
  setcontactUnlocksLeft: (state: number) => void;
  setdatabaseUnlocksLeft: (state: number) => void;
  setTotalContactUnlocks: (state: number) => void;
  setTotalDatabaseUnlocks: (state: number) => void;
}

export interface CandidateFiltersType {
  jobId: string;
  filter: Array<string>;
  jobTitle?: string;
}

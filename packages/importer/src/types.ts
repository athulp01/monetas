export type ParsedTransaction = {
  timeCreated: Date;
  amount: number;
  notes: string;
  type: "CREDIT" | "DEBIT";
};

export type ParsedStatementResult = {
  transactions: ParsedTransaction[];
  errors: number;
};

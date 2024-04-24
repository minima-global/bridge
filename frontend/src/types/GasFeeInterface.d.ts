export interface GasFeeCalculated {
  baseFee: string;
  priorityFee: string;
  finalGasFee: string;
  gasUnits: string;
}

export interface GasFeeEstimate {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
}

export interface GasFeesApiResponse {
  low: GasFeeEstimate;
  medium: GasFeeEstimate;
  high: GasFeeEstimate;
  estimatedBaseFee: string;
  networkCongestion: number;
  latestPriorityFeeRange: string[];
  historicalPriorityFeeRange: string[];
  historicalBaseFeeRange: string[];
  priorityFeeTrend: "up" | "down";
  baseFeeTrend: "up" | "down";
}

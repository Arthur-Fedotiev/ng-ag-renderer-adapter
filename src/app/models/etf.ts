export interface ETF {
  fundName: string;
  ticker: string;
  assetClass: string;
  totalAssets: number;
  yield: number;
  price: number;
  fundFlows: number;
  returnYTD: number;
  return1Year: number;
  return3Year: number;
}

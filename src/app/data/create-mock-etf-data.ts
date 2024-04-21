const FUND_NAMES = [
  'Vanguard',
  'BlackRock',
  'State Street',
  'Invesco',
  'Charles Schwab',
];
const ASSET_CLASSES = [
  'Equity',
  'Fixed Income',
  'Commodity',
  'Real Estate',
  'Multi-Asset',
];
const TICKERS = [
  'VTI',
  'VOO',
  'SPY',
  'QQQ',
  'BND',
  'GLD',
  'VNQ',
  'IEMG',
  'HYG',
  'XLF',
];

export const createMockEtfData = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    fundName: `${FUND_NAMES[i % FUND_NAMES.length]} Fund ${i}`,
    ticker: TICKERS[i % TICKERS.length],
    assetClass: ASSET_CLASSES[i % ASSET_CLASSES.length],
    totalAssets: Math.floor(Math.random() * 1000000) + 1000000, // 1M - 2M
    yield: +(Math.random() * 10).toFixed(2), // 0.00 - 10.00
    price: +(Math.random() * 300 + 100).toFixed(2), // 100.00 - 400.00
    fundFlows: Math.floor(Math.random() * 1000000) - 500000, // -500K - 500K
    returnYTD: +(Math.random() * 100 - 50).toFixed(2), // -50.00 - 50.00
    return1Year: +(Math.random() * 100 - 50).toFixed(2), // -50.00 - 50.00
    return3Year: +(Math.random() * 300 - 150).toFixed(2), // -150.00 - 150.00
  }));

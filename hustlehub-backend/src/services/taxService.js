const TAX_YEAR = '2026/27';
const PRIMARY_REBATE = 17820;

const BRACKETS = [
  { upTo: 245100,   base: 0,      rate: 0.18, over: 0 },
  { upTo: 383100,   base: 44118,  rate: 0.26, over: 245100 },
  { upTo: 530200,   base: 79998,  rate: 0.31, over: 383100 },
  { upTo: 695800,   base: 125599, rate: 0.36, over: 530200 },
  { upTo: 887000,   base: 185215, rate: 0.39, over: 695800 },
  { upTo: 1878600,  base: 259783, rate: 0.41, over: 887000 },
  { upTo: Infinity, base: 666339, rate: 0.45, over: 1878600 },
];

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function estimateTax(grossIncome) {
  const income = Math.max(0, Number(grossIncome) || 0);
  const bracket = BRACKETS.find((b) => income <= b.upTo);
  const taxBeforeRebate = bracket.base + (income - bracket.over) * bracket.rate;
  const estimatedTax = round2(Math.max(0, taxBeforeRebate - PRIMARY_REBATE));

  return {
    taxYear: TAX_YEAR,
    grossIncome: round2(income),
    estimatedTax,
    netIncome: round2(income - estimatedTax),
    effectiveRate: income > 0 ? round2((estimatedTax / income) * 100) : 0,
  };
}

module.exports = { estimateTax, round2 };
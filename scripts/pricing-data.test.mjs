import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parseQuotationRates, sourcePath, outputPath } from './sync-pricing.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/components/pricing/pricing-data.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
function load(rates) {
  const loaded = {};
  new Function('exports', 'require', compiled)(loaded, (name) => {
    assert.equal(name, './quotation-rates.generated.json');
    return rates;
  });
  return loaded;
}
const documented = parseQuotationRates(fs.readFileSync(sourcePath, 'utf8'));
assert.deepEqual(JSON.parse(fs.readFileSync(outputPath, 'utf8')), documented, 'run npm run pricing:sync');
const { rateSections, packageServices, packageAmount, packageMinimumAdjustment, getRate } = load(documented);
const minimums = { landing: 'min-landing', brand: 'min-website', premium: 'min-website', commerce: 'min-website', mvp: 'min-mvp', platform: 'min-mvp', existing: 'min-existing' };
for (const service of packageServices) {
  assert.equal(service.tiers.length, 3);
  for (const tier of service.tiers) {
    const sum = documented[service.id] + tier.extras.reduce((total, extra) => total + documented[extra.id] * extra.quantity, 0);
    assert.equal(packageAmount(service, tier), Math.max(sum, documented[minimums[service.id]]));
    assert.equal(sum + packageMinimumAdjustment(service, tier), packageAmount(service, tier), 'breakdown matches the total');
  }
}
const rows = rateSections.flatMap(section => section.rows);
assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
assert.deepEqual(Object.fromEntries(rows.filter(row => row.amount !== undefined).map(row => [row.id, row.amount])), documented);
for (const id of ['ai', 'realtime', 'custom', 'webgl']) {
  assert.equal(getRate(id).mode, 'custom');
  assert.equal(getRate(id).amount, undefined);
}
assert.throws(() => packageAmount(packageServices[0], { extras: [{ id: 'ai', quantity: 1 }] }), /No documented price/);
assert.throws(() => getRate('unknown'), /Unknown quotation rate/);
assert.equal(rateSections.find(section => section.id === 'features').rows.length, 19);
assert.equal(rateSections.find(section => section.id === 'external').rows.length, 9);
for (const row of rows) assert(row.label.ko && row.label.en, `missing label for ${row.id}`);

// Controlled inputs verify base/add-on changes, quantities, and minimum floors
// without requiring test edits every time the real business rates change.
const fixture = { ...documented, brand: 3500000, page: 200000, cms: 700000, 'min-website': 3000000 };
const before = load(fixture);
const after = load({ ...fixture, brand: 4000000, page: 300000 });
const brand = after.packageServices.find(service => service.id === 'brand');
assert.equal(before.packageAmount(brand, brand.tiers[1]), 4600000);
assert.equal(after.packageAmount(brand, brand.tiers[1]), 5300000);
const withMinimum = load({ ...fixture, 'min-website': 5000000 });
assert.equal(withMinimum.packageAmount(brand, brand.tiers[0]), 5000000);
assert.equal(withMinimum.packageMinimumAdjustment(brand, brand.tiers[0]), 1500000);
assert.equal(withMinimum.packageAmount(brand, brand.tiers[1]), 5000000, 'minimum applies to total, not to base before add-ons');
assert.equal(withMinimum.packageMinimumAdjustment(brand, brand.tiers[1]), 400000);
console.log('PASS: document/table parity, 21 package calculations, changed rates, quantities, minimum adjustments, VAT and custom pricing.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/components/pricing/pricing-data.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const loaded = {};
new Function('exports', compiled)(loaded);
const { rateSections, packageServices, packageAmount, getRate } = loaded;
const expected = {
  landing: [1500000, 1800000, 2800000],
  brand: [3500000, 4600000, 6700000],
  premium: [5000000, 6200000, 7700000],
  commerce: [6000000, 7500000, 9000000],
  mvp: [8000000, 10200000, 12200000],
  platform: [15000000, 16500000, 18500000],
  existing: [500000, 1200000, 2200000],
};
for (const service of packageServices) {
  assert.equal(service.tiers.length, 3);
  assert.deepEqual(service.tiers.map(tier => packageAmount(service, tier)), expected[service.id]);
}
const rows = rateSections.flatMap(section => section.rows);
assert.equal(new Set(rows.map(row => row.id)).size, rows.length, 'rate IDs must be unique');
assert.equal(getRate('brand').amount, 3500000);
assert.equal(getRate('min-website').amount, 3000000, 'minimum must not replace the website starting rate');
assert.equal(getRate('total').amount, getRate('supply').amount + getRate('vat-amount').amount);
for (const id of ['ai', 'realtime', 'custom', 'webgl']) {
  assert.equal(getRate(id).mode, 'custom');
  assert.equal(getRate(id).amount, undefined);
}
assert.throws(() => packageAmount(packageServices[0], { extras: [{ id: 'ai', quantity: 1 }] }), /No documented price/);
assert.throws(() => getRate('unknown'), /Unknown quotation rate/);
assert.equal(rateSections.find(section => section.id === 'features').rows.length, 19);
assert.equal(rateSections.find(section => section.id === 'external').rows.length, 9);
for (const row of rows) {
  assert(row.label.ko && row.label.en, `missing label for ${row.id}`);
}
console.log('PASS: 21 proposed package totals, unique rates, minimums, VAT, custom pricing and rule coverage.');

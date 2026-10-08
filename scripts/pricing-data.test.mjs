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
const { rateSections, packageServices, packageAmount, packageMinimumAdjustment, getPackageBaseRate, getRate } = load(documented);
const minimums = { landing: 'min-landing', brand: 'min-website', premium: 'min-website', commerce: 'min-website', mvp: 'min-mvp', platform: 'min-mvp', existing: 'min-existing' };
for (const service of packageServices) {
  assert.equal(service.tiers.length, 3);
  for (const tier of service.tiers) {
    const baseId = tier.baseRateId ?? service.id;
    assert.equal(getPackageBaseRate(service, tier).id, baseId);
    const sum = documented[baseId] + tier.extras.reduce((total, extra) => total + documented[extra.id] * extra.quantity, 0);
    assert.equal(packageAmount(service, tier), Math.max(sum, documented[minimums[baseId]]));
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
assert.throws(() => packageAmount(packageServices[0], { ...packageServices[0].tiers[0], extras: [{ id: 'ai', quantity: 1 }] }), /No documented price/);
assert.throws(() => getRate('unknown'), /Unknown quotation rate/);
assert.equal(rateSections.find(section => section.id === 'features').rows.length, 19);
assert.equal(rateSections.find(section => section.id === 'external').rows.length, 9);
for (const row of rows) assert(row.label.ko && row.label.en, `missing label for ${row.id}`);

const homepage = packageServices.find(service => service.id === 'homepage');
assert(homepage);
assert.equal(homepage.label.ko, '홈페이지');
assert.equal(packageServices.length, 5, 'homepage tiers are one service, alongside the four other services');
assert(!packageServices.some(service => ['landing', 'brand', 'premium'].includes(service.id)));
assert.deepEqual(homepage.tiers.map(tier => getPackageBaseRate(homepage, tier).id), ['landing', 'brand', 'premium']);
assert.deepEqual(homepage.tiers.map(tier => tier.extras), [[], [], []], 'included CMS and motion are not charged as extras');
const scopes = homepage.tiers.map(tier => tier.scope.map(copy => copy.en).join(' '));
assert(!scopes[0].includes('Analytics') && !scopes[0].includes('CMS'));
assert(scopes[1].includes('Analytics') && scopes[1].includes('AI brand video') && !scopes[1].includes('CMS'));
assert(scopes[2].includes('Analytics') && scopes[2].includes('AI brand video') && scopes[2].includes('CMS') && scopes[2].includes('Premium motion'));

// Controlled inputs verify that grouped tiers continue to follow independent
// document rates and minimums without locking tests to changing business prices.
const fixture = { ...documented, landing: 800000, brand: 2500000, premium: 5000000, page: 200000, cms: 700000, 'min-landing': 800000, 'min-website': 2500000 };
const before = load(fixture);
const after = load({ ...fixture, landing: 900000, brand: 3000000, premium: 5500000 });
assert.deepEqual(homepage.tiers.map(tier => before.packageAmount(homepage, tier)), [800000, 2500000, 5000000]);
assert.deepEqual(homepage.tiers.map(tier => after.packageAmount(homepage, tier)), [900000, 3000000, 5500000]);
const withMinimum = load({ ...fixture, 'min-website': 4000000 });
assert.equal(withMinimum.packageAmount(homepage, homepage.tiers[0]), 800000, 'template uses its own minimum');
assert.equal(withMinimum.packageAmount(homepage, homepage.tiers[1]), 4000000);
assert.equal(withMinimum.packageMinimumAdjustment(homepage, homepage.tiers[1]), 1500000);
assert.equal(withMinimum.packageAmount(homepage, homepage.tiers[2]), 5000000);
const withExtras = { ...homepage.tiers[1], extras: [{ id: 'page', quantity: 2 }, { id: 'cms', quantity: 1 }] };
assert.equal(before.packageAmount(homepage, withExtras), 3600000);
assert.equal(withMinimum.packageAmount(homepage, withExtras), 4000000, 'minimum applies to total, not to base before add-ons');
assert.equal(withMinimum.packageMinimumAdjustment(homepage, withExtras), 400000);
console.log('PASS: document/table parity, 15 packages, grouped homepage tiers, included features, changed rates, quantities and minimums.');

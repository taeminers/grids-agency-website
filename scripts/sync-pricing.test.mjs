import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseQuotationRates, serializeRates, sourcePath, syncPricing } from './sync-pricing.mjs';

const document = fs.readFileSync(sourcePath, 'utf8');
const changeLanding = (value) => document.replace(/(## 랜딩페이지\s+시작가:\s*)[^\n]+/, `$1${value}`);

test('reads all documented rates, inline/multiline values, and CRLF', () => {
  const rates = parseQuotationRates(document);
  assert.equal(Object.keys(rates).length, 34);
  assert.deepEqual(parseQuotationRates(document.replaceAll('\n', '\r\n')), rates);
  assert.equal(parseQuotationRates(changeLanding('2,100,000원')).landing, 2100000);
  assert.equal(parseQuotationRates(changeLanding('2100000원')).landing, 2100000);
  const inline = document.replace(/일반 페이지:\s*\+[^\n]+/, '일반 페이지: +250,000원 / 페이지');
  assert.equal(parseQuotationRates(inline).page, 250000);
});

test('rejects malformed, ambiguous, non-numeric, or changed-mode rates', () => {
  for (const value of ['1,50,000원', '0원', '-100원', '1.5원', '1,000,000원~', '별도 산정', '100만원', '1,000,000원 ~ 2,000,000원', '9007199254740992원']) {
    assert.throws(() => parseQuotationRates(changeLanding(value)), /Invalid price|safe integer/);
  }
});

test('rejects removed/renamed headings, duplicates, and unknown money entries', () => {
  assert.throws(() => parseQuotationRates(document.replace('## 랜딩페이지', '## renamed')), /Missing or duplicate heading/);
  assert.throws(() => parseQuotationRates(document.replace('## 랜딩페이지', '## 랜딩페이지\n\n시작가: 2,000,000원')), /Expected one price/);
  assert.throws(() => parseQuotationRates(`${document}\n신규 기능:\n+200,000원~\n`), /Unmapped price/);
  assert.throws(() => parseQuotationRates(`${document}\n# 12. VAT\n`), /Duplicate section/);
});

test('validates the VAT example and permits consistent example changes', () => {
  assert.throws(() => parseQuotationRates(document.replace(/총액: [^\n]+/, '총액: 1원')), /VAT example is inconsistent/);
  const changed = document.replace(/공급가액: [^\n]+/, '공급가액: 6,000,000원')
    .replace(/VAT: [^\n]+/, 'VAT: 600,000원').replace(/총액: [^\n]+/, '총액: 6,600,000원');
  const rates = parseQuotationRates(changed);
  assert.equal(rates.supply, 6000000);
  assert.equal(rates.total, 6600000);
});

test('sync is deterministic, check is read-only, and invalid input preserves previous data', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'grids-pricing-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'rules.md');
  const output = path.join(dir, 'rates.json');
  fs.writeFileSync(source, document);
  assert.throws(() => syncPricing({ source, output, check: true }), /out of date/);
  assert.equal(fs.existsSync(output), false);
  assert.equal(syncPricing({ source, output }).changed, true);
  const before = fs.readFileSync(output, 'utf8');
  assert.equal(before, serializeRates(parseQuotationRates(document)));
  assert.equal(syncPricing({ source, output }).changed, false);
  assert.equal(syncPricing({ source, output, check: true }).changed, false);
  fs.writeFileSync(source, changeLanding('2,100,000원'));
  assert.throws(() => syncPricing({ source, output, check: true }), /out of date/);
  assert.equal(fs.readFileSync(output, 'utf8'), before);
  assert.equal(syncPricing({ source, output }).changed, true);
  const updated = fs.readFileSync(output, 'utf8');
  assert.equal(JSON.parse(updated).landing, 2100000);
  fs.writeFileSync(source, changeLanding('가격 미정'));
  assert.throws(() => syncPricing({ source, output }), /Invalid price/);
  assert.equal(fs.readFileSync(output, 'utf8'), updated);
  assert.deepEqual(fs.readdirSync(dir).sort(), ['rates.json', 'rules.md']);
});

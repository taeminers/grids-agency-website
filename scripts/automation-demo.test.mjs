import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const directory = mkdtempSync(join(tmpdir(), "grids-inquiry-tests-"));
for (const name of ["scenarios", "clinic-sources", "engine"]) {
  const source = readFileSync(new URL(`../src/components/pricing/automation-demo/${name}.ts`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  writeFileSync(join(directory, `${name}.js`), compiled.outputText);
}
const require = createRequire(import.meta.url);
const { industries } = require(join(directory, "scenarios.js"));
const { buildDemoResult, simulateInquiry } = require(join(directory, "engine.js"));
const { clinicPriceSheet, clinicBookingSlots } = require(join(directory, "clinic-sources.js"));
after(() => rmSync(directory, { recursive: true, force: true }));
const sample = { industry: industries[0], scenario: industries[0].scenarios[0], locale: "ko" };

test("every industry has two complete bilingual demos with staff-confirmation boundaries", () => {
  assert.equal(industries.length, 5);
  const ids = new Set();
  for (const industry of industries) {
    assert.equal(industry.scenarios.length, 2);
    for (const scenario of industry.scenarios) {
      assert.ok(!ids.has(scenario.id)); ids.add(scenario.id);
      for (const locale of ["ko", "en"]) {
        const input = { industry, scenario, locale };
        const result = buildDemoResult(input);
        assert.deepEqual(result, buildDemoResult(input), "Demo results must be deterministic");
        assert.ok(result.confirmation.length > 10, "Unknown business details must be flagged");
        assert.ok(result.reply.length > 60);
        assert.ok(result.fields.length >= 3);
        assert.equal(result.tasks.length, 2);
        assert.ok(result.tasks.every(task => task.owner && task.title));
        assert.equal(result.record.customer, scenario.customer[locale]);
      }
    }
  }
});

test("custom input extracts only present details and never reuses sample facts", () => {
  const customMessage = "DEMO-9999 배송은 다음 주 수요일에 가능한가요?";
  const result = buildDemoResult({ ...sample, customMessage });
  assert.equal(result.mode, "custom");
  assert.deepEqual(result.sources, [], "Custom text must not imply a verified source lookup");
  assert.equal(result.fields[0].value, customMessage);
  assert.ok(result.fields.some(field => field.value === "DEMO-9999"));
  assert.ok(result.fields.some(field => field.value === "다음 주 수요일"));
  assert.ok(!JSON.stringify(result).includes("토요일 오후"));
  assert.ok(!JSON.stringify(result).includes("김민서"));
  assert.match(result.reply, /아직 확인되지 않았습니다/);
});

test("clinic replies use the exact price sheet and available booking slots", () => {
  for (const locale of ["ko", "en"]) {
    const result = buildDemoResult({ ...sample, locale });
    assert.equal(result.sources.length, 2);
    const sheet = result.sources.find(source => source.kind === "file");
    const booking = result.sources.find(source => source.kind === "booking");
    for (const row of sheet.rows) assert.ok(result.reply.includes(row.value), `Missing sourced price: ${row.value}`);
    for (const slot of clinicBookingSlots.saturday) {
      const row = booking.rows.find(row => row.label.includes(slot.time));
      assert.equal(row.state, slot.available ? "available" : "unavailable");
      assert.ok(result.reply.includes(slot.time));
    }
    assert.match(result.reply, /가상 금액|fictional demo prices/);
    assert.match(result.reply, /아직 예약은 확정되지|No appointment has been confirmed/);
  }
});

test("editing a source price updates the inspector and reply together", () => {
  const original = clinicPriceSheet.programs[0].amount;
  try {
    clinicPriceSheet.programs[0].amount = 1230000;
    const result = buildDemoResult(sample);
    assert.ok(result.sources[0].rows.some(row => row.value === "1,230,000원"));
    assert.ok(result.reply.includes("1,230,000원"));
    assert.ok(!result.reply.includes("1,000,000원"));
  } finally { clinicPriceSheet.programs[0].amount = original; }
});

test("unconnected industries do not claim a clinic source lookup", () => {
  const industry = industries[3];
  const result = buildDemoResult({ industry, scenario: industry.scenarios[0], locale: "ko" });
  assert.deepEqual(result.sources, []);
  assert.ok(!result.reply.includes("1,000,000원"));
});

test("fully booked source records never produce an available-time promise", () => {
  const original = clinicBookingSlots.saturday.map(slot => slot.available);
  try {
    clinicBookingSlots.saturday.forEach(slot => { slot.available = false; });
    const result = buildDemoResult(sample);
    assert.match(result.reply, /현재 예약 가능한 시간이 없습니다/);
    assert.ok(!result.reply.includes("상담이 가능합니다"));
    assert.ok(result.sources[1].rows.every(row => row.state === "unavailable"));
  } finally { clinicBookingSlots.saturday.forEach((slot, index) => { slot.available = original[index]; }); }
});

test("unknown custom requests do not fabricate customer details or schedules", () => {
  for (const locale of ["ko", "en"]) {
    const result = buildDemoResult({ ...sample, locale, customMessage: "xyz" });
    assert.equal(result.fields.length, 1);
    assert.equal(result.fields[0].value, "xyz");
    assert.match(result.category, /확인 필요|Review needed/);
  }
});

test("custom input is bounded, empty input is rejected, and source text stays literal", () => {
  assert.throws(() => buildDemoResult({ ...sample, customMessage: "   " }), /EMPTY_INQUIRY/);
  const result = buildDemoResult({ ...sample, customMessage: "a".repeat(700) });
  assert.equal(result.fields[0].value.length, 600);
  const literal = '<script>alert("test")</script>';
  assert.equal(buildDemoResult({ ...sample, customMessage: literal }).fields[0].value, literal);
});

test("processor respects cancellation before producing a result", async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(simulateInquiry(sample, controller.signal), { name: "AbortError" });
});

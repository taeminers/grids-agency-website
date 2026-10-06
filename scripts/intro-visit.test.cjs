const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(
  readFileSync(path.join(__dirname, "../src/lib/intro-visit.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function loadVisit(storage = createStorage()) {
  const context = { exports: {}, window: { sessionStorage: storage } };
  vm.runInNewContext(source, context);
  return context.exports;
}

test("only the first homepage entry claims the intro, even if navigation interrupts it", () => {
  const visit = loadVisit();
  assert.equal(visit.claimIntroVisit(), true);
  assert.equal(visit.claimIntroVisit(), false);
  assert.equal(visit.claimIntroVisit(), false);
});

test("a reload in the same tab does not replay the intro", () => {
  const storage = createStorage();
  assert.equal(loadVisit(storage).claimIntroVisit(), true);
  assert.equal(loadVisit(storage).claimIntroVisit(), false);
});

test("landing on another page skips the intro when subsequently visiting Home", () => {
  const storage = createStorage();
  const visit = loadVisit(storage);
  visit.markSiteVisited();
  assert.equal(visit.claimIntroVisit(), false);
  assert.equal(loadVisit(storage).claimIntroVisit(), false);
});

test("blocked session storage still prevents replay during client navigation", () => {
  const unavailable = () => { throw new Error("Storage blocked"); };
  const visit = loadVisit({ getItem: unavailable, setItem: unavailable });
  assert.equal(visit.claimIntroVisit(), true);
  assert.equal(visit.claimIntroVisit(), false);
});

test("a fresh tab session can show its first intro", () => {
  assert.equal(loadVisit().claimIntroVisit(), true);
  assert.equal(loadVisit().claimIntroVisit(), true);
});

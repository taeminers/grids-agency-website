import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sourcePath = path.join(root, 'src/components/knowledge/quotation-rules.md');
export const outputPath = path.join(root, 'src/components/pricing/quotation-rates.generated.json');

// Stable UI IDs mapped to exact document headings/labels. New price items need
// an explicit mapping and UI copy; never infer a price from a similar feature.
const fields = [
  ...[
    ['landing', '랜딩페이지'], ['brand', '기업 / 브랜드 홈페이지'],
    ['premium', '고급 브랜드 홈페이지'], ['commerce', '쇼핑몰'],
    ['mvp', '웹서비스 / MVP'], ['platform', '복잡한 웹서비스 / 플랫폼'],
    ['existing', '기존 서비스 수정 / 추가 개발'],
  ].map(([id, heading]) => ({ id, section: '기본 제작비', heading, label: id === 'existing' ? '최소 작업비' : '시작가', format: '' })),
  ...[
    ['page', '일반 페이지', '+| / 페이지'],
    ['advanced-page', '고급 페이지', '+| / 페이지'],
    ['special-page', '특수 인터랙션 또는 높은 디자인 난이도가 필요한 페이지', '+|~'],
  ].map(([id, label, format]) => ({ id, section: '페이지 추가', label, format })),
  ...[
    ['advanced-form', '고급 문의 폼'], ['board', '게시판'], ['blog', '블로그 / 뉴스'],
    ['cms', 'CMS'], ['login', '회원가입 / 로그인'], ['social', '소셜 로그인'],
    ['profile', '사용자 마이페이지'], ['search', '검색'], ['payment', '결제'],
    ['booking', '예약'], ['admin', '관리자 페이지'], ['api', '외부 API 연동'],
    ['email', '이메일 자동 발송'], ['sms', 'SMS / 알림톡'], ['dashboard', '대시보드 / 통계'],
  ].map(([id, label]) => ({ id, section: '추가 기능', label, format: id === 'social' ? '+|~ / 서비스' : '+|~' })),
  { id: 'language', section: '다국어', label: '추가 언어', format: '+|~ / 언어' },
  { id: 'interaction', section: '디자인 및 인터랙션', label: '고급 인터랙션', format: '+|~' },
  ...[
    ['min-landing', '랜딩페이지'], ['min-website', '신규 홈페이지'],
    ['min-mvp', '웹서비스 / MVP'], ['min-existing', '기존 서비스 수정'],
  ].map(([id, label]) => ({ id, section: '최소 수주 금액', label, format: '' })),
  ...[['supply', '공급가액'], ['vat-amount', 'VAT'], ['total', '총액']]
    .map(([id, label]) => ({ id, section: 'VAT', label, format: '' })),
];

const normalize = (text) => text.normalize('NFC').trim().replace(/\s+/g, ' ');
const compact = (text) => text.replace(/\s+/g, '');

export function parseQuotationRates(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const sections = new Map();
  let section;
  let heading;
  lines.forEach((line, index) => {
    const sectionMatch = line.match(/^#\s+\d+\.\s+(.+?)\s*$/);
    if (sectionMatch) {
      const title = normalize(sectionMatch[1]);
      if (sections.has(title)) throw new Error(`Duplicate section: ${title}`);
      section = [];
      heading = undefined;
      sections.set(title, section);
    } else if (section) {
      const headingMatch = line.match(/^##\s+(.+?)\s*$/);
      if (headingMatch) heading = normalize(headingMatch[1]);
      section.push({ text: normalize(line), heading, index });
    }
  });

  const usedLines = new Set();
  const rates = {};
  for (const field of fields) {
    const entries = sections.get(field.section);
    if (!entries) throw new Error(`Missing section: ${field.section}`);
    if (field.heading && entries.filter((entry) => entry.text === `## ${field.heading}`).length !== 1) {
      throw new Error(`Missing or duplicate heading: ${field.heading}`);
    }
    const matches = entries.filter((entry) =>
      (!field.heading || entry.heading === field.heading) &&
      normalize(entry.text.split(':')[0]) === field.label && entry.text.includes(':'));
    if (matches.length !== 1) throw new Error(`Expected one price for ${field.section} / ${field.heading ?? field.label}; found ${matches.length}`);
    const entry = matches[0];
    const inline = entry.text.slice(entry.text.indexOf(':') + 1).trim();
    const next = entries.find((item) => item.index > entry.index && item.text);
    const value = inline || next?.text || '';
    const match = value.match(/^(\+?)\s*((?:[1-9]\d{0,2}(?:,\d{3})+)|(?:[1-9]\d*))\s*원(.*)$/);
    const [prefix = '', suffix = ''] = field.format.split('|');
    if (!match || match[1] !== prefix || compact(match[3]) !== compact(suffix)) {
      throw new Error(`Invalid price for ${field.id}: "${value}". Keep the existing 원, +, ~ and unit notation; enter one positive whole-won amount.`);
    }
    const amount = Number(match[2].replaceAll(',', ''));
    if (!Number.isSafeInteger(amount)) throw new Error(`Price is outside the safe integer range: ${field.id}`);
    rates[field.id] = amount;
    usedLines.add(inline ? entry.index : next.index);
  }

  // Fail on newly added or unrecognized money lines instead of silently omitting them.
  lines.forEach((line, index) => {
    if (/\d[\d,.]*\s*원/.test(line) && !usedLines.has(index)) {
      throw new Error(`Unmapped price on line ${index + 1}: ${line.trim()}. Add its stable ID mapping and pricing UI entry before syncing.`);
    }
  });
  if (rates.supply + rates['vat-amount'] !== rates.total) {
    throw new Error('VAT example is inconsistent: 공급가액 + VAT must equal 총액.');
  }
  return rates;
}

export const serializeRates = (rates) => `${JSON.stringify(rates, null, 2)}\n`;

export function syncPricing({ source = sourcePath, output = outputPath, check = false } = {}) {
  // Validate everything before touching the last known-good generated data.
  const rates = parseQuotationRates(fs.readFileSync(source, 'utf8'));
  const expected = serializeRates(rates);
  const previous = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
  if (previous === expected) return { changed: false, count: Object.keys(rates).length };
  if (check) throw new Error('Generated pricing is out of date. Run npm run pricing:sync.');
  const temporary = `${output}.${process.pid}.tmp`;
  let created = false;
  try {
    const descriptor = fs.openSync(temporary, 'wx');
    created = true;
    try {
      fs.writeFileSync(descriptor, expected);
    } finally {
      fs.closeSync(descriptor);
    }
    fs.renameSync(temporary, output);
  } finally {
    if (created && fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { changed: true, count: Object.keys(rates).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--check')) throw new Error('Usage: node scripts/sync-pricing.mjs [--check]');
    const result = syncPricing({ check: args.includes('--check') });
    console.log(`Pricing: ${result.changed ? 'updated' : 'up to date'} (${result.count} documented rates).`);
  } catch (error) {
    console.error(`Pricing sync failed: ${error.message}`);
    process.exitCode = 1;
  }
}

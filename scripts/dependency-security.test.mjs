import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import * as XLSX from '@stackline/xlsx';
import { Model } from 'survey-core';
import { SurveyPDF } from 'survey-pdf';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import express from 'express';
import multer from 'multer';
import request from 'supertest';
import { insertUseCaseSchema } from '../shared/schema.ts';

const require = createRequire(import.meta.url);

test('dependency graph replaces unmaintained xlsx with the hardened fork', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  assert.equal(lock.packages[''].dependencies.xlsx, undefined);
  assert.ok(lock.packages[''].dependencies['@stackline/xlsx']);
  assert.equal(lock.packages['node_modules/@stackline/xlsx'].version, '1.0.9');
  assert.ok(lock.packages['node_modules/@stackline/xlsx'].integrity);
  assert.equal(Object.keys(lock.packages).some(path => /(^|\/)node_modules\/xlsx$/.test(path)), false);
});

test('Excel import/export preserves both supported formats and multiple worksheets', () => {
  assert.equal(XLSX.version, '1.0.9');
  for (const bookType of ['xlsx', 'xls']) {
    const workbook = XLSX.utils.book_new();
    const rows = [
      ['Title', 'Description', 'Score'],
      ['Claims review', 'International text: café 日本語', 4.5],
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Strategic Use Cases');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
      { title: 'Risk assessment', isActiveForRsa: 'false' },
    ]), 'AI Inventory');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType });
    const imported = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    assert.deepEqual(imported.SheetNames, ['Strategic Use Cases', 'AI Inventory']);
    assert.deepEqual(XLSX.utils.sheet_to_json(imported.Sheets['Strategic Use Cases'], {
      header: 1,
    }), rows);
    assert.deepEqual(XLSX.utils.sheet_to_json(imported.Sheets['AI Inventory']).map(row => ({ ...row })), [
      { title: 'Risk assessment', isActiveForRsa: 'false' },
    ]);
  }
});

test('Excel conversion ignores prototype-polluting headers', () => {
  const sheet = {
    '!ref': 'A1:D2',
    A1: { t: 's', v: '__proto__' },
    B1: { t: 's', v: 'constructor' },
    C1: { t: 's', v: 'prototype' },
    D1: { t: 's', v: 'safe' },
    A2: { t: 's', v: { polluted: 'yes' } },
    B2: { t: 's', v: 'bad' },
    C2: { t: 's', v: 'bad' },
    D2: { t: 's', v: 'ok' },
  };
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].safe, 'ok');
  assert.equal(rows[0].polluted, undefined);
  assert.equal(Object.getPrototypeOf(rows[0]), null);
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    assert.equal(Object.hasOwn(rows[0], key), false);
  }
  assert.equal(Object.prototype.polluted, undefined);
});

test('Excel parser ignores malicious worksheet names in XLSX and XLS files', () => {
  for (const bookType of ['xlsx', 'xls']) {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['ok']]), 'SafeSheet');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType });
    const archive = XLSX.CFB.read(buffer, { type: 'buffer' });
    if (bookType === 'xlsx') {
      const entry = XLSX.CFB.find(archive, 'Root Entry/xl/workbook.xml');
      const xml = Buffer.from(entry.content).toString('utf8');
      assert.ok(xml.includes('name="SafeSheet"'));
      entry.content = Buffer.from(xml.replace('name="SafeSheet"', 'name="__proto__"'));
    } else {
      const entry = XLSX.CFB.find(archive, '/Workbook');
      const content = Buffer.from(entry.content);
      const index = content.indexOf(Buffer.from('SafeSheet', 'utf16le'));
      assert.ok(index >= 0);
      Buffer.from('__proto__', 'utf16le').copy(content, index);
      entry.content = content;
    }
    const malicious = XLSX.CFB.write(archive, {
      type: 'buffer', ...(bookType === 'xlsx' ? { fileType: 'zip' } : {}),
    });
    const parsed = XLSX.read(malicious, { type: 'buffer' });
    assert.deepEqual(parsed.SheetNames, []);
    assert.deepEqual(Object.keys(parsed.Sheets), []);
    assert.equal(Object.getPrototypeOf(parsed.Sheets), null);
    assert.equal(Object.prototype.polluted, undefined);
  }
});

test('malformed spreadsheet HTML cannot stall regex parsing', () => {
  // A separate process enforces the deadline even if synchronous parsing hangs.
  const script = `
    import * as XLSX from '@stackline/xlsx';
    const html = '<table><tr><td>' + '<'.repeat(50000) + 'x' +
      '>'.repeat(50000) + '</td></tr></table>';
    try { XLSX.read(html, { type: 'string', raw: true }); }
    catch (error) {
      // Rejecting malformed input is also safe.
      if (!(error instanceof Error)) throw error;
    }
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

for (const parent of ['micromatch', 'chokidar']) {
  test(`${parent} uses the guarded braces implementation`, () => {
    const parentRequire = createRequire(require.resolve(parent));
    const braces = parentRequire('braces');
    assert.equal(parentRequire('braces/package.json').name, '@dieub/braces-depth-guard');
    assert.deepEqual(braces.expand('file-{01..03}.{ts,js}'), [
      'file-01.ts', 'file-01.js', 'file-02.ts', 'file-02.js', 'file-03.ts', 'file-03.js',
    ]);
    for (const input of [
      '{'.repeat(101) + 'x,y' + '}'.repeat(101),
      '('.repeat(101) + 'x' + ')'.repeat(101),
    ]) {
      assert.throws(() => braces(input), /exceeds max depth/);
      assert.throws(() => braces.expand(input), /exceeds max depth/);
      // The caller cannot raise the hard nesting limit.
      assert.throws(() => braces.parse(input, { maxDepth: Infinity }), /exceeds max depth/);
    }
    let ast = { type: 'text', value: 'x' };
    for (let i = 0; i < 102; i++) ast = { type: 'brace', nodes: [ast] };
    ast = { type: 'root', nodes: [ast] };
    for (const process of [braces.compile, braces.stringify, braces.expand]) {
      assert.throws(() => process(ast), /exceeds max depth/);
    }
  });
}

test('Tailwind glob matching still supports brace and extension patterns', () => {
  const micromatch = require('micromatch');
  assert.deepEqual(micromatch([
    'client/src/App.tsx', 'client/src/index.css', 'shared/schema.ts',
  ], '{client,shared}/**/*.{ts,tsx}'), ['client/src/App.tsx', 'shared/schema.ts']);
});

test('coverage configuration loads YAML without the vulnerable sprintf-js chain', () => {
  const coverageRequire = createRequire(require.resolve('@istanbuljs/load-nyc-config'));
  const yaml = coverageRequire('js-yaml');
  assert.deepEqual(yaml.load('include:\n  - server/**/*.ts\nall: true'), {
    include: ['server/**/*.ts'], all: true,
  });
});

test('Drizzle insert validation remains compatible with the existing Zod 3 schemas', () => {
  const result = insertUseCaseSchema.safeParse({
    title: 'Dependency smoke test', description: 'Valid test use case',
  });
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
  assert.equal(result.data.libraryTier, 'reference');
  assert.equal(insertUseCaseSchema.safeParse({ title: 42 }).success, false);
  const untrusted = "'; DROP TABLE users; --";
  const query = new PgDialect().sqlToQuery(sql`select ${untrusted}`);
  assert.equal(query.sql, 'select $1');
  assert.deepEqual(query.params, [untrusted]);
});

test('Survey.js model and overridden jsPDF generate a valid PDF', async () => {
  const definition = { elements: [{ type: 'text', name: 'answer', title: 'Assessment answer' }] };
  const model = new Model(definition);
  model.data = { answer: 'Security compatibility test' };
  assert.equal(model.getQuestionByName('answer').value, 'Security compatibility test');
  const pdf = new SurveyPDF(definition);
  pdf.data = model.data;
  const buffer = Buffer.from(await pdf.raw('arraybuffer'));
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
  assert.ok(buffer.length > 1000);
});

test('Multer accepts valid uploads and rejects truncated multipart requests', { timeout: 10000 }, async () => {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 } });
  app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filename: req.file.originalname, size: req.file.size });
  });
  app.use((error, _req, res, _next) => res.status(400).json({ error: error.message }));
  const valid = await request(app).post('/upload')
    .attach('file', Buffer.from('test data'), 'test.xlsx');
  assert.equal(valid.status, 200);
  assert.deepEqual(valid.body, { filename: 'test.xlsx', size: 9 });
  const truncated = await request(app).post('/upload')
    .set('Content-Type', 'multipart/form-data; boundary=smoke-boundary')
    .send('--smoke-boundary\r\nContent-Disposition: form-data; name="file"; filename="test.xlsx"\r\n\r\ntruncated');
  assert.equal(truncated.status, 400);
  assert.match(truncated.body.error, /end|malformed/i);
  const oversized = await request(app).post('/upload')
    .attach('file', Buffer.alloc(1025), 'large.xlsx');
  assert.equal(oversized.status, 400);
  assert.match(oversized.body.error, /too large/i);
});

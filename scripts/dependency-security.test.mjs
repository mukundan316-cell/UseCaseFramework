import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { Model } from 'survey-core';
import { SurveyPDF } from 'survey-pdf';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import express from 'express';
import multer from 'multer';
import request from 'supertest';
import { insertUseCaseSchema } from '../shared/schema.ts';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

test('Excel import/export preserves both supported formats and multiple worksheets', () => {
  assert.equal(XLSX.version, '0.20.3');
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
    assert.deepEqual(XLSX.utils.sheet_to_json(imported.Sheets['AI Inventory']), [
      { title: 'Risk assessment', isActiveForRsa: 'false' },
    ]);
  }
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

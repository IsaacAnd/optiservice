import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvField, serializeCsv } from '../src/utils/csvCore.mjs';

test('protege contra fórmulas em células de texto', () => {
  assert.equal(escapeCsvField('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"');
  assert.equal(escapeCsvField(' +1+1'), '"\' +1+1"');
});

test('escapa aspas, preserva acentos e gera delimitador esperado', () => {
  assert.equal(serializeCsv(['Nome', 'Observação'], [['Ana', 'Manutenção "expressa"']]), '"Nome";"Observação"\r\n"Ana";"Manutenção ""expressa"""');
});

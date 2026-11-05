// Testes da leitura automática e das regras de cruzamento.
// Rodar com:  node --test tests/*.test.js
// Os textos em tests/fixtures/ são saídas do pdf.js (e de OCR) com dados pessoais trocados por exemplos.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Carrega os scripts do navegador num contexto isolado
const ctx = vm.createContext({ console });
for (const f of ['util.js', 'leitura-ss.js', 'leitura-projeto.js', 'cruzamento.js']) {
  let code = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  // util.js usa document/localStorage só em funções; expõe as constantes como globais do contexto
  code = code.replace(/^(const|let) /gm, 'var ');
  vm.runInContext(code, ctx, { filename: f });
}
const fx = n => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8');
const { parseSS, parseProjeto, calcAlertas } = ctx;
const alerta = (al, item) => al.find(a => a.i === item);

test('caso 1 — SS lida por completo', () => {
  const ss = parseSS(fx('caso1_ss.txt'));
  assert.equal(ss.ss, '100000002');
  assert.equal(ss.uc, '000111111101');
  assert.equal(ss.localidade, 'BRITANIA');
  assert.equal(ss.potTrafo, '150');
  assert.equal(ss.tensaoForn, '34500');
  assert.equal(ss.tensaoMed, '380');
  assert.equal(ss.subgrupo, 'A3-A');
  assert.equal(ss.medModelo, 'E750-A2E3');
  assert.equal(ss.tcRel, '250/5');
  assert.equal(ss.chAferModelo, 'BAR10');
});

test('caso 1 — projeto (formato quadro de resumo) e divergências', () => {
  const ss = parseSS(fx('caso1_ss.txt'));
  const prj = parseProjeto(fx('caso1_diagrama_ocr.txt'), ss);
  assert.equal(prj.modQtd, '206');
  assert.equal(prj.modW, '700');
  assert.equal(prj.invModelo, 'C6-75K-T6-40');
  assert.equal(prj.invModelo2, 'R6-75K-T4-32');
  assert.equal(prj.trafoKva, '150');
  assert.equal(prj.tcRel, '600/5');
  const al = calcAlertas({ ss, prj, manual: [] });
  assert.equal(alerta(al, 'TCs da medição').s, 'red');
  assert.equal(alerta(al, 'Modelo do inversor').s, 'red');
  assert.equal(alerta(al, 'Relação C.C./C.A.').s, 'yel');
});

test('caso 2 — SS com tensão de medição 115 V', () => {
  const ss = parseSS(fx('caso2_ss.txt'));
  assert.equal(ss.potTrafo, '112.5');
  assert.equal(ss.tensaoMed, '115');
  assert.equal(ss.tcRel, '200/5');
  assert.equal(ss.chAferModelo, 'BTS - 066');
});

test('caso 2 — projeto (formato fabricante/modelo/potência) e alertas', () => {
  const ss = parseSS(fx('caso2_ss.txt'));
  const prj = parseProjeto(fx('caso2_diagrama.txt'), ss);
  assert.equal(prj.modQtd, '234');
  assert.equal(prj.modMarca, 'TRINA SOLAR');
  assert.equal(prj.modW, '705');
  assert.equal(prj.invMarca, 'SUNGROW');
  assert.equal(prj.invModelo, 'SG110CX-P2');
  assert.equal(prj.invKw, '110');
  assert.equal(prj.strings, '6x20, 6x19');
  assert.equal(prj.trafoKva, '112,5');
  assert.equal(prj.tcRel, '200/5');
  assert.equal(prj.disjGeral, '175');
  assert.equal(prj.localidade, 'ITABERAI');
  const al = calcAlertas({ ss, prj, manual: [] });
  assert.equal(alerta(al, 'Potência C.C.').s, 'red');            // 110 kWp declarado × 164,97 kWp real
  assert.equal(alerta(al, 'Tensão de medição no cadastro').s, 'yel');
  assert.equal(alerta(al, 'Gerador auxiliar').s, 'yel');
  assert.equal(alerta(al, 'Número da UC').s, 'yel');
  assert.equal(alerta(al, 'TCs da medição').s, 'grn');
  assert.equal(alerta(al, 'Strings × módulos').s, 'grn');
});

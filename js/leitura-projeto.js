/* Leitura automática dos diagramas do projeto (texto do PDF ou resultado do OCR).
   Para suportar o formato de um novo projetista, acrescente padrões aqui e um caso em tests/. */
function parseProjeto(t,ss){
  ss=ss||{};
  const T=t.replace(/\s*\|\s*/g,' ').replace(/[ \t]+/g,' '),U=norm(T),r={};
  const f=(re,s=U)=>{const m=s.match(re);return m?(m[1]||'').trim():''};
  const all=re=>[...U.matchAll(re)];
  const MARCAS='SUNGROW|SAJ|GROWATT|FRONIUS|HUAWEI|GOODWE|DEYE|WEG|SOLIS|ABB|SMA|SOFAR|FOXESS|HOYMILES|APSYSTEMS|ENPHASE|REFUSOL|PHB|KSTAR|CHINT|SOLAREDGE|INGETEAM|ECOSOLYS|TSUNESS|SOLPLANET|AUXSOL';
  /* ---- módulos ---- */
  r.modQtd=f(/QUANTIDADE DE MODULOS:?\s*(\d{2,5})\b/)||f(/TOTAL DE MODULOS:?\s*(\d{2,5})/)||f(/(\d{2,5})\s*MODULOS/);
  r.modMarca=f(/MARCA DOS MODULOS:?\s*([A-Z][A-Z0-9 ]{1,20}?)(?=\s+MODELO|\s+POT|$)/);
  r.modModelo=f(/MODELO DOS MODULOS:?\s*([A-Z0-9][\w\-\/.]{2,25})/);
  r.modW=f(/POTENCIA NOMINAL DOS MODULOS:?\s*(\d{3,4})\s*W/)||f(/MODULOS DE (\d{3,4})\s*WP?/)||f(/POTENCIA (\d{3,4})\s*WP/);
  const fab=U.match(/([A-Z][A-Z ]{2,20}?)\s*\/\s*([A-Z0-9][\w.\-]{3,25})\s*\/\s*(\d{3,4})\s*WP?\b/);
  const MODM=/(TRINA SOLAR|CANADIAN SOLAR|CANADIAN|JINKO SOLAR|JINKO|JA SOLAR|LONGI|RISEN|BYD|ASTRONERGY|DAH SOLAR|SUNOVA|HONOR SOLAR|OSDA|ZNSHINE|TONGWEI|DMEGC|RONMA|HELIUS|ERA SOLAR|LEAPTON|GCL|SERAPHIM|BELENERGY|INTELBRAS|AE SOLAR|HANERSUN|RESUN|SINE|TSUN|ULICA|SUNERGY)$/;
  if(fab){const mb=fab[1].trim().match(MODM);fab[1]=mb?mb[1]:fab[1].trim().split(' ').slice(-2).join(' ');r.modMarca=r.modMarca||fab[1];r.modModelo=r.modModelo||fab[2];r.modW=r.modW||fab[3]}
  const mfv=U.match(/MODULOS? FV:?\s*([A-Z][A-Z ]{2,25}?)\s+(?:[A-Z]+\s+)*?([A-Z]{2,5}-[\w.\-]{3,20})\s+(\d{3,4})\s*W/);
  if(mfv){r.modMarca=r.modMarca||mfv[1].trim();r.modModelo=r.modModelo||mfv[2];r.modW=r.modW||mfv[3]}
  r.kwpDecl=f(/POTENCIA TOTAL INSTALADA C\.?C\.?:?\s*([\d.,]+)\s*KWP/)||f(/([\d.,]+)\s*KWP/);
  /* ---- inversor ---- */
  r.invMarca=f(/MARCA DO INVERSOR:?\s*([A-Z][A-Z0-9]{1,15})/);
  r.invModelo=f(/MODELO DO INVERSOR:?\s*([A-Z0-9][\w\-]{3,25})/);
  const im=U.match(new RegExp('(?:INVERSOR(?:ES)?\\s+)?\\b('+MARCAS+')\\b[\\s:]*(?:MODELOS?:?\\s*)?([A-Z]{1,4}\\d[\\w\\-]{2,20})'));
  if(im){r.invMarca=r.invMarca||im[1];if(!r.invModelo)r.invModelo=im[2];else if(norm(im[2])!==norm(r.invModelo))r.invModelo2=im[2]}
  const mods=all(/MODELOS?:?\s*([A-Z]\d[\w]*-[\w\-]{3,20})/g).map(m=>m[1]).filter(m=>r.invModelo&&norm(m)!==norm(r.invModelo));
  if(mods.length&&!r.invModelo2)r.invModelo2=mods[0];
  if(!r.invMarca){const b=U.match(new RegExp('INVERSOR\\s+('+MARCAS+')'));if(b)r.invMarca=b[1]}
  r.invQtd=f(/QUANTIDADE DE INVERSORES:?\s*(\d{1,3})/)||f(/(\d{1,2})\s*INVERSOR(?:ES)?\s+(?:[A-Z]+\s+)?[A-Z]{1,4}\d/);
  if(r.invQtd)r.invQtd=String(+r.invQtd);
  r.invKw=f(/POTENCIA NOMINAL TOTAL DOS INVERSORES:?\s*([\d.,]+)\s*KW/)||f(/([\d.,]+)\s*KW C\.?A\.?/)||f(/INVERSOR\s*(\d{2,4}(?:[.,]\d+)?)\s*KW\b/)||f(/GERACAO[^.]{0,40}?-\s*(\d{2,4}(?:[.,]\d+)?)\s*KW\b(?!P)/)||f(/FOTOVOLTAICA\s*-?\s*(\d{2,4}(?:[.,]\d+)?)\s*KW\b(?!P)/);
  r.invTensao=f(/TENSAO DE SAIDA C\.?A\.? DOS INVERSORES:?\s*([\d\/]+\s*V)/)||f(/3\s*[ØO]\s*(\d{3}\/\d{3})\s*V/);
  /* ---- strings ---- */
  const ns=all(/QUANTIDADE DE MODULOS:?\s*(\d{1,3})\b/g).map(m=>+m[1]).filter(n=>n>0&&n<=40);
  let cnt={};
  if(ns.length>1)ns.forEach(n=>cnt[n]=(cnt[n]||0)+1);
  else{
    const sk={};all(/STRING\s*(\d{1,2})\s*-\s*([\d.,]+)\s*KWP/g).forEach(m=>sk[m[1]]=num(m[2]));
    const w=num(r.modW);
    if(Object.keys(sk).length>1&&w)Object.values(sk).forEach(k=>{const n=Math.round(k*1000/w);cnt[n]=(cnt[n]||0)+1});
  }
  if(Object.keys(cnt).length)r.strings=Object.entries(cnt).sort((a,b)=>b[0]-a[0]).map(([n,q])=>q+'x'+n).join(', ');
  /* ---- transformador ---- */
  r.trafoKva=f(/TRAFO\s*-?\s*(\d{2,4}(?:[.,]\d{1,2})?)\s*KVA/)||f(/TRANSF[A-Z.]*\s+[A-Z. ]*?(\d{2,4}(?:[.,]\d{1,2})?)\s*KVA/)||f(/(\d{2,4}(?:[.,]\d{1,2})?)\s*KVA/);
  let tv=U.match(/(\d{2}[.,]\d)\s*KV\s*-\s*(\d{3}\/\d{3})\s*V/);
  if(tv){r.trafoPrim=tv[1];r.trafoSec=tv[2]}
  else{tv=U.match(/\(\s*(\d{2}[.,]\d)\s*-\s*0[.,](\d{3})\s*\/\s*0[.,](\d{3})\s*\)\s*KV/);if(tv){r.trafoPrim=tv[1];r.trafoSec=[tv[2],tv[3]].sort().join('/')}}
  if(!r.trafoPrim)r.trafoPrim=f(/KVA\s*-\s*(\d{2}[.,]\d)\s*KV/);
  const ger=U.match(/GERADOR\s*(\d{2,4}(?:[.,]\d)?)\s*KVA/)||U.match(/(\d{2,4}(?:[.,]\d)?)\s*KVA\s*GERADOR/);
  if(ger)r.gerador=ger[1]+' kVA'+(/CHAVE REVERSORA/.test(U)?' com chave reversora':'');
  const cf=U.match(/CH(?:AVE)?\.?\s*(?:SEC\.?\s*)?FUS(?:IVEL)?\.?\s*([\d.,]+\s*KV)[,\s]*(\d{2,3}\s*A)?(?:.{0,40}?ELO\s*(\d{1,3}\s*[HKT]))?/);
  if(cf)r.chaveFus=[cf[1],cf[2],cf[3]&&'elo '+cf[3]].filter(Boolean).join(' · ');
  const pr=U.match(/PARA-?\s?RAIOS[^]{0,60}?(\d{2})\s*KV,?\s*(\d{1,2})\s*KA/);if(pr)r.pararaios='ZnO '+pr[1]+' kV, '+pr[2]+' kA';
  /* ---- medição / proteções ---- */
  const tc=U.match(/TC'?S?\s*(\d{2,4})\s*[:\/]\s*5\s*A?\b/)||U.match(/(\d{2,4})\s*[:\/]\s*5\s*A?\b/);if(tc)r.tcRel=tc[1]+'/5';
  const tcc=U.match(/CLASSE DE EXATIDAO:?\s*([\w,]+)/);if(tcc)r.tcClasse=tcc[1]+(f(/FT:?\s*([\d,]+)/)?' · FT '+f(/FT:?\s*([\d,]+)/):'');
  const dj=U.match(/DISJUNTOR TRIPOLAR\s*(?:EXISTENTE)?\s*(\d{2,4})\s*A/)||U.match(/(?<![-\d])(\d{2,4})\s*A\s*\d{1,2}\s*KA/);if(dj)r.disjGeral=dj[1];
  if(/BIDIRECIONAL/.test(U))r.medStatus=/MEDIDOR EXISTENTE/.test(U)?'Ambíguo (existente e a instalar)':'Bidirecional a instalar';
  else if(/QUATRO QUADRANTES|4 QUADRANTES/.test(U))r.medStatus='Existente — 4 quadrantes';
  const dcc=U.match(/DPS CC[-\s]*(\d{3,4}\s*V)[^]{0,20}?CLASSE\s*(I{1,2})/);
  const sec=U.match(/(?:CHAVE SECCIONADORA\s*)?BIPOLAR CC\s*-?\s*(\d{3,4}V\s*\/\s*\d{2}A)/);
  if(dcc||sec)r.protCC=[sec&&'Chave seccionadora bipolar '+sec[1],dcc&&'DPS C.C. '+dcc[1]+' classe '+dcc[2]].filter(Boolean).join(' + ');
  const dca=U.match(/DPS CA[-\s]*(\d{3}\s*V)[^]{0,20}?CLASSE\s*(I{1,2})/);
  const qm=U.match(/QCAFV[^]{0,200}/),qa=qm?[...qm[0].matchAll(/(\d{2,4})\s*A\b/g)].map(m=>+m[1]):[],qca=qa.length?[0,Math.max(...qa)]:null;
  if(dca||qca)r.stringbox=[qca&&'Disjuntor '+qca[1]+' A',dca&&'DPS C.A. '+dca[1]+' classe '+dca[2]].filter(Boolean).join(' + ');
  const cb=U.match(/(\d#\d{2,3}\s*\(\s*\d{1,3}\s*\)\s*(?:T\s*)?\d{0,3}\s*MM.?)/)||U.match(/(\d#\d{2,3}MM.?\s*\+\s*PE\s*#?\d{2,3}MM.?)/);if(cb)r.caboInv=cb[1].replace(/MM.?$/,'mm²');
  const qg=U.match(/(?:QGBT|QDG)[^]{0,60}?(\d{2,4})\s*A\b/);if(qg)r.disjQdg=qg[1];
  const pbt=U.match(/PARA-?RAIOS BAIXA TENSAO[^]{0,30}?(\d{3})\s*V[^]{0,20}?IN:?\s*(\d{1,2})\s*KA/)||U.match(/(\d{3})\s*V\s*PARA-?RAIOS BAIXA TENSAO/);
  const dpg=U.match(/(\d)X\s*DPS\s*-?\s*(\d{3})\s*V[^]{0,20}?IN\s*[≥>=]*\s*(\d{1,2})\s*KA/);
  if(dpg)r.dpsGeral=dpg[1]+'× DPS '+dpg[2]+' V, In ≥ '+dpg[3]+' kA';else if(pbt)r.dpsGeral='Para-raios BT '+pbt[1]+' V'+(pbt[2]?', In '+pbt[2]+' kA':'');
  const at=U.match(/(1#\d{2}\s*MM.?\s*NU)/);if(at)r.aterr='Cabo '+at[1].replace(/MM.?/,'mm²').toLowerCase();
  if(/TRAFO EXISTENTE|TRANSFORMADOR EXISTENTE/.test(U))r.trafoSit='Existente';else if(/TRAFO NOVO|TRANSFORMADOR (?:NOVO|A INSTALAR)/.test(U))r.trafoSit='Novo';
  /* ---- identificação ---- */
  r.uc=f(/UNIDADE CONSUMIDORA\s*:?\s*([\d][\d.\-]{7,})/)||f(/\bUC\s*[:N°º]*\s*([\d.]{9,}-?\d{0,2})/);
  r.cliente=f(/CLIENTE:?\s*([A-Z][A-Z ]{5,60}?)(?=\s+CNPJ|\s+CPF|\s+ENDERECO|$)/)||f(/PROPRIETARI[OA]:?\s*([A-Z][A-Z ]{5,60}?)(?=\s+(?:FAZENDA|CPF|CNPJ|ENDERECO|RUA|AV|PROJETO|$))/);
  const loc=norm(ss.localidade);
  if(loc&&U.includes(loc))r.localidade=ss.localidade;
  else r.localidade=f(/,\s*([A-Z][A-Z ]{2,30}?)\s*-\s*(?:GO|GOIAS)\b/);
  r.resp=f(/RESPONSAVE(?:L|IS)[^:]*:?\s*(?:ENG[A-Z]*\.?\s*)?([A-Z][A-Z ]{5,50}?)\s+CREA/)||f(/ENG[A-Z]*\.?\s+([A-Z][A-Z ]{5,50}?)\s+CREA/)||f(/Eng[ªº°a-z]*\.?\s+((?:[A-ZÀ-Ú][a-zà-ú]+\s?(?:de |da |dos |do )?){2,6})/,T);
  r.empresa=f(/\b([A-Z]{2,15} (?:ENGENHARIA|ENERGY)(?: LTDA)?)\b/);
  r.dataPrj=f(/DATA:?\s*(\d{2}\/\d{2}\/\d{2,4})/)||f(/(\d{2}\/\d{2}\/\d{4})/);
  if(/GERACAO PROPRIA/.test(U))r.plEntrada='CUIDADO – Risco de choque elétrico – Geração própria';
  if(/GERACAO DISTRIBUIDA NO CIRCUITO|CUIDADO.{0,20}GERACAO DISTRIBUIDA/.test(U)){r.plPoste='CUIDADO – Geração distribuída no circuito';r.plQdg='CUIDADO – Geração distribuída no circuito'}
  else if(/QDG[^.]{0,80}GERACAO DISTRIBUIDA|GERACAO DISTRIBUIDA[^.]{0,80}QDG/.test(U))r.plQdg='Cuidado! Geração distribuída no circuito';
  for(const k in r)if(!r[k])delete r[k];
  return r;
}

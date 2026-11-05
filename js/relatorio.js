/* Relatório para o fiscal (tela, impressão e download em .html) */
/* Estilos usados no relatório baixado (.html independente). Manter em sincronia com css/estilo.css */
const REL_CSS=`:root{--az:#000464;--az2:#1a2a8a;--bg:#eef1f6;--card:#fff;--tx:#1b2330;--mut:#5b6677;--ln:#d5dbe5;
--red:#c0392b;--redbg:#fadbd8;--yel:#d68910;--yelbg:#fdebd0;--grn:#1e8449;--grnbg:#d5f5e3;--gry:#7f8c8d}
.b-red{background:var(--red)}.b-yel{background:var(--yel)}.b-grn{background:var(--grn)}.b-gry{background:var(--gry)}
*{box-sizing:border-box}
.badge{display:inline-block;font-size:11px;font-weight:700;color:#fff;border-radius:4px;padding:2px 7px;white-space:nowrap}
.b-red{background:var(--red)}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid var(--ln);padding:6px 8px;text-align:left;vertical-align:middle;font-size:13px}
th{background:#f2f4f7}
.kpi{display:grid;grid-template-columns:repeat(5,1fr);gap:0;border:1px solid var(--ln);border-radius:6px;overflow:hidden}
.kpi div{text-align:center;padding:8px;background:#f5f7fb;border-right:1px solid var(--ln)}
.kpi div:last-child{border-right:none}
.kpi b{display:block;font-size:20px;color:var(--az)}
.kpi span{font-size:11px;color:var(--mut)}
.rp{font-family:Arial,sans-serif;font-size:11px;color:#1b2330;max-width:800px;margin:0 auto}
.rp .rh{background:var(--az);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:12px 14px}
.rp .rh h1{margin:0;font-size:17px}
.rp .rh p{margin:3px 0 0;font-size:11px;opacity:.85}
.rp .rh img{height:44px}
.rp h4{color:var(--az);font-size:13px;margin:14px 0 6px}
.rp table td,.rp table th{font-size:10.5px;padding:4px 6px}
.rp .sec td{background:var(--az);color:#fff;font-weight:700}
.rp .dv td:nth-child(-n+2){background:var(--redbg)}
.rp .bx{display:inline-block;width:11px;height:11px;border:1px solid #333;vertical-align:middle;margin-right:4px}
.rp .foot{font-size:9px;color:#888;margin-top:14px;border-top:1px solid var(--ln);padding-top:4px}
body{margin:0;font-family:Arial,sans-serif;background:#fff;padding:16px}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@media print{body{padding:0}.pb{page-break-before:always}tr{page-break-inside:avoid}@page{size:A4;margin:12mm}}`;

function kpiHTML(){const P=cur.prj,S=cur.ss,kr=kwpReal(P);const k=[[isNaN(kr)?'—':fmt(kr)+' kWp','Potência C.C.'],[P.invKw?P.invKw+' kW':'—','Potência C.A.'],[P.modQtd||'—','Módulos'+(P.modW?' '+P.modW+' W':'')],[parseStrings(P.strings).n||'—','Strings'],[(P.trafoKva||S.potTrafo||'—')+((P.trafoKva||S.potTrafo)?' kVA':''),'Transformador']];
  return `<div class="kpi">${k.map(([a,b])=>`<div><b>${esc(a)}</b><span>${b}</span></div>`).join('')}</div>`}
function checklist(){
  const S=cur.ss,P=cur.prj,al=calcAlertas(cur),dv=n=>al.some(a=>a.s==='red'&&a.i.startsWith(n));
  const o=(a,b)=>a&&b&&norm(a)!==norm(b)?`${a} (SS) ou ${b} (projeto)`:(a||b||'');
  return [
   ['GERAÇÃO — MÓDULOS'],['Quantidade de módulos',P.modQtd,dv('Strings')||dv('Potência C.C.')],['Marca / modelo',[P.modMarca,P.modModelo].filter(Boolean).join(' ')],['Potência unitária',P.modW&&P.modW+' Wp'],['Potência total C.C.',(()=>{const kr=kwpReal(P),kd=num(P.kwpDecl);if(isNaN(kr))return P.kwpDecl&&P.kwpDecl+' kWp';return fmt(kr)+' kWp'+(!isNaN(kd)&&Math.abs(kr-kd)/kd>0.005?' (projeto declara '+P.kwpDecl+' kWp)':'')})(),dv('Potência C.C.')],['Strings / módulos por string',P.strings,dv('Strings')],
   ['INVERSOR'],['Quantidade',P.invQtd],['Marca',P.invMarca],['Modelo',P.invModelo2&&norm(P.invModelo2)!==norm(P.invModelo)?`${P.invModelo} (resumo) ou ${P.invModelo2} (unifilar)`:P.invModelo,dv('Modelo do inversor')],['Potência nominal C.A.',P.invKw&&P.invKw+' kW'+(P.invTensao?' · '+P.invTensao:'')],['MPPTs utilizados',P.mppt],['Nº de série','—'],
   ['PROTEÇÕES'],['Proteção C.C.',P.protCC],['String box C.A.',P.stringbox],['Cabo inversor → proteção',P.caboInv],['Disjuntor geral da medição',P.disjGeral2?`${P.disjGeral} A ou ${P.disjGeral2} A`:(P.disjGeral&&P.disjGeral+' A'),dv('Disjuntor')],['DPS da proteção geral',P.dpsGeral],['Disjuntor geral do QDG',P.disjQdg&&P.disjQdg+' A'],
   ['MEDIÇÃO'],['Medidor (nº / modelo)',[S.medidor,S.medModelo,S.cte&&'cte '+S.cte].filter(Boolean).join(' · ')],['Bidirecional?','Exigido para GD'+(P.medStatus?' — projeto: '+P.medStatus:''),P.medStatus&&P.medStatus!=='Existente'],['TCs (relação)',o(S.tcRel,P.tcRel),dv('TCs')],['TCs (nº de série)',S.tcSeries],['TPs',o(S.tpRel,P.tpRel)],['Chave de aferição',[S.chAfer,S.chAferModelo].filter(Boolean).join(' · ')],
   ['TRANSFORMADOR E ENTRADA'],['Potência do trafo',o(S.potTrafo&&S.potTrafo+' kVA',P.trafoKva&&P.trafoKva+' kVA')+(P.trafoSit?' ('+P.trafoSit.toLowerCase()+')':''),dv('Potência do transformador')],['Tensões',[S.tensaoForn&&(num(S.tensaoForn)/1000).toLocaleString('pt-BR')+' kV',S.tensaoMed&&S.tensaoMed+' V'].filter(Boolean).join(' – ')],['Chave fusível / elo',P.chaveFus],['Para-raios',P.pararaios],
   ['SINALIZAÇÃO'],['Placa no padrão de entrada',P.plEntrada||'“CUIDADO – Risco de choque elétrico – Geração própria”'],['Placa no poste do trafo',P.plPoste||'“CUIDADO – Geração distribuída no circuito”'],['Advertência no QDG',P.plQdg||'“CUIDADO – Geração distribuída no circuito”'],
   ['ATERRAMENTO'],['Aterramento',P.aterr]
  ];
}
function relHTML(){
  const S=cur.ss,P=cur.prj,al=calcAlertas(cur);
  const id=[['SS',[S.ss,S.servico].filter(Boolean).join(' — '),'Abertura',[S.data,S.prioridade&&'prioridade '+S.prioridade.toLowerCase()].filter(Boolean).join(' · ')],
   ['Cliente',S.cliente,'UC (SS)',S.uc],['Endereço',S.endereco,'Localidade',S.localidade],
   ['Subgrupo / tarifa',[S.subgrupo,S.tarifa,S.classe].filter(Boolean).join(' · '),'Tipo de ligação',S.tipoLig],
   ['Projeto',[P.empresa,P.resp].filter(Boolean).join(' — '),'UC (projeto)',P.uc]];
  return `<div class="rp">
  <div class="rh"><div><h1>RELATÓRIO DE CONFERÊNCIA — CONEXÃO GD</h1><p>Comparativo Nota de Serviço × Diagramas do projeto · uso do fiscal em campo</p></div><img src="${LOGO}"></div>
  <table style="margin-top:8px">${id.map(r=>`<tr><th style="width:15%">${r[0]}</th><td>${esc(r[1])}</td><th style="width:14%">${r[2]}</th><td style="width:24%">${esc(r[3])}</td></tr>`).join('')}</table>
  <h4>Resumo da usina (projeto)</h4>${kpiHTML()}
  <h4>Pontos de atenção encontrados nos documentos</h4>
  <p style="margin:0 0 6px">Itens identificados <b>antes</b> da ida a campo, cruzando a SS com os diagramas. O fiscal deve confirmar no local qual informação está correta.</p>
  <table><tr><th style="width:13%">Status</th><th style="width:16%">Item</th><th>O que os documentos dizem</th><th style="width:32%">Ação em campo</th></tr>
  ${al.map(a=>`<tr><td style="text-align:center"><span class="badge ${LBL[a.s][1]}">${LBL[a.s][0]}</span></td><td><b>${esc(a.i)}</b></td><td>${a.manual!=null?esc(a.d):a.d}</td><td>${a.manual!=null?esc(a.a):a.a}</td></tr>`).join('')}</table>
  <div class="pb"></div>
  <h4>Checklist de conferência em campo</h4>
  <p style="margin:0 0 6px">Preencher a coluna <b>Encontrado em campo</b> e marcar a situação. Linhas em vermelho têm divergência entre os documentos.</p>
  <table><tr><th style="width:24%">Item</th><th style="width:34%">Previsto (SS / projeto)</th><th>Encontrado em campo</th><th style="width:6%">OK</th><th style="width:6%">Não</th></tr>
  ${checklist().map(r=>r.length===1?`<tr class="sec"><td colspan="5">${r[0]}</td></tr>`:`<tr class="${r[2]?'dv':''}"><td>${esc(r[0])}</td><td>${esc(r[1]||'—')}</td><td style="height:22px"></td><td></td><td></td></tr>`).join('')}</table>
  <div style="page-break-inside:avoid;break-inside:avoid"><h4>Conclusão da vistoria</h4>
  <table><tr><td><span class="bx"></span><b>Aprovado</b></td><td><span class="bx"></span><b>Aprovado com pendências</b></td><td><span class="bx"></span><b>Reprovado</b></td></tr>
  <tr><td colspan="3" style="height:80px;vertical-align:top"><b>Observações / pendências:</b></td></tr>
  <tr><td><b>Fiscal:</b></td><td><b>Matrícula:</b></td><td><b>Data:</b> ____/____/______</td></tr>
  <tr><td colspan="3"><b>Fotos anexadas:</b> <span class="bx"></span>módulos <span class="bx"></span>etiqueta do inversor <span class="bx"></span>string box <span class="bx"></span>medição/TCs <span class="bx"></span>placas</td></tr></table></div>
  <div class="foot">SS ${esc(S.ss||'')} · UC ${esc(S.uc||'')} · Gerado em ${new Date().toLocaleString('pt-BR')} · Conferência de Conexões GD — Equatorial Energia</div>
  </div>`;
}
function renderRep(){$('rep').innerHTML=relHTML()}
function baixarRelHTML(){
  const css=REL_CSS;
  const h=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Conferência GD - SS ${esc(cur.ss.ss||'')}</title><style>${css}
</style></head><body>${relHTML()}<script>setTimeout(()=>print(),400)<\/script></body></html>`;
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([h],{type:'text/html'}));a.download=`Conferencia_GD_SS_${cur.ss.ss||'nova'}.html`;a.click();
}

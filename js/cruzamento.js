/* Regras de cruzamento SS × projeto. Cada regra gera um alerta: red = divergência, yel = conferir, gry = observação, grn = ok */
function relTC(s){const m=String(s||'').match(/([\d.,]+)\s*[:\/]\s*([\d.,]+)/);return m?num(m[1])/num(m[2]):NaN}
function digits(s){return String(s||'').replace(/\D/g,'').replace(/^0+/,'')}
function parseStrings(s){let tot=0,n=0;String(s||'').replace(/(\d+)\s*[x×]\s*(\d+)/gi,(_,a,b)=>{n+=+a;tot+=a*b});return{n,tot}}
function calcAlertas(c){
  const S=c.ss||{},P=c.prj||{},A=[],add=(s,i,d,a)=>A.push({s,i,d,a});
  // TCs
  const rs=relTC(S.tcRel),rp=relTC(P.tcRel);
  if(!isNaN(rs)&&!isNaN(rp)){ if(Math.abs(rs-rp)>0.01) add('red','TCs da medição',`SS: <b>${esc(S.tcRel)}</b>${S.tcSeries?' (nº '+esc(S.tcSeries)+')':''}. Projeto: <b>${esc(P.tcRel)}</b>.`,`Conferir relação gravada nos TCs instalados. RTC da SS = ${rs}, RTC do projeto = ${rp}. Se houver troca, atualizar o fator de multiplicação da UC.`);
    else add('grn','TCs da medição',`SS e projeto: ${esc(S.tcRel)}`,'—')}
  else if(!isNaN(rs)||!isNaN(rp)) add('yel','TCs da medição',`SS: ${esc(S.tcRel||'—')} · Projeto: ${esc(P.tcRel||'—')}`,'Uma das fontes não informa a relação — conferir nos TCs.');
  // TCs x carga do trafo
  const kva=num(P.trafoKva)||num(S.potTrafo),vsec=num(S.tensaoMed)||num(String(P.trafoSec||'').split('/').pop());
  const In=kva*1000/(Math.sqrt(3)*(vsec||380));
  // Trafo
  const ks=num(S.potTrafo),kp=num(P.trafoKva);
  if(!isNaN(ks)&&!isNaN(kp)) Math.abs(ks-kp)>0.5?add('red','Potência do transformador',`SS: <b>${fmt(ks,ks%1?1:0)} kVA</b> · Projeto: <b>${fmt(kp,kp%1?1:0)} kVA</b>`,'Conferir placa do transformador.'):add('grn','Potência do transformador',`${fmt(ks,ks%1?1:0)} kVA na SS e no projeto`,'—');
  // tensões
  const vf=num(S.tensaoForn)/1000,vp=num(P.trafoPrim);
  if(!isNaN(vf)&&!isNaN(vp)&&Math.abs(vf-vp)>0.2) add('red','Tensão primária',`SS: ${fmt(vf,1)} kV · Projeto: ${fmt(vp,1)} kV`,'Conferir tensão do ramal/trafo.');
  const vm=num(S.tensaoMed),vss=String(P.trafoSec||'').split('/').map(num).filter(x=>!isNaN(x)),vs=vss.length?Math.max(...vss):NaN;
  if(!isNaN(vm)&&!isNaN(vs)&&!vss.some(x=>Math.abs(x-vm)<=1)){
    if(vm<=127&&!S.tpRel&&S.tcRel) add('yel','Tensão de medição no cadastro',`SS: <b>${vm} V</b> · Projeto: trafo ${esc(P.trafoSec)} V, medição indireta em BT (só TCs, sem TPs)`,`${vm} V é tensão típica de secundário de TP, mas a medição é em baixa tensão. Conferir a tensão no medidor e corrigir o cadastro, se for o caso.`);
    else add('red','Tensão secundária / medição',`SS: ${vm} V · Projeto: ${esc(P.trafoSec)} V`,'Conferir tensão no padrão.');}
  if(P.gerador) add('yel','Gerador auxiliar',`Projeto prevê gerador de <b>${esc(P.gerador)}</b>`,'Conferir se a chave reversora impede o paralelismo do gerador com a rede e com a usina.');
  // modelo inversor
  if(P.invModelo&&P.invModelo2&&norm(P.invModelo)!==norm(P.invModelo2)) add('red','Modelo do inversor',`Quadro de resumo: <b>${esc(P.invMarca||'')} ${esc(P.invModelo)}</b> · Outra folha/unifilar: <b>${esc(P.invModelo2)}</b>`,'Anotar o modelo da etiqueta do inversor e o nº de série.');
  // disjuntor
  if(P.disjGeral&&P.disjGeral2&&num(P.disjGeral)!==num(P.disjGeral2)) add('red','Disjuntor geral da medição',`Projeto indica <b>${esc(P.disjGeral)} A</b> e <b>${esc(P.disjGeral2)} A</b>`,'Conferir corrente nominal na placa do disjuntor.');
  const dg=num(P.disjGeral);
  if(!isNaN(dg)&&!isNaN(In)&&dg>In*1.6) add('yel','Disjuntor geral × trafo',`Disjuntor ${fmt(dg,0)} A para corrente nominal do trafo de ${fmt(In,0)} A`,'Disjuntor bem acima da corrente nominal — verificar coordenação.');
  // UC
  const us=digits(S.uc),up=digits(P.uc);
  if(us&&up){ if(us===up||up===us) add('grn','Número da UC',`SS e projeto: ${esc(S.uc)}`,'—');
    else if(us.slice(0,7)===up.slice(0,7)) add('yel','Número da UC',`SS: <b>${esc(S.uc)}</b> · Projeto: <b>${esc(P.uc)}</b>`,'Mesmo início, formato diferente — confirmar que é a mesma UC.');
    else if(S.cliente&&P.cliente&&norm(S.cliente).split(' ').slice(0,2).join(' ')===norm(P.cliente).split(' ').slice(0,2).join(' ')) add('yel','Número da UC',`SS: <b>${esc(S.uc)}</b> · Projeto: <b>${esc(P.uc)}</b> (mesmo cliente)`,'Números diferentes para o mesmo cliente — pode ser outro código da mesma unidade (conta contrato / instalação). Confirmar antes de vistoriar.');
    else add('red','Número da UC',`SS: <b>${esc(S.uc)}</b> · Projeto: <b>${esc(P.uc)}</b>`,'UC diferente — confirmar o local da conexão antes de vistoriar.')}
  // cliente / localidade
  if(S.cliente&&P.cliente){const a=norm(S.cliente).split(' ').slice(0,2).join(' '),b=norm(P.cliente).split(' ').slice(0,2).join(' ');if(a!==b)add('yel','Cliente',`SS: ${esc(S.cliente)} · Projeto: ${esc(P.cliente)}`,'Confirmar titularidade.')}
  if(S.localidade&&P.localidade&&norm(S.localidade)!==norm(P.localidade)) add('yel','Município',`SS: ${esc(S.localidade)} · Projeto: ${esc(P.localidade)}`,'Confirmar local.');
  // medidor
  if(P.medStatus==='Ambíguo (existente e a instalar)') add('yel','Medidor',`Projeto diz "bidirecional a instalar" e "medidor existente". SS: ${esc(S.medidor||'—')} ${esc(S.medModelo||'')}`,'Verificar se o medidor instalado registra energia injetada ou se precisa ser substituído.');
  else if(P.medStatus==='Existente — 4 quadrantes') add('grn','Medidor',`Projeto indica medidor de 4 quadrantes (registra energia injetada). SS: ${esc(S.medidor||'—')} ${esc(S.medModelo||'')}`,'Confirmar em campo que o medidor instalado é o da SS.');
  else if(P.medStatus==='Bidirecional a instalar') add('yel','Medidor',`Projeto prevê medidor bidirecional novo. SS ainda indica ${esc(S.medidor||'—')} ${esc(S.medModelo||'')}`,'Conferir se a troca foi feita e anotar o novo nº.');
  // módulos
  const q=num(P.modQtd),w=num(P.modW),kd=num(P.kwpDecl);
  if(!isNaN(q)&&!isNaN(w)&&!isNaN(kd)){const calc=q*w/1000;Math.abs(calc-kd)/kd>0.005?add('red','Potência C.C.',`${q} × ${w} W = <b>${fmt(calc)} kWp</b>, mas o projeto declara <b>${fmt(kd)} kWp</b>`+(Math.abs(kd-num(P.invKw))<1?'. O valor declarado é igual à potência C.A. do inversor: o projeto chama de kWp a potência de saída.':''),'Contar módulos e conferir potência na etiqueta. A potência instalada real é a dos módulos.'):add('grn','Potência C.C.',`${q} × ${w} W = ${fmt(calc)} kWp (confere)`,'—')}
  const st=parseStrings(P.strings);
  if(st.n&&!isNaN(q)) st.tot!==q?add('red','Strings × módulos',`Strings somam <b>${st.tot}</b> módulos (${esc(P.strings)}); quantidade declarada <b>${q}</b>`,'Contar módulos por string em campo.'):add('grn','Strings × módulos',`${esc(P.strings)} = ${st.tot} módulos (confere)`,'—');
  // inversor x trafo / CC-CA
  const ik=num(P.invKw);
  if(!isNaN(ik)&&!isNaN(kva)&&ik>kva) add('red','Inversor × transformador',`Potência C.A. ${fmt(ik,1)} kW maior que o trafo de ${fmt(kva,1)} kVA`,'Geração não pode exceder a capacidade do trafo — verificar.');
  const kr=kwpReal(P);
  if(!isNaN(ik)&&!isNaN(kr)){const r=kr/ik;if(r>1.5)add('yel','Relação C.C./C.A.',`${fmt(kr)} kWp para ${fmt(ik,1)} kW → fator <b>${fmt(r)}</b>`,'Conferir potência máxima de entrada C.C. no datasheet/etiqueta do inversor.');
    add('gry','Enquadramento',`Potência C.A. ${fmt(ik,1)} kW → <b>${ik<=75?'microgeração (≤ 75 kW)':'minigeração (> 75 kW)'}</b>`,'Apenas registro.')}
  // placas
  if(!P.plEntrada||!P.plPoste) add('yel','Sinalização','Projeto não especifica todas as placas de advertência','Conferir placas no padrão de entrada, poste do trafo e QDG.');
  (c.manual||[]).forEach((m,i)=>A.push({...m,manual:i}));
  const ord={red:0,yel:1,gry:2,grn:3};return A.sort((a,b)=>ord[a.s]-ord[b.s]);
}
const LBL={red:['DIVERGÊNCIA','b-red'],yel:['CONFERIR','b-yel'],gry:['OBS.','b-gry'],grn:['OK','b-grn']};
function kwpReal(P){const q=num(P.modQtd),w=num(P.modW);return(!isNaN(q)&&!isNaN(w))?q*w/1000:num(P.kwpDecl)}

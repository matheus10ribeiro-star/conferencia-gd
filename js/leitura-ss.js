/* Leitura automática da Nota de Serviço (SS) — texto extraído pelo pdf.js no formato "Rótulo: | valor" */
function parseSS(t){
  const kv={},lines=t.split('\n');
  lines.forEach((ln,i)=>{
    const tk=ln.split(' | ');
    for(let j=0;j<tk.length;j++){
      let m=tk[j].match(/^(.+?):\s*(.*)$/);if(!m)continue;
      let k=norm(m[1]),v=m[2];
      if(!v&&j+1<tk.length&&!/:\s*$/.test(tk[j+1])&&!/^[^:]{1,25}:\s/.test(tk[j+1])){v=tk[j+1];j++}
      if(!(k in kv))kv[k]=v.trim();else kv[k+'#'+i]=v.trim();
    }
  });
  const g=k=>kv[k]||'';
  const r={};
  r.ss=(t.match(/SS:\s*\|?\s*(\d{6,})/)||[])[1];
  r.servico=g('SERVICO');r.prioridade=(t.match(/Prioridade:\s*\|?\s*([A-ZÇÃÉÍÓÚ]+)/i)||[])[1];
  r.data=(g('DATA SOLIC.').match(/\d{2}\/\d{2}\/\d{4}/)||t.match(/\d{2}\/\d{2}\/\d{4}/)||[])[0];
  r.cliente=g('CLIENTE');r.uc=g('UC');r.localidade=g('LOCALIDADE');r.observacao=g('OBSERVACAO');
  const ie=lines.findIndex(l=>/^Endere[çc]o:/.test(l));
  if(ie>=0){let e=g('ENDERECO');if(!e||/Telefone/i.test(e)){e=(lines[ie+1]||'').replace(/ \| /g,' ')}r.endereco=e}
  r.tipoLig=g('TIPO LIGACAO');r.atividade=g('ATIVIDADE');r.classe=g('CLASSE');r.subgrupo=g('SUBGRUPO');r.tarifa=g('EST. TARIFARIA');
  const pt=num(g('POT. TRAFO'));r.potTrafo=isNaN(pt)?'':String(+pt.toFixed(2));
  r.tensaoForn=g('TENSAO FORN.').replace(/\D/g,'');r.tensaoMed=g('TENSAO MED').replace(/\D/g,'');r.postoTrafo=g('POSTO TRAFO');
  r.medidor=g('MEDIDOR')||g('MED');r.cte=g('CTE.')||g('CTE KWH');
  r.medModelo=g('MODELO');
  const lc=lines.find(l=>/Ch\. afer/.test(l));
  if(lc){const m=lc.match(/Ch\. afer\.:\s*\|\s*([\d-]{5,})/);if(m)r.chAfer=m[1];
    const lm=lines[lines.indexOf(lc)+1]||'';const ms=lm.split(' | ').filter(x=>!/Modelo/.test(x));if(ms.length)r.chAferModelo=ms[0]}
  const tcl=lines.find(l=>/TC 1:/.test(l));
  if(tcl){r.tcSeries=[...tcl.matchAll(/TC \d:\s*\|\s*([\d-]{5,})/g)].map(m=>m[1]).join(' · ');r.tcRel=(tcl.match(/TCs:\s*\|?\s*([\d.,]+\s*\/\s*[\d.,]+)/)||[])[1]}
  const tpl=lines.find(l=>/TP 1:/.test(l));
  if(tpl){r.tpSeries=[...tpl.matchAll(/TP \d:\s*\|\s*([\d-]{5,})/g)].map(m=>m[1]).join(' · ');r.tpRel=(tpl.match(/TPs:\s*\|?\s*([\d.,]+\s*\/\s*[\d.,]+)/)||[])[1]}
  for(const k in r)if(r[k]&&/:$/.test(r[k]))r[k]='';
  return r;
}

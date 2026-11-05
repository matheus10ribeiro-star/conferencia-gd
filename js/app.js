/* Interface: lista de conexões, abas, arquivos, visualizador, OCR */
/* ---------- home ---------- */
function home(){$('home').classList.remove('hide');$('view').classList.add('hide');cur=null;FILES=[];renderLista()}
$('btnHome').onclick=()=>{if(cur)salvar();home()};
function renderLista(){
  const l=$('lista');
  if(!DB.length){l.innerHTML='<p class="hint">Nenhuma conexão ainda. Clique em <b>+ Nova conexão</b>.</p>';return}
  l.innerHTML=DB.slice().sort((a,b)=>(b.upd||0)-(a.upd||0)).map(c=>{
    const al=calcAlertas(c),r=al.filter(a=>a.s==='red').length,y=al.filter(a=>a.s==='yel').length;
    return `<div class="pcard" onclick="abrir('${c.id}')"><div class="t">SS ${esc(c.ss.ss||'(sem número)')}</div>
    <div>${esc(c.ss.cliente||'Cliente não identificado')}</div>
    <div class="m">${esc(c.ss.localidade||'')} · UC ${esc(c.ss.uc||'—')} · ${c.prj.kwpDecl?esc(c.prj.kwpDecl)+' kWp':''}</div>
    <div class="m" style="margin-top:8px">${r?`<span class="badge b-red">${r} divergência(s)</span> `:''}${y?`<span class="badge b-yel">${y} a conferir</span>`:''}${!r&&!y?'<span class="badge b-grn">sem alertas</span>':''}
    <span style="float:right">${new Date(c.upd||Date.now()).toLocaleDateString('pt-BR')}</span></div></div>`}).join('');
}
function novaConexao(){
  cur={id:'c'+Date.now(),ss:{},prj:{},auto:{ss:{},prj:{}},manual:[],arquivos:[],upd:Date.now()};
  DB.push(cur);persist();abrir(cur.id);
}
function abrir(id){
  cur=DB.find(c=>c.id===id);FILES=[];
  $('home').classList.add('hide');$('view').classList.remove('hide');
  buildForms();renderFiles();head();tab('arq');
}
function head(){$('vTitle').textContent='SS '+(cur.ss.ss||'nova conexão');$('vSub').textContent=(cur.ss.cliente||'')+(cur.ss.localidade?' · '+cur.ss.localidade:'')}
function salvar(msg){if(!cur)return;cur.upd=Date.now();persist();head();if(msg)toast('Conexão salva')}
function excluir(){if(!confirm('Excluir esta conexão?'))return;DB=DB.filter(c=>c.id!==cur.id);persist();home()}
function exportAll(){const b=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='conexoes_gd_backup.json';a.click()}
function importAll(inp){const f=inp.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);d.forEach(c=>{if(!DB.find(x=>x.id===c.id))DB.push(c)});persist();renderLista();toast('Backup importado')}catch(e){toast('Arquivo inválido')}})}

/* ---------- abas ---------- */
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.t));
function tab(t){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  ['arq','ss','prj','cruz','rep'].forEach(x=>$('tab-'+x).classList.toggle('hide',x!==t));
  if(t==='prj')fillViewerSel();
  if(t==='cruz')renderCruz();
  if(t==='rep')renderRep();
}

/* ---------- formulários ---------- */
function fieldHTML(grp,k,l,opt){
  const v=cur[grp][k]??'',a=cur.auto[grp][k]?' auto':'';
  if(opt==='area')return `<div class="f" style="grid-column:1/-1"><label>${l}</label><textarea rows="3" data-g="${grp}" data-k="${k}">${esc(v)}</textarea></div>`;
  if(Array.isArray(opt))return `<div class="f"><label>${l}</label><select data-g="${grp}" data-k="${k}" class="${a}">${opt.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></div>`;
  return `<div class="f"><label>${l}</label><input data-g="${grp}" data-k="${k}" class="${a}" value="${esc(v)}"></div>`;
}
function buildForms(){
  $('fSS').innerHTML=SSF.map(([k,l])=>fieldHTML('ss',k,l)).join('');
  $('fPRJ').innerHTML=PRJ.map(([g,fs])=>`<h3>${g}</h3><div class="fl">${fs.map(([k,l,o])=>fieldHTML('prj',k,l,o)).join('')}</div>`).join('');
  renderFaltam();
  document.querySelectorAll('[data-g]').forEach(el=>el.oninput=el.onchange=()=>{cur[el.dataset.g][el.dataset.k]=el.value;delete cur.auto[el.dataset.g][el.dataset.k];el.classList.remove('auto');salvar()});
}

function renderFaltam(){
  const el=$('faltam');if(!el)return;
  const fs=PRJ.flatMap(([g,l])=>l.map(x=>[g,x])).filter(([g,x])=>x[2]!=='area');
  const OPC=['invModelo2','disjGeral2','tpRel','gerador'];const fs2=fs.filter(([g,x])=>!OPC.includes(x[0]));const vaz=fs2.filter(([g,x])=>!cur.prj[x[0]]),tot=fs2.length;
  el.innerHTML=`<div style="background:${vaz.length?'#fef5e7':'#eafaf1'};border:1px solid ${vaz.length?'#f5cba7':'#abebc6'};border-radius:8px;padding:8px 10px;font-size:12px">
   <b>${tot-vaz.length} de ${tot} campos preenchidos.</b> ${vaz.length?'Não encontrados nos diagramas: '+vaz.map(([g,x])=>x[1]).join(', ')+'. Preencha olhando o desenho ou use o OCR.':''}</div>`;
}
/* ---------- arquivos ---------- */
const drop=$('drop');
['dragenter','dragover'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add('hov')}));
['dragleave','drop'].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove('hov')}));
drop.addEventListener('drop',ev=>addFiles(ev.dataTransfer.files));
$('fin').onchange=e=>{addFiles(e.target.files);e.target.value=''};
async function addFiles(list){list=Array.from(list);
  if(!window.pdfjsLib){toast('Sem internet: a leitura de PDF precisa da biblioteca pdf.js');}
  for(const f of list){
    const o={name:f.name,file:f,type:f.type.includes('pdf')||/\.pdf$/i.test(f.name)?'pdf':'img',kind:'Diagrama',text:'',st:'lendo…'};
    FILES.push(o);renderFiles();
    try{
      if(o.type==='pdf'&&window.pdfjsLib){
        o.pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
        o.text=await pdfText(o.pdf);
        if(/SS:\s*\|?\s*\d{6,}/.test(o.text)&&/(Medidor|UC:)/.test(o.text))o.kind='SS';
        o.st=o.text.replace(/\s/g,'').length>40?'texto lido':'desenho sem texto (usar OCR ou preencher)';
      }else{o.url=URL.createObjectURL(f);o.st='imagem (usar OCR ou preencher)'}
    }catch(e){o.st='erro ao ler: '+e.message}
    if(!cur.arquivos.find(a=>a.name===o.name))cur.arquivos.push({name:o.name,kind:o.kind});
    else o.kind=cur.arquivos.find(a=>a.name===o.name).kind||o.kind;
    processar(o);renderFiles();
  }
  salvar();
}
async function pdfText(pdf){
  let out=[];
  for(let p=1;p<=Math.min(pdf.numPages,30);p++){
    const pg=await pdf.getPage(p),tc=await pg.getTextContent();
    const its=tc.items.filter(i=>i.str.trim()).map(i=>({s:i.str.trim(),x:i.transform[4],y:i.transform[5]}));
    its.sort((a,b)=>b.y-a.y||a.x-b.x);const ls=[];
    for(const it of its){const l=ls.find(l=>Math.abs(l.y-it.y)<3);l?l.it.push(it):ls.push({y:it.y,it:[it]})}
    out.push(ls.map(l=>l.it.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' | ')).join('\n'));
  }
  return out.join('\n');
}
function renderFiles(){
  const all=cur.arquivos.map(a=>({...a,live:FILES.find(f=>f.name===a.name)}));
  $('ftab').innerHTML=all.length?all.map((a,i)=>`<tr><td>${esc(a.name)}</td>
   <td><select onchange="setKind('${esc(a.name)}',this.value)">${['SS','Diagrama','Memorial / outros'].map(k=>`<option ${k===a.kind?'selected':''}>${k}</option>`).join('')}</select></td>
   <td class="hint">${a.live?esc(a.live.st):'salvo anteriormente — carregue de novo para visualizar'}</td>
   <td><button onclick="remArq('${esc(a.name)}')">Remover</button></td></tr>`).join(''):'<tr><td colspan="4" class="hint">Nenhum arquivo carregado.</td></tr>';
}
function setKind(n,k){const a=cur.arquivos.find(x=>x.name===n);a.kind=k;const f=FILES.find(x=>x.name===n);if(f){f.kind=k;processar(f)}salvar();renderFiles()}
function remArq(n){cur.arquivos=cur.arquivos.filter(x=>x.name!==n);FILES=FILES.filter(x=>x.name!==n);salvar();renderFiles()}
function processar(o){
  if(!o.text)return;
  if(o.kind==='SS'){aplicar('ss',parseSS(o.text));head();reprocDiag()}
  else reprocDiag();
  buildForms();
}
function reprocDiag(){
  const txt=FILES.filter(f=>f.kind!=='SS').map(f=>(f.text||'')+'\n'+(f.ocr||'')).join('\n');
  if(txt.replace(/\s/g,'').length>40)aplicar('prj',parseProjeto(txt,cur.ss));
}
function aplicar(g,d){let n=0;for(const k in d){if(d[k]==null||d[k]==='')continue;if(!cur[g][k]||cur.auto[g][k]){cur[g][k]=d[k];cur.auto[g][k]=1;n++}}if(n)toast(n+' campo(s) preenchidos automaticamente')}

/* ---------- visualizador ---------- */
let V={f:null,page:1,scale:1,rot:0};
function fillViewerSel(){
  const s=$('vFile'),opts=FILES.filter(f=>f.kind!=='SS');
  s.innerHTML=opts.length?opts.map(f=>`<option>${esc(f.name)}</option>`).join('')+FILES.filter(f=>f.kind==='SS').map(f=>`<option>${esc(f.name)}</option>`).join(''):'<option value="">(carregue os diagramas na aba 1)</option>';
  s.onchange=()=>{V.f=FILES.find(f=>f.name===s.value);V.scale=0;V.rot=V.f&&V.f.rot||0;drawV()};
  if(opts.length&&(!V.f||!FILES.includes(V.f))){V.f=opts[0];V.scale=0;V.rot=0}
  if(V.f)s.value=V.f.name;drawV();
}
function vZoom(k){V.scale*=k;drawV()}
function vRot(){V.rot=(V.rot+90)%360;if(V.f)V.f.rot=V.rot;drawV()}
async function drawV(){
  const box=$('viewer');box.innerHTML='';if(!V.f)return;
  if(V.f.type==='pdf'&&V.f.pdf){
    const pg=await V.f.pdf.getPage(1);
    if(!V.scale){const vp0=pg.getViewport({scale:1,rotation:V.rot});V.scale=(box.clientWidth-20)/vp0.width}
    const vp=pg.getViewport({scale:V.scale,rotation:V.rot}),c=document.createElement('canvas'),dpr=window.devicePixelRatio||1;
    c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';box.appendChild(c);
    await pg.render({canvasContext:c.getContext('2d'),viewport:pg.getViewport({scale:V.scale*dpr,rotation:V.rot})}).promise;
    $('vInfo').textContent=Math.round(V.scale*100)+'% · '+V.f.pdf.numPages+' pág.';
  }else if(V.f.url){
    const im=new Image();im.src=V.f.url;await im.decode();
    if(!V.scale)V.scale=(box.clientWidth-20)/im.width;
    const c=document.createElement('canvas'),sw=V.rot%180?im.height:im.width,sh=V.rot%180?im.width:im.height;
    c.width=sw*V.scale;c.height=sh*V.scale;const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(V.rot*Math.PI/180);
    x.drawImage(im,-im.width*V.scale/2,-im.height*V.scale/2,im.width*V.scale,im.height*V.scale);box.appendChild(c);
    $('vInfo').textContent=Math.round(V.scale*100)+'%';
  }
}
/* ---------- OCR ---------- */
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('sem acesso à internet'));document.head.appendChild(s)})}
async function rodarOCR(){
  if(!V.f){toast('Selecione um diagrama');return}
  const b=$('btnOcr'),pr=$('ocrProg');b.disabled=true;pr.classList.remove('hide');
  try{
    if(!window.Tesseract){b.textContent='Carregando OCR…';await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js')}
    b.textContent='Lendo… (pode levar 1–2 min)';
    let c=document.createElement('canvas');
    if(V.f.type==='pdf'){const pg=await V.f.pdf.getPage(1),vp0=pg.getViewport({scale:1,rotation:V.rot}),s=Math.min(6,7000/Math.max(vp0.width,vp0.height));
      const vp=pg.getViewport({scale:s,rotation:V.rot});c.width=vp.width;c.height=vp.height;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:x,viewport:vp}).promise}
    else{const im=new Image();im.src=V.f.url;await im.decode();const sw=V.rot%180?im.height:im.width,sh=V.rot%180?im.width:im.height;c.width=sw;c.height=sh;const x=c.getContext('2d');x.translate(sw/2,sh/2);x.rotate(V.rot*Math.PI/180);x.drawImage(im,-im.width/2,-im.height/2)}
    const res=await Tesseract.recognize(c,'por',{logger:m=>{if(m.status==='recognizing text')pr.firstChild.style.width=Math.round(m.progress*100)+'%'}});
    V.f.ocr=res.data.text;const d=parseProjeto(res.data.text,cur.ss);reprocDiag();buildForms();salvar();
    toast(Object.keys(d).length?'OCR concluído — confira os campos em verde':'OCR não reconheceu dados. Gire o desenho para o texto ficar na horizontal e tente de novo');
  }catch(e){toast('OCR indisponível: '+e.message)}
  b.disabled=false;b.textContent='Ler por OCR';pr.classList.add('hide');
}

function renderCruz(){
  $('kpi').innerHTML=kpiHTML();
  const al=calcAlertas(cur);
  $('alTab').innerHTML=al.length?al.map(a=>`<tr><td><span class="badge ${LBL[a.s][1]}">${LBL[a.s][0]}</span></td><td><b>${esc(a.i)}</b></td><td>${a.manual!=null?esc(a.d):a.d}</td><td>${a.manual!=null?esc(a.a)+` <button style="float:right;padding:2px 8px" onclick="remManual(${a.manual})">×</button>`:a.a}</td></tr>`).join(''):'<tr><td colspan="4" class="hint">Preencha os dados da SS e do projeto para gerar o cruzamento.</td></tr>';
}
function addManual(){const it=$('mIt').value.trim();if(!it)return;cur.manual.push({s:$('mSt').value,i:it,d:$('mDoc').value,a:$('mAc').value});['mIt','mDoc','mAc'].forEach(x=>$(x).value='');salvar();renderCruz()}
function remManual(i){cur.manual.splice(i,1);salvar();renderCruz()}

load();home();
if(!window.pdfjsLib)toast('Sem conexão com a internet: a leitura automática de PDF ficará indisponível');

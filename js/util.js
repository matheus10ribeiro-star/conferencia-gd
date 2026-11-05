/* Utilitários, estado global e armazenamento local */
if(typeof window!=='undefined'&&window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const KEY='gdconf_conexoes_v1';
let DB=[], cur=null, FILES=[]; // FILES: {name,type,kind,file,text,pdf}
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2600)}
function load(){try{DB=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){DB=[]}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){toast('Não foi possível salvar neste navegador — use Exportar backup')}}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>{if(v==null||v==='')return NaN;let s=String(v).trim().replace(/[^\d.,-]/g,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');return parseFloat(s)};
const fmt=(v,d=2)=>isNaN(v)?'—':v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

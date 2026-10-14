/* ═══════════ GYM LOG · interfaz ═══════════
   Rutina en rutina.js · formato de datos y migración en datos.js */

const REST=90;

let S=nuevoEstado();
let dia=0;
let openEx=null, saveState="ok", bloqueado=false, toastT=null, sheet=null;
let timer={on:false,left:0,id:null};

const blank=n=>Array.from({length:n},()=>({w:"",r:"",d:false}));
const sk=(c,d)=>"c"+c+"d"+PLAN[d].k;
const fmt=n=>(Math.round(n*10)/10).toString().replace(/\.0$/,"");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hoy=()=>{const f=new Date();return f.getFullYear()+"-"+String(f.getMonth()+1).padStart(2,"0")+"-"+String(f.getDate()).padStart(2,"0");};
const MESES=["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const fechaCorta=f=>{const m=String(f||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?(+m[3])+" "+MESES[+m[2]-1]:"";};

/* ═══════════ PERSISTENCIA ═══════════ */
function load(){
  try{
    const r=cargar(localStorage);
    S=r.estado;
    if(r.origen==="v4") save();          /* primera vez: guarda el formato nuevo; el viejo queda intacto */
    saveState="ok";
  }catch(e){
    /* si algo no cierra, no se guarda nada: así no se pisa ningún dato */
    bloqueado=true; saveState="err"; console.error(e);
  }
}
function save(){
  if(bloqueado){saveState="err";return;}
  try{guardar(localStorage,S); saveState="ok";}
  catch(e){saveState="err";console.error(e);render();}
}
function sess(c,d){const k=sk(c,d); if(!S.sesiones[k])S.sesiones[k]=nuevaSesion(); return S.sesiones[k];}
function entry(c,d,ex){
  const s=sess(c,d);
  if(!s.ex[ex.id]) s.ex[ex.id]={variante:ex.id,series:blank(ex.s)};
  const e=s.ex[ex.id];
  /* si faltan series se agregan; nunca se borran las que ya hay */
  while(e.series.length<ex.s) e.series.push({w:"",r:"",d:false});
  return e;
}
const sets=(c,d,ex)=>entry(c,d,ex).series;
const varDe=(c,d,ex)=>{const s=S.sesiones[sk(c,d)];return (s&&s.ex[ex.id]&&s.ex[ex.id].variante)||ex.id;};

/* Datos del ejercicio según la variante hecha (nombre, tipo de peso, técnica) */
function info(ex,vid){
  if(!vid||vid===ex.id) return ex;
  const a=ALT[vid]||S.misEjercicios[vid];
  if(!a) return Object.assign({},ex,{n:ex.n+" (variante)"});
  return Object.assign({},ex,{n:a.n,eq:a.eq||ex.eq,v:a.v||a.n,t:a.t?1:0});
}

/* ═══════════ MÉTRICAS ═══════════ */
function sessionVolume(c,d){
  const s=S.sesiones[sk(c,d)]; if(!s) return 0;
  let v=0;
  PLAN[d].ex.forEach(ex=>{
    if(ex.t) return;                      /* los de tiempo no suman volumen */
    ((s.ex[ex.id]||{}).series||[]).forEach(x=>{
      const w=parseFloat(x.w)||0, r=parseInt(x.r)||0;
      v += w*r;
    });
  });
  return Math.round(v);
}
function cycleVolume(c){return [0,1,2].reduce((a,d)=>a+sessionVolume(c,d),0);}
function exTopWeight(c,d,ex,vid){
  const s=S.sesiones[sk(c,d)]; if(!s||!s.ex[ex.id]) return 0;
  if((s.ex[ex.id].variante||ex.id)!==vid) return 0;   /* otra variante: no se compara */
  return s.ex[ex.id].series.reduce((m,x)=>Math.max(m,parseFloat(x.w)||0),0);
}
function exHistory(ex){
  /* últimos 6 ciclos hasta el actual, de la variante que se está haciendo */
  const vid=varDe(S.ciclo,dia,ex), from=Math.max(1,S.ciclo-5), out=[];
  for(let c=from;c<=S.ciclo;c++) out.push({c, w:exTopWeight(c,dia,ex,vid)});
  return out;
}

/* ═══════════ SUGERENCIA (doble progresión) ═══════════ */
function suggest(ex,si){
  if(S.ciclo<2) return null;
  const prev=S.sesiones[sk(S.ciclo-1,dia)];
  if(!prev||!prev.ex[ex.id]) return null;
  if((prev.ex[ex.id].variante||ex.id)!==varDe(S.ciclo,dia,ex)) return null;
  const p=prev.ex[ex.id].series[si];
  if(!p||p.r===""||p.r==null) return null;
  const w=parseFloat(p.w)||0, r=parseInt(p.r)||0;
  const it=info(ex,varDe(S.ciclo,dia,ex));
  if(it.t){
    if(r>=ex.hi) return {t:"up",w:0,txt:"Llegaste a "+r+" s — mantenelo con buena forma"};
    return {t:"dn",w:0,txt:"Buscá llegar a "+ex.hi+" s"};
  }
  if(r>=ex.hi) return {t:"up",w:w+2.5,txt:"Subí a "+fmt(w+2.5)+" kg — llegaste al tope"};
  if(r>=ex.lo) return {t:"eq",w:w,txt:"Mantené "+fmt(w)+" kg — sumá reps"};
  return {t:"dn",w:w,txt:"Mantené "+fmt(w)+" kg — recuperá el rango"};
}
function exSuggest(ex){
  const all=[]; for(let i=0;i<ex.s;i++){const s=suggest(ex,i); if(s)all.push(s);}
  if(!all.length) return null;
  if(all.some(s=>s.t==="up")) return "up";
  if(all.every(s=>s.t==="dn")) return "dn";
  return "eq";
}

/* ═══════════ TIMER ═══════════ */
function startTimer(){
  clearInterval(timer.id); timer.on=true; timer.left=REST;
  timer.id=setInterval(()=>{
    timer.left--;
    if(timer.left===0&&navigator.vibrate) navigator.vibrate([180,90,180]);
    if(timer.left<=-30) stopTimer(); else paintTimer();
  },1000);
  render();
}
function stopTimer(){clearInterval(timer.id);timer.on=false;render();}
function addTimer(s){timer.left+=s;paintTimer();}
function paintTimer(){
  const el=document.getElementById("tclock"); if(!el)return;
  const neg=timer.left<0,v=Math.abs(timer.left);
  el.textContent=(neg?"+":"")+Math.floor(v/60)+":"+String(v%60).padStart(2,"0");
  el.className="tclock"+(neg?" over":" grad-txt");
}

/* ═══════════ ACCIONES ═══════════ */
const exOf=id=>PLAN[dia].ex.find(e=>e.id===id);
function setVal(exId,si,f,v){
  sets(S.ciclo,dia,exOf(exId))[si][f]=v; save(); render();
}
function stepW(id,i,d){
  const a=sets(S.ciclo,dia,exOf(id));
  a[i].w=fmt(Math.max(0,(parseFloat(a[i].w)||0)+d)); save(); render();
}
function stepR(id,i,d){
  const a=sets(S.ciclo,dia,exOf(id));
  a[i].r=Math.max(0,(parseInt(a[i].r)||0)+d); save(); render();
}
function toggleDone(id,si){
  const ex=exOf(id), a=sets(S.ciclo,dia,ex), it=info(ex,varDe(S.ciclo,dia,ex));
  const was=a[si].d; a[si].d=!was;
  if(!was){
    const s=sess(S.ciclo,dia);
    if(!s.fecha) s.fecha=hoy();          /* la fecha queda al marcar la primera serie */
    if(a[si].r==="") a[si].r=ex.lo;
    if(a[si].w===""&&it.eq!=="bw"&&!it.t){const sg=suggest(ex,si); if(sg)a[si].w=fmt(sg.w);}
  }
  save();
  if(!was) startTimer(); else render();
}
function copyDown(id){
  const a=sets(S.ciclo,dia,exOf(id));
  const w=a[0].w; a.forEach(x=>x.w=w); save(); render();
}
function markSession(){
  const s=sess(S.ciclo,dia); s.done=!s.done; save(); render();
  toast(s.done?"Sesión cerrada":"Sesión reabierta");
}
function cambiarCiclo(d){
  if(S.ciclo+d<1) return;
  S.ciclo+=d; openEx=null; save(); render();
}

/* ── exportar / restaurar ── */
const nombreArchivo=()=>"gymlog-"+hoy()+".txt";   /* .txt: Android solo deja compartir ciertos tipos */
function descargarArchivo(){
  try{
    const url=URL.createObjectURL(new Blob([texto(S)],{type:"text/plain"}));
    const a=document.createElement("a"); a.href=url; a.download=nombreArchivo();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    toast("Archivo guardado en Descargas");
  }catch(e){toast("No se pudo descargar",1);}
}
function compartirArchivo(){
  const f=new File([texto(S)],nombreArchivo(),{type:"text/plain"});
  if(navigator.canShare&&navigator.canShare({files:[f]})){
    navigator.share({files:[f],title:"Gym Log · mis datos"}).catch(()=>{});
  }else{descargarArchivo();}
}
function exportData(){
  const txt=texto(S);
  navigator.clipboard.writeText(txt)
    .then(()=>toast("Copiado — pegalo en una nota"))
    .catch(()=>{const t=document.getElementById("expbox"); if(t){t.value=txt;t.select();toast("Copialo a mano");}});
}
function restaurar(txt){
  let nuevo;
  try{nuevo=interpretar(txt);}catch(e){toast("Los datos no son válidos",1);return;}
  const n=Object.values(nuevo.sesiones).filter(s=>s.done).length;
  if(!confirm("Esto reemplaza los datos de este celu por los del archivo ("+n+" sesiones cerradas). ¿Seguimos?")) return;
  try{const prev=localStorage.getItem(KEY_V5); if(prev) localStorage.setItem(KEY_ANTES,prev);}catch(e){}   /* copia de lo que había, por las dudas */
  S=nuevo; bloqueado=false; save(); sheet=null; openEx=null; render(); toast("Datos restaurados");
}
function importData(){
  const t=document.getElementById("impbox");
  if(!t||!t.value.trim()){toast("Pegá los datos primero",1);return;}
  restaurar(t.value);
}
function importFile(inp){
  const f=inp.files&&inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{restaurar(r.result); inp.value="";};
  r.onerror=()=>toast("No se pudo leer el archivo",1);
  r.readAsText(f);
}
function toast(m,err){
  clearTimeout(toastT);
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}
  t.className="toast"+(err?" err":""); t.textContent=m;
  toastT=setTimeout(()=>t.remove(),2200);
}
function closeSheet(){
  if(sheet==="notes"){
    const n=document.getElementById("notesbox");
    if(n){sess(S.ciclo,dia).nota=n.value;save();}
  }
  sheet=null;render();
}

/* ═══════════ RENDER ═══════════ */
function ring(pct){
  const R=40,C=2*Math.PI*R,off=C*(1-pct/100);
  return `<svg width="92" height="92" viewBox="0 0 92 92">
    <circle cx="46" cy="46" r="${R}" fill="none" stroke="#1F1F26" stroke-width="7"/>
    <circle cx="46" cy="46" r="${R}" fill="none" stroke="url(#ember)" stroke-width="7"
      stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}"
      stroke-dashoffset="${off.toFixed(1)}"
      transform="rotate(-90 46 46)" style="transition:stroke-dashoffset .45s ease"/>
  </svg>`;
}

function render(){
  const day=PLAN[dia], s=sess(S.ciclo,dia);
  let total=0,filled=0;
  day.ex.forEach(ex=>{const a=sets(S.ciclo,dia,ex);total+=a.length;a.forEach(x=>{if(x.d)filled++;});});
  const pct=total?Math.round(filled/total*100):0;

  const volNow=sessionVolume(S.ciclo,dia);
  const volPrev=sessionVolume(S.ciclo-1,dia);
  const volDelta=volPrev>0?Math.round((volNow-volPrev)/volPrev*100):null;

  let h="";

  if(saveState==="err"){
    h+=bloqueado
      ?`<div class="banner">
        <div><b>No se pudieron leer tus datos</b><span>no se guarda nada para no pisarlos — no borres la app y avisale a Claude</span></div></div>`
      :`<div class="banner">
        <div><b>No se puede guardar</b><span>revisá modo incógnito o espacio del navegador</span></div>
        <button onclick="save();render()">Reintentar</button></div>`;
  }

  h+=`<header>
    <div class="hrow">
      <div class="logo grad-txt">GYM LOG</div>
      <div class="hright">
        <span class="status ${saveState==="err"?"err":""}">${saveState==="err"?"● SIN GUARDAR":"✓ GUARDADO"}</span>
        <button class="iconbtn" onclick="sheet='stats';render()">📊</button>
        <button class="iconbtn" onclick="sheet='menu';render()">⋯</button>
      </div>
    </div>
    <div class="cyclebar">
      <button class="iconbtn" onclick="cambiarCiclo(-1)">←</button>
      <div class="cyclenum"><b class="grad-txt">CICLO ${S.ciclo}</b><span>3 SESIONES POR CICLO</span></div>
      <button class="iconbtn" onclick="cambiarCiclo(1)">→</button>
    </div>
    <div class="tabs">`;
  PLAN.forEach((d,i)=>{
    const ds=S.sesiones[sk(S.ciclo,i)];
    const done=ds&&ds.done;
    const has=ds&&Object.values(ds.ex||{}).some(e=>(e.series||[]).some(x=>x.d));
    h+=`<button class="tab ${(dia===i?"sel ":"")+(done?"done":has?"has":"")}"
      onclick="dia=${i};openEx=null;render()">
      <div class="lbl">DÍA ${d.k}</div>
      <div class="st">${done?"✓":has?"•":"&nbsp;"}</div></button>`;
  });
  h+=`</div></header>`;

  /* day head + ring */
  h+=`<div class="dayhead">
    <div class="dayinfo">
      <h1>${day.name}</h1>
      <p>${esc(day.sub)}${s.fecha?" · "+fechaCorta(s.fecha):""}</p>
      ${s.done?`<span class="chip">✓ SESIÓN CERRADA</span>`:
        S.ciclo>1?`<span class="chip">SUGERENCIAS ACTIVAS</span>`:
        `<span class="chip grey">PRIMER CICLO · FIJANDO TU BASE</span>`}
    </div>
    <div class="ringwrap">${ring(pct)}
      <div class="ringtxt"><div class="ringpct grad-txt">${pct}%</div>
        <div class="ringsub">${filled}/${total} SERIES</div></div>
    </div>
  </div>`;

  /* volumen */
  h+=`<div class="vol">
    <div class="volcard">
      <div class="k">VOLUMEN DE HOY</div>
      <div class="v grad-txt">${volNow.toLocaleString("es-AR")}</div>
      <div class="d ${volDelta==null?"flat":volDelta>0?"up":volDelta<0?"dn":"flat"}">
        ${volDelta==null?"sin comparación aún":(volDelta>0?"▲ +":volDelta<0?"▼ ":"= ")+Math.abs(volDelta)+"% vs ciclo "+(S.ciclo-1)}
      </div>
    </div>
    <div class="volcard">
      <div class="k">VOLUMEN DEL CICLO</div>
      <div class="v">${cycleVolume(S.ciclo).toLocaleString("es-AR")}</div>
      <div class="d flat">kg × reps acumulados</div>
    </div>
  </div>`;

  /* ejercicios */
  h+=`<div class="list">`;
  day.ex.forEach(ex=>{
    const a=sets(S.ciclo,dia,ex);
    const vid=varDe(S.ciclo,dia,ex), it=info(ex,vid);
    const nd=a.filter(x=>x.d).length;
    const isOpen=openEx===ex.id;
    const eq=EQ[it.eq]||EQ.stack;
    const si=exSuggest(ex);
    const unit=it.t?"seg":"reps";
    const range=ex.lo===ex.hi?`${ex.s}×${ex.lo} ${unit}`:`${ex.s}×${ex.lo}–${ex.hi} ${unit}`;

    h+=`<div class="card ${(isOpen?"open ":"")+(nd>=a.length?"full ":nd>0?"touched ":"")}">
      <button class="chead" onclick="openEx=${isOpen?"null":"'"+ex.id+"'"};render()">
        <div style="flex:1;min-width:0">
          <div class="cname">${esc(it.n)}</div>
          ${vid!==ex.id?`<div class="swapnote">⇄ en lugar de ${esc(ex.n)}</div>`:""}
          <div class="cmeta">${range} · ${it.t?"PESO CORPORAL":eq.lbl}</div>
        </div>
        <div class="cright">
          ${nd>0?`<span class="cnt">${nd}/${a.length}</span>`:""}
          ${si&&nd===0?`<span class="sug-i ${si}">${si==="up"?"↑":si==="dn"?"↺":"="}</span>`:""}
          <span class="plus">${isOpen?"−":"+"}</span>
        </div>
      </button>`;

    if(isOpen){
      h+=`<div class="cbody">`;
      h+=`<div class="hint">↳ ${it.t?"Aguantá el tiempo objetivo con buena forma":eq.hint}</div>`;

      const s0=suggest(ex,0);
      h+=s0
        ?`<div class="sugbox ${s0.t}">${s0.t==="up"?"↑":s0.t==="dn"?"↺":"="} ${esc(s0.txt)}</div>`
        :`<div class="sugbox none">Sin datos del ciclo anterior — anotá tu referencia</div>`;

      /* historial */
      if(!it.t){
        const hist=exHistory(ex);
        const max=Math.max(...hist.map(x=>x.w),1);
        const withData=hist.filter(x=>x.w>0);
        if(withData.length>0){
          const first=withData[0].w, last=withData[withData.length-1].w;
          const dif=last-first;
          h+=`<div class="hist">
            <div class="histhead">
              <span class="t">HISTORIAL · PESO MÁXIMO</span>
              <span class="n ${dif>0?"up":dif<0?"dn":"flat"}">
                ${withData.length<2?"primer registro":(dif>0?"▲ +"+fmt(dif):dif<0?"▼ "+fmt(dif):"= sin cambio")+" kg"}</span>
            </div>
            <div class="bars">`;
          hist.forEach(x=>{
            const hp=x.w>0?Math.max(8,Math.round(x.w/max*100)):4;
            h+=`<div class="bcol ${x.c===S.ciclo?"now":""} ${x.w>0?"":"empty"}">
              <span class="bval">${x.w>0?fmt(x.w):"—"}</span>
              <div class="btrack"><div class="bfill" style="height:${hp}%"></div></div>
              <span class="blbl">C${x.c}</span>
            </div>`;
          });
          h+=`</div></div>`;
        }
      }

      h+=`<div class="colhead">
        <span class="c1">SET</span>
        <span class="c2">${it.t?"—":eq.lbl}</span>
        <span class="c3">${unit.toUpperCase()}</span>
        <span class="c4"></span></div>`;

      a.forEach((st,i)=>{
        const rv=parseInt(st.r)||0, low=rv>0&&rv<ex.lo;
        h+=`<div class="srow ${st.d?"done":""}">
          <span class="snum">${i+1}</span>
          <div class="field">`;
        h+= it.t
          ? `<span style="font-family:'DM Mono',monospace;font-size:13px;color:var(--faint)">—</span>`
          : `<button class="stepbtn" onclick="stepW('${ex.id}',${i},-2.5)">−</button>
             <input class="numin ${st.w!==""?"set":""}" inputmode="decimal" placeholder="0"
               value="${esc(st.w)}" onchange="setVal('${ex.id}',${i},'w',this.value)">
             <button class="stepbtn" onclick="stepW('${ex.id}',${i},2.5)">+</button>`;
        h+=`</div><div class="field">
            <button class="stepbtn" onclick="stepR('${ex.id}',${i},-1)">−</button>
            <input class="numin ${st.r!==""?"set":""} ${low?"low":""}" inputmode="numeric"
              placeholder="${ex.lo}" value="${esc(st.r)}"
              onchange="setVal('${ex.id}',${i},'r',this.value)">
            <button class="stepbtn" onclick="stepR('${ex.id}',${i},1)">+</button>
          </div>
          <button class="checkbtn ${st.d?"on":""}" onclick="toggleDone('${ex.id}',${i})">✓</button>
        </div>`;
      });

      h+=`<div class="rowtools">`;
      if(!it.t&&it.eq!=="bw") h+=`<button class="tool" onclick="copyDown('${ex.id}')">copiar peso a todas</button>`;
      h+=`<a class="tool link" target="_blank" rel="noopener"
        href="https://www.youtube.com/results?search_query=${encodeURIComponent(it.v)}">▶ ver técnica</a>`;
      h+=`</div></div>`;
    }
    h+=`</div>`;
  });
  h+=`</div>`;

  const nt=s.nota;
  h+=`<div style="padding:4px 12px 14px">
    <button class="sbtn" style="margin:0" onclick="sheet='notes';render()">
      ${nt?"📝 VER NOTA DE LA SESIÓN":"📝 AGREGAR NOTA"}</button></div>`;

  document.getElementById("app").innerHTML=h;

  /* capas fijas */
  let fx=document.getElementById("fixed");
  if(!fx){fx=document.createElement("div");fx.id="fixed";document.body.appendChild(fx);}
  let f="";

  if(timer.on){
    const neg=timer.left<0,v=Math.abs(timer.left);
    f+=`<div class="timer"><div class="timerin">
      <div><div class="tlabel">DESCANSO</div>
        <div id="tclock" class="tclock ${neg?"over":"grad-txt"}">${neg?"+":""}${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}</div></div>
      <div class="tbtns">
        <button class="tbtn" onclick="addTimer(30)">+30s</button>
        <button class="tbtn" onclick="stopTimer()">LISTO</button>
      </div></div></div>`;
  }

  f+=`<footer><div class="footin">
    <button class="bigbtn ${s.done?"done":""}" onclick="markSession()">
      ${s.done?"✓ SESIÓN CERRADA":"CERRAR SESIÓN"}</button>
    <div class="foothint ${saveState==="err"?"err":""}">
      ${saveState==="err"?"no se está guardando — exportá tus datos":"se guarda solo en este dispositivo"}</div>
  </div></footer>`;

  if(sheet==="menu"){
    f+=`<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
      <h2 class="grad-txt">OPCIONES</h2>
      <p>Tus datos viven en este navegador. Guardá una copia cada tanto (por ejemplo, mandátela por mail o a Drive) — es tu red de seguridad.</p>
      <button class="sbtn primary" onclick="compartirArchivo()">ENVIAR MIS DATOS (MAIL, DRIVE, WHATSAPP)</button>
      <button class="sbtn" onclick="descargarArchivo()">DESCARGAR ARCHIVO</button>
      <button class="sbtn" onclick="exportData()">COPIAR COMO TEXTO</button>
      <textarea id="expbox" placeholder="si el copiado falla, el texto aparece acá"></textarea>
      <div class="lbl">RESTAURAR</div>
      <label class="sbtn" style="display:block">ELEGIR ARCHIVO PARA RESTAURAR
        <input type="file" accept=".json,.txt,application/json,text/plain" style="display:none" onchange="importFile(this)"></label>
      <textarea id="impbox" placeholder='o pegá acá el texto: {"v":5,...} o {"cycle":1,"data":{...}}'></textarea>
      <button class="sbtn" onclick="importData()">RESTAURAR DESDE TEXTO</button>
      <button class="sbtn" onclick="closeSheet()">CERRAR</button>
    </div></div>`;
  }

  if(sheet==="stats"){
    const rows=[];
    for(let c=Math.max(1,S.ciclo-5);c<=S.ciclo;c++){
      const v=cycleVolume(c);
      const doneN=[0,1,2].filter(d=>S.sesiones[sk(c,d)]&&S.sesiones[sk(c,d)].done).length;
      rows.push({c,v,doneN});
    }
    const best=Math.max(...rows.map(r=>r.v),1);
    f+=`<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
      <h2 class="grad-txt">TU PROGRESO</h2>
      <p>Volumen = peso × repeticiones sumado. Sirve para comparar ciclos entre sí, no como kilos absolutos levantados.</p>
      <div class="bars" style="height:80px;margin-bottom:18px">`;
    rows.forEach(r=>{
      const hp=r.v>0?Math.max(6,Math.round(r.v/best*100)):3;
      f+=`<div class="bcol ${r.c===S.ciclo?"now":""} ${r.v>0?"":"empty"}">
        <span class="bval">${r.v>0?(r.v/1000).toFixed(1)+"k":"—"}</span>
        <div class="btrack"><div class="bfill" style="height:${hp}%"></div></div>
        <span class="blbl">C${r.c}</span></div>`;
    });
    f+=`</div>`;
    rows.slice().reverse().forEach(r=>{
      f+=`<div class="strow">
        <span class="stk">Ciclo ${r.c} · ${r.doneN}/3 sesiones cerradas</span>
        <span class="stv ${r.c===S.ciclo?"grad-txt":""}">${r.v.toLocaleString("es-AR")}</span>
      </div>`;
    });
    f+=`<button class="sbtn" style="margin-top:16px" onclick="closeSheet()">CERRAR</button>
    </div></div>`;
  }

  if(sheet==="notes"){
    f+=`<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
      <h2 class="grad-txt">NOTA · ${PLAN[dia].name} · CICLO ${S.ciclo}</h2>
      <p>Cómo te sentiste, molestias, cambios de máquina, lo que quieras recordar el próximo ciclo.</p>
      <textarea id="notesbox" class="notesin"
        placeholder="Ej: la barra del banco parecía más liviana que la del rack">${esc(nt||"")}</textarea>
      <button class="sbtn primary" style="margin-top:12px" onclick="closeSheet()">GUARDAR Y CERRAR</button>
    </div></div>`;
  }

  fx.innerHTML=f;
}

/* ═══════════ INIT ═══════════ */
load(); render();
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
window.addEventListener("beforeunload",save);
document.addEventListener("visibilitychange",()=>{if(document.hidden)save();});

/* ═══════════ DATOS · formato v5, migración y guardado ═══════════
   Formato v5 (clave "gymlog.v5"):
   {
     v:5, ciclo:7,
     sesiones:{
       "c6d1":{ done:true, fecha:"2026-10-14" | null, nota:"texto",
                ex:{ "a1":{ variante:"a1", series:[{w:"15",r:"12",d:true}] } } }
     },
     misEjercicios:{}, medidas:[], objetivos:{}
   }
   La clave vieja "gymlog.v3" (formato v4) NUNCA se borra ni se modifica: queda de respaldo. */

const KEY_V5="gymlog.v5";
const KEY_V3="gymlog.v3";
const KEY_ANTES="gymlog.v5.antes-de-restaurar";

/* Correcciones puntuales del historial de Agus, sacadas de sus propias notas.
   Solo se aplican si la nota de esa sesión lo confirma. */
const CORRECCIONES=[
 {ses:"c4d1",ex:"a2",variante:"a2.lowrow",nota:/low\s*row/i},
 {ses:"c5d1",ex:"a3",variante:"a3.legext",nota:/leg\s*exten/i}
];

function nuevoEstado(){return {v:5,ciclo:1,sesiones:{},misEjercicios:{},medidas:[],objetivos:{}};}
function nuevaSesion(){return {done:false,fecha:null,nota:"",ex:{}};}

const vacio=x=>x===""||x==null;
const serieConDatos=x=>!!x&&(!vacio(x.w)||!vacio(x.r)||x.d===true);
const tieneNota=t=>typeof t==="string"&&t.trim()!=="";

/* Una sesión vacía no tiene nada que valga la pena guardar */
function sesionVacia(s){
  if(!s) return true;
  if(s.done||s.fecha||tieneNota(s.nota)) return false;
  return !Object.entries(s.ex||{}).some(([id,e])=>
    (e.variante&&e.variante!==id)||(e.series||[]).some(serieConDatos));
}

/* Copia sin las sesiones vacías (las que crea la app al navegar ciclos) */
function compactar(st){
  const out=Object.assign({},st,{sesiones:{}});
  Object.entries(st.sesiones||{}).forEach(([k,s])=>{if(!sesionVacia(s)) out.sesiones[k]=s;});
  return out;
}

function normalizarV5(p){
  const st=Object.assign(nuevoEstado(),p,{v:5});
  st.ciclo=parseInt(st.ciclo)||1;
  const ses={};
  Object.entries(p.sesiones||{}).forEach(([k,s])=>{
    const n=Object.assign(nuevaSesion(),s,{ex:{}});
    n.done=!!n.done;
    Object.entries((s&&s.ex)||{}).forEach(([id,e])=>{
      n.ex[id]={variante:(e&&e.variante)||id,
        series:(e&&Array.isArray(e.series)?e.series:[]).map(x=>Object.assign({w:"",r:"",d:false},x))};
    });
    ses[k]=n;
  });
  st.sesiones=ses;
  if(!st.misEjercicios||typeof st.misEjercicios!=="object") st.misEjercicios={};
  if(!Array.isArray(st.medidas)) st.medidas=[];
  if(!st.objetivos||typeof st.objetivos!=="object") st.objetivos={};
  return st;
}

/* v3/v4 → v5. Copia cada serie tal cual (no convierte ni redondea nada). */
function migrarV4(p){
  const data=(p&&p.data)||{}, notes=(p&&p.notes)||{};
  const map={A:"1",B:"2",C:"3"};
  const viejo=k=>/^c\d+d[ABC]$/.test(k);
  const clave=k=>{const m=k.match(/^c(\d+)d([ABC])$/); return m?"c"+m[1]+"d"+map[m[2]]:k;};
  const st=nuevoEstado();
  st.ciclo=parseInt(p&&p.cycle)||1;

  /* primero las claves nuevas (1/2/3): si existen las dos, gana la nueva, como antes */
  Object.keys(data).sort((a,b)=>viejo(a)-viejo(b)).forEach(k=>{
    const nk=clave(k); if(st.sesiones[nk]) return;
    const s=data[k]||{}, ses=nuevaSesion();
    ses.done=!!s.done;
    Object.entries(s.ex||{}).forEach(([id,arr])=>{
      ses.ex[id]={variante:id,
        series:(Array.isArray(arr)?arr:[]).map(x=>Object.assign({w:"",r:"",d:false},x))};
    });
    st.sesiones[nk]=ses;
  });

  Object.keys(notes).sort((a,b)=>viejo(a)-viejo(b)).forEach(k=>{
    if(!tieneNota(notes[k])) return;
    const nk=clave(k);
    if(!st.sesiones[nk]) st.sesiones[nk]=nuevaSesion();
    if(!tieneNota(st.sesiones[nk].nota)) st.sesiones[nk].nota=notes[k];
  });

  CORRECCIONES.forEach(c=>{
    const s=st.sesiones[c.ses];
    if(s&&s.ex[c.ex]&&c.nota.test(s.nota||"")) s.ex[c.ex].variante=c.variante;
  });

  return compactar(st);
}

/* Huella de todo lo que importa, para comprobar que la migración no perdió nada */
function huellaV4(p){
  const data=(p&&p.data)||{}, notes=(p&&p.notes)||{}, out=[];
  const k2=k=>k.replace(/^c(\d+)d([ABC])$/,(_,c,d)=>"c"+c+"d"+({A:1,B:2,C:3})[d]);
  Object.entries(data).forEach(([k,s])=>{
    if(s&&s.done) out.push("done|"+k2(k));
    Object.entries((s&&s.ex)||{}).forEach(([id,arr])=>(arr||[]).forEach((x,i)=>{
      if(serieConDatos(x)) out.push(["serie",k2(k),id,i,String(x.w??""),String(x.r??""),!!x.d].join("|"));
    }));
  });
  Object.entries(notes).forEach(([k,t])=>{if(tieneNota(t)) out.push("nota|"+k2(k)+"|"+t);});
  return out.sort();
}
function huellaV5(st){
  const out=[];
  Object.entries(st.sesiones||{}).forEach(([k,s])=>{
    if(s.done) out.push("done|"+k);
    Object.entries(s.ex||{}).forEach(([id,e])=>(e.series||[]).forEach((x,i)=>{
      if(serieConDatos(x)) out.push(["serie",k,id,i,String(x.w??""),String(x.r??""),!!x.d].join("|"));
    }));
    if(tieneNota(s.nota)) out.push("nota|"+k+"|"+s.nota);
  });
  return out.sort();
}
function migracionCompleta(v4,v5){
  const a=huellaV4(v4), b=huellaV5(v5);
  return a.length===b.length&&a.every((x,i)=>x===b[i]);
}

/* Lee un texto exportado (formato viejo o nuevo) y devuelve el estado v5 */
function interpretar(txt){
  let p=JSON.parse(String(txt).trim());
  if(Array.isArray(p)&&p.length===1) p=p[0];
  if(p&&p.v===5&&p.sesiones) return normalizarV5(p);
  if(p&&p.data&&typeof p.data==="object"){
    const st=migrarV4(p);
    if(!migracionCompleta(p,st)) throw new Error("La migración no coincide");
    return st;
  }
  throw new Error("Formato desconocido");
}

/* Carga desde el almacenamiento. Si hay que migrar, lo hace y lo verifica. */
function cargar(ls){
  const r5=ls.getItem(KEY_V5);
  if(r5) return {estado:normalizarV5(JSON.parse(r5)),origen:"v5"};
  const r3=ls.getItem(KEY_V3);
  if(r3){
    const p=JSON.parse(r3), st=migrarV4(p);
    if(!migracionCompleta(p,st)) throw new Error("La migración no coincide");
    return {estado:st,origen:"v4"};
  }
  return {estado:nuevoEstado(),origen:"nuevo"};
}

function texto(st){return JSON.stringify(compactar(st));}

/* Guarda y comprueba que quedó escrito */
function guardar(ls,st){
  const t=texto(st);
  ls.setItem(KEY_V5,t);
  if(ls.getItem(KEY_V5)!==t) throw new Error("No se pudo verificar el guardado");
}

if(typeof module!=="undefined") module.exports={KEY_V5,KEY_V3,KEY_ANTES,nuevoEstado,nuevaSesion,
  sesionVacia,compactar,normalizarV5,migrarV4,huellaV4,huellaV5,migracionCompleta,interpretar,cargar,texto,guardar};

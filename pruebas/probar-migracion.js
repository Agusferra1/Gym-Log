/* Prueba la migración v4 → v5 con una exportación real.
   Uso:  node pruebas/probar-migracion.js ruta/a/exportacion.json
   (no subas exportaciones reales al repo: es público) */
const fs=require("fs");
const D=require("../datos.js");

const ruta=process.argv[2];
if(!ruta){console.error("Falta la ruta del archivo exportado");process.exit(1);}
const v4=JSON.parse(fs.readFileSync(ruta,"utf8"));
let ok=true;
const check=(cond,msg)=>{console.log((cond?"✓ ":"✗ ")+msg); if(!cond) ok=false;};

/* 1. migración directa */
const v5=D.migrarV4(v4);
check(D.migracionCompleta(v4,v5),"no se perdió ninguna serie, nota ni sesión cerrada ("+D.huellaV4(v4).length+" datos)");
check(v5.ciclo===(parseInt(v4.cycle)||1),"el ciclo actual se mantiene ("+v5.ciclo+")");
check(Object.values(v5.sesiones).every(s=>s.fecha===null),"las sesiones viejas quedan sin fecha");

/* 2. simulación del celu: localStorage con la clave vieja */
const mem={}; const ls={getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v);}};
mem[D.KEY_V3]=JSON.stringify(v4);
const antes=mem[D.KEY_V3];
const r=D.cargar(ls); D.guardar(ls,r.estado);
check(r.origen==="v4","al abrir detecta el formato viejo y migra");
check(mem[D.KEY_V3]===antes,"la clave vieja queda intacta");
check(D.migracionCompleta(v4,JSON.parse(mem[D.KEY_V5])),"lo guardado en la clave nueva está completo");
const r2=D.cargar(ls);
check(r2.origen==="v5"&&D.texto(r2.estado)===mem[D.KEY_V5],"al reabrir lee la clave nueva sin cambios");

/* 3. importar: formato viejo y nuevo */
check(D.migracionCompleta(v4,D.interpretar(JSON.stringify(v4))),"importar acepta el formato viejo (v4)");
check(D.texto(D.interpretar(mem[D.KEY_V5]))===mem[D.KEY_V5],"importar acepta el formato nuevo (v5)");
let tiro=false; try{D.interpretar("hola");}catch(e){tiro=true;}
check(tiro,"un texto inválido se rechaza sin tocar nada");

/* resumen */
const ses=Object.entries(v5.sesiones);
console.log("\nResumen: "+ses.length+" sesiones guardadas ("+ses.filter(([,s])=>s.done).length+" cerradas), "
  +(Object.keys(v4.data||{}).length-ses.length)+" vacías descartadas");
const cambios=[];
ses.forEach(([k,s])=>Object.entries(s.ex).forEach(([id,e])=>{if(e.variante!==id)cambios.push(k+" "+id+" → "+e.variante);}));
console.log("Variantes marcadas por las notas: "+(cambios.join(", ")||"ninguna"));
console.log("Tamaño: "+JSON.stringify(v4).length+" → "+mem[D.KEY_V5].length+" caracteres");
process.exit(ok?0:1);

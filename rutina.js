/* ═══════════ RUTINA · 3 días full body ═══════════
   Para sumar o cambiar ejercicios se edita este archivo, no la lógica.
   ⚠ Nunca renombres los IDs (a1…c7): el historial está atado a ellos.
   Campos: id, n (nombre), s (series), lo/hi (rango de reps o segundos),
   eq (tipo de peso: side | db | stack | bw), t:1 (por tiempo), v (búsqueda de técnica en YouTube) */
const PLAN=[
 {k:"1",name:"DÍA 1",sub:"Full body · énfasis empuje",
  ex:[
   {id:"a1",n:"Press banca con barra",s:3,lo:8,hi:10,eq:"side",v:"press banca con barra tecnica correcta"},
   {id:"a2",n:"Remo con mancuerna un brazo",s:3,lo:10,hi:12,eq:"db",v:"remo con mancuerna un brazo tecnica"},
   {id:"a3",n:"Sentadilla goblet",s:3,lo:10,hi:12,eq:"db",v:"sentadilla goblet tecnica"},
   {id:"a4",n:"Press militar mancuernas",s:3,lo:10,hi:12,eq:"db",v:"press militar con mancuernas sentado"},
   {id:"a5",n:"Extensión tríceps en polea",s:3,lo:12,hi:15,eq:"stack",v:"extension triceps polea cuerda"},
   {id:"a6",n:"Curl bíceps con barra",s:3,lo:10,hi:12,eq:"side",v:"curl de biceps con barra"},
   {id:"a7",n:"Plancha frontal",s:3,lo:45,hi:45,eq:"bw",t:1,v:"plancha frontal abdomen tecnica"}
  ]},
 {k:"2",name:"DÍA 2",sub:"Full body · énfasis tirón",
  ex:[
   {id:"b1",n:"Peso muerto rumano (RDL)",s:3,lo:10,hi:12,eq:"side",v:"peso muerto rumano RDL tecnica"},
   {id:"b2",n:"Jalón al pecho",s:3,lo:10,hi:12,eq:"stack",v:"jalon al pecho agarre ancho tecnica"},
   {id:"b3",n:"Press inclinado mancuernas",s:3,lo:10,hi:12,eq:"db",v:"press inclinado con mancuernas"},
   {id:"b4",n:"Prensa de piernas",s:3,lo:12,hi:15,eq:"side",v:"prensa de piernas 45 grados"},
   {id:"b5",n:"Elevaciones laterales",s:3,lo:12,hi:15,eq:"db",v:"elevaciones laterales con mancuernas"},
   {id:"b6",n:"Curl martillo",s:3,lo:10,hi:12,eq:"db",v:"curl martillo con mancuernas"},
   {id:"b7",n:"Elevación de piernas colgado",s:3,lo:10,hi:15,eq:"bw",v:"elevacion de piernas colgado"}
  ]},
 {k:"3",name:"DÍA 3",sub:"Full body · énfasis piernas",
  ex:[
   {id:"c1",n:"Sentadilla libre",s:3,lo:8,hi:10,eq:"side",v:"sentadilla libre con barra tecnica"},
   {id:"c2",n:"Remo en polea baja",s:3,lo:10,hi:12,eq:"stack",v:"remo en polea baja sentado"},
   {id:"c3",n:"Fondos en paralelas",s:3,lo:8,hi:12,eq:"bw",v:"fondos en paralelas dips tecnica"},
   {id:"c4",n:"Curl femoral acostado",s:3,lo:12,hi:15,eq:"stack",v:"curl femoral acostado maquina"},
   {id:"c5",n:"Face pull con cuerda",s:3,lo:15,hi:20,eq:"stack",v:"face pull con cuerda polea"},
   {id:"c6",n:"Curl concentrado",s:3,lo:10,hi:12,eq:"db",v:"curl concentrado con mancuerna"},
   {id:"c7",n:"Rueda abdominal",s:3,lo:10,hi:15,eq:"bw",v:"rueda abdominal ab wheel"}
  ]}
];

/* Variantes (alternativas) de cada ejercicio, mismo patrón de movimiento.
   ID = "{ejercicio original}.{nombre corto}" — nunca renombrar un ID ya usado: el historial está atado a él.
   Campos: of (a qué ejercicio de la rutina reemplaza), n, eq, v (búsqueda de técnica en YouTube).
   Opcionales: lo/hi/t (si el rango cambia, ej. core por reps en vez de tiempo),
   hint (texto de ayuda), inv:1 (el peso es asistencia: menos = más difícil). */
const ALT={};
function alt(of,key,n,eq,v,extra){ALT[of+"."+key]=Object.assign({of,n,eq,v},extra||{});}

/* DÍA 1 */
alt("a1","mancuernas","Press banca con mancuernas","db","press banca con mancuernas tecnica");
alt("a1","maquina","Press de pecho en máquina","stack","press de pecho en maquina sentado tecnica");
alt("a1","polea","Press de pecho en polea (de pie)","stack","press de pecho en polea de pie tecnica");
alt("a1","pecdeck","Peck deck (aperturas en máquina)","stack","peck deck aperturas en maquina pecho tecnica");
alt("a1","cruces","Cruces en polea","stack","cruces en polea pecho tecnica");
alt("a1","flexiones","Flexiones","bw","flexiones de brazos tecnica correcta");
alt("a2","barra","Remo con barra","side","remo con barra inclinado tecnica");
alt("a2","lowrow","Remo en máquina (Low Row)","stack","remo en maquina low row tecnica");
alt("a2","pechoapoyado","Remo con pecho apoyado","db","remo con pecho apoyado en banco inclinado mancuernas");
alt("a3","prensa","Prensa de piernas","side","prensa de piernas 45 grados tecnica");
alt("a3","smith","Sentadilla en Smith","side","sentadilla en maquina smith tecnica");
alt("a3","bulgara","Sentadilla búlgara","db","sentadilla bulgara con mancuernas tecnica");
alt("a3","legext","Extensión de piernas en máquina","stack","extension de piernas en maquina tecnica");
alt("a4","barra","Press militar con barra","side","press militar con barra de pie tecnica");
alt("a4","maquina","Press de hombros en máquina","stack","press de hombros en maquina tecnica");
alt("a5","otrapolea","Extensión tríceps en otra polea","stack","extension triceps polea cuerda",
  {hint:"Cada polea marca distinto: esta tiene su propio historial"});
alt("a5","frances","Press francés","side","press frances con barra z tecnica");
alt("a5","overhead","Extensión sobre la cabeza con mancuerna","db","extension de triceps sobre la cabeza con mancuerna");
alt("a5","diamante","Flexiones diamante (manos juntas)","bw","flexiones diamante triceps tecnica");
alt("a5","patada","Patada de tríceps con mancuerna","db","patada de triceps con mancuerna kickback tecnica");
alt("a5","fondosbanco","Fondos en banco","bw","fondos de triceps en banco tecnica");
alt("a6","z","Curl con barra Z","side","curl de biceps con barra z tecnica");
alt("a6","mancuernas","Curl con mancuernas","db","curl de biceps con mancuernas tecnica");
alt("a6","polea","Curl en polea","stack","curl de biceps en polea tecnica");

/* DÍA 2 */
alt("b1","mancuernas","Peso muerto rumano con mancuernas","db","peso muerto rumano con mancuernas tecnica");
alt("b1","convencional","Peso muerto convencional","side","peso muerto convencional tecnica");
alt("b1","hipthrust","Hip thrust","side","hip thrust con barra tecnica");
alt("b2","dominadas","Dominadas","bw","dominadas tecnica correcta");
alt("b2","asistidas","Dominadas asistidas en máquina","stack","dominadas asistidas en maquina tecnica",
  {inv:1,hint:"Anotá la asistencia que marca la máquina (menos = más difícil)"});
alt("b2","neutro","Jalón agarre neutro","stack","jalon al pecho agarre neutro tecnica");
alt("b3","barra","Press inclinado con barra","side","press inclinado con barra tecnica");
alt("b3","maquina","Press inclinado en Smith o máquina","stack","press inclinado en maquina smith tecnica");
alt("b4","hack","Sentadilla hack","side","sentadilla hack maquina tecnica");
alt("b4","smith","Sentadilla en Smith","side","sentadilla en maquina smith tecnica");
alt("b4","bulgara","Sentadilla búlgara","db","sentadilla bulgara con mancuernas tecnica");
alt("b5","polea","Elevaciones laterales en polea","stack","elevaciones laterales en polea tecnica");
alt("b5","maquina","Elevaciones laterales en máquina","stack","elevaciones laterales en maquina tecnica");
alt("b6","cuerda","Curl martillo en polea con cuerda","stack","curl martillo en polea con cuerda");
alt("b6","invertido","Curl invertido","side","curl invertido con barra tecnica");

/* DÍA 3 */
alt("c1","smith","Sentadilla en Smith","side","sentadilla en maquina smith tecnica");
alt("c1","hack","Sentadilla hack","side","sentadilla hack maquina tecnica");
alt("c1","prensa","Prensa de piernas","side","prensa de piernas 45 grados tecnica");
alt("c2","maquina","Remo en máquina","stack","remo en maquina sentado tecnica");
alt("c2","barra","Remo con barra","side","remo con barra inclinado tecnica");
alt("c2","pechoapoyado","Remo con pecho apoyado","db","remo con pecho apoyado en banco inclinado mancuernas");
alt("c3","asistidos","Fondos asistidos en máquina","stack","fondos asistidos en maquina tecnica",
  {inv:1,hint:"Anotá la asistencia que marca la máquina (menos = más difícil)"});
alt("c3","presscerrado","Press cerrado con barra","side","press de banca agarre cerrado tecnica");
alt("c3","banco","Fondos en banco","bw","fondos de triceps en banco tecnica");
alt("c4","sentado","Curl femoral sentado","stack","curl femoral sentado maquina tecnica",
  {hint:"Un estudio mostró más crecimiento de femorales sentado que acostado"});
alt("c4","depie","Curl femoral de pie","stack","curl femoral de pie maquina tecnica");
alt("c5","peckdeck","Peck deck inverso","stack","peck deck inverso deltoide posterior tecnica");
alt("c5","pajaros","Pájaros con mancuernas","db","pajaros con mancuernas deltoide posterior tecnica");
alt("c5","pajarospolea","Pájaros en polea","stack","pajaros en polea deltoide posterior tecnica");
alt("c6","scott","Curl en banco Scott","db","curl en banco scott tecnica");
alt("c6","polea","Curl en polea","stack","curl de biceps en polea tecnica");

/* CIERRE · CORE: las mismas opciones para a7, b7 y c7 */
[["a7"],["b7"],["c7"]].forEach(([of])=>{
  alt(of,"crunchpolea","Crunch en polea","stack","crunch en polea arrodillado tecnica",{lo:10,hi:15,t:0});
  alt(of,"deadbug","Dead bug","bw","dead bug ejercicio abdomen tecnica",{lo:10,hi:15,t:0});
  alt(of,"bicicleta","Crunch bicicleta","bw","crunch bicicleta abdomen tecnica",{lo:10,hi:15,t:0,hint:"Reps por lado"});
  alt(of,"paralelas","Elevación de piernas en paralelas","bw","elevacion de piernas en paralelas abdomen",{lo:10,hi:15,t:0});
  if(of!=="a7") alt(of,"plancha","Plancha frontal","bw","plancha frontal abdomen tecnica",{lo:45,hi:45,t:1});
  alt(of,"lateral","Plancha lateral","bw","plancha lateral abdomen tecnica",{lo:30,hi:45,t:1,hint:"Segundos por lado"});
});

const EQ={
 side :{lbl:"KG / LADO",  hint:"Anotá el peso de UN lado de la barra"},
 db   :{lbl:"KG / MANC.", hint:"Anotá el peso de UNA mancuerna"},
 stack:{lbl:"KG",         hint:"Anotá el peso que marca el stack"},
 bw   :{lbl:"KG EXTRA",   hint:"0 si es solo tu peso corporal"}
};

if(typeof module!=="undefined") module.exports={PLAN,ALT,EQ};

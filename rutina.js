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

/* Variantes (alternativas) de cada ejercicio.
   ID = "{ejercicio original}.{nombre corto}". Cada variante tiene su propio historial.
   "of" = a qué ejercicio de la rutina reemplaza. En la Fase 1 se suman las demás. */
const ALT={
 "a2.lowrow":{of:"a2",n:"Remo en máquina (Low Row)",eq:"stack",v:"remo en maquina low row tecnica"},
 "a3.legext":{of:"a3",n:"Extensión de piernas en máquina",eq:"stack",v:"extension de piernas en maquina tecnica"}
};

const EQ={
 side :{lbl:"KG / LADO",  hint:"Anotá el peso de UN lado de la barra"},
 db   :{lbl:"KG / MANC.", hint:"Anotá el peso de UNA mancuerna"},
 stack:{lbl:"KG",         hint:"Anotá el peso que marca el stack"},
 bw   :{lbl:"KG EXTRA",   hint:"0 si es solo tu peso corporal"}
};

if(typeof module!=="undefined") module.exports={PLAN,ALT,EQ};

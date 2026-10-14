# GYM LOG — Brief para Claude Code

## 0. Quién es el usuario y cómo trabajar con él

- **Agus** (Agustín), 25 años, Buenos Aires. **No es programador.** Usa la app todos los días en el gym desde el celular (Android, Chrome, instalada como app).
- Hablale en **español rioplatense**, claro y sin jerga técnica. Si tenés que usar un término técnico, explicalo en una línea.
- **Trabajá por fases.** Al terminar cada fase: subí los cambios, explicale en 3-5 líneas qué cambió y **cómo probarlo en el celu**, y esperá su OK antes de seguir con la siguiente.
- **Preguntá antes de** borrar archivos, cambiar el formato de los datos guardados, o tomar decisiones de diseño que no estén en este documento.
- No sobre-ingenierices. Es una app personal que va a crecer a un puñado de amigos, no un producto masivo.

---

## 1. Regla de oro: NO PERDER DATOS

Agus tiene **más de 2 meses de entrenamientos registrados** en el navegador de su celular. Perderlos sería el peor resultado posible.

1. **Antes de cualquier cambio en la estructura de datos**, pedile que exporte sus datos (menú `⋯` → "COPIAR MIS DATOS") y te pase ese texto. Usalo para **probar la migración con sus datos reales** antes de subir nada.
2. Todo cambio de formato va con **función de migración automática** que convierta el formato viejo al nuevo al abrir la app, sin intervención del usuario. Nunca borres la clave vieja hasta que la nueva se haya escrito bien.
3. El **importar** tiene que seguir aceptando exportaciones del formato actual (v4) además del nuevo.
4. **Nunca renombres los IDs de ejercicio existentes** (`a1`…`c7`). El historial está atado a esos IDs. Ejercicios nuevos o alternativas = IDs nuevos.

---

## 2. Estado actual de la app (v4) — verificalo leyendo el código

**Hosting:** GitHub Pages, repo `Agusferra1/Gym-Log`, rama `main`, carpeta raíz. Sin build: archivos estáticos.

**Archivos:**
- `index.html` — toda la app: HTML + CSS + JS inline (~700 líneas).
- `manifest.json` — PWA instalable.
- `sw.js` — service worker **cache-first**, cache llamado `gymlog-v4`.
- `icon-192.png`, `icon-512.png`
- `README.md` (no se usa)

**⚠️ Service worker:** como es cache-first, **cada vez que subas cambios tenés que subir el número de versión del cache en `sw.js`** (`gymlog-v4` → `gymlog-v5`, etc.). Si no, el celu sigue mostrando la versión vieja. Avisale a Agus que después de cada actualización cierre la app y la vuelva a abrir.

**Almacenamiento:** `localStorage`, clave `gymlog.v3` (sí, v3: se mantuvo a propósito). Formato:

```js
{
  cycle: 3,                         // ciclo actual seleccionado
  v: 4,
  data: {
    "c1d1": {                       // c{ciclo}d{día 1|2|3}
      done: true,                   // sesión cerrada
      ex: {
        "a1": [                     // ID de ejercicio → array de series
          { w: "40", r: 10, d: true }   // w: peso (string), r: reps (string o número), d: serie marcada
        ]
      }
    }
  },
  notes: { "c1d1": "texto libre" }
}
```

Ya existe una migración que convierte claves viejas `c1dA/B/C` → `c1d1/2/3`. Mantenela.

**No se guardan fechas.** Las sesiones están indexadas por ciclo, no por día del calendario. (Importante para la fase de objetivos semanales.)

**Lógica de sugerencia actual:** compara la serie N de un ejercicio con la serie N del mismo día en el ciclo anterior:
- reps ≥ tope del rango → "Subí 2,5 kg"
- reps dentro del rango → "Mantené el peso, sumá reps"
- reps debajo del rango → "Mantené, recuperá el rango"

Esto es **doble progresión** y está bien: no lo cambies.

**Convención de pesos (no cambiar):**

| Tipo (`eq`) | Qué se anota |
|---|---|
| `side` | Peso de **un lado** de la barra |
| `db` | Peso de **una** mancuerna |
| `stack` | Lo que marca el stack de la máquina |
| `bw` | Peso **extra** (0 = solo peso corporal) |

Ejercicios con `t: 1` son por tiempo (segundos) y no tienen peso.

**Otras funciones existentes:** anillo de progreso de la sesión, volumen (peso × reps) del día y del ciclo con % vs ciclo anterior, historial del peso máximo por ejercicio (últimos 6 ciclos), panel de progreso 📊, timer de descanso de 90 s con vibración, notas por sesión, exportar/importar, link a YouTube con la técnica de cada ejercicio.

---

## 3. La rutina actual (full body 3 días)

| ID | Ejercicio | Series × reps | eq |
|---|---|---|---|
| **DÍA 1** | | | |
| a1 | Press banca con barra | 3 × 8-10 | side |
| a2 | Remo con mancuerna un brazo | 3 × 10-12 | db |
| a3 | Sentadilla goblet | 3 × 10-12 | db |
| a4 | Press militar mancuernas | 3 × 10-12 | db |
| a5 | Extensión tríceps en polea | 3 × 12-15 | stack |
| a6 | Curl bíceps con barra | 3 × 10-12 | side |
| a7 | Plancha frontal | 3 × 45 s | bw (tiempo) |
| **DÍA 2** | | | |
| b1 | Peso muerto rumano (RDL) | 3 × 10-12 | side |
| b2 | Jalón al pecho | 3 × 10-12 | stack |
| b3 | Press inclinado mancuernas | 3 × 10-12 | db |
| b4 | Prensa de piernas | 3 × 12-15 | side |
| b5 | Elevaciones laterales | 3 × 12-15 | db |
| b6 | Curl martillo | 3 × 10-12 | db |
| b7 | Elevación de piernas colgado | 3 × 10-15 | bw |
| **DÍA 3** | | | |
| c1 | Sentadilla libre | 3 × 8-10 | side |
| c2 | Remo en polea baja | 3 × 10-12 | stack |
| c3 | Fondos en paralelas | 3 × 8-12 | bw |
| c4 | Curl femoral acostado | 3 × 12-15 | stack |
| c5 | Face pull con cuerda | 3 × 15-20 | stack |
| c6 | Curl concentrado | 3 × 10-12 | db |
| c7 | Rueda abdominal | 3 × 10-15 | bw |

**Decisiones ya tomadas (no reabrir sin que él lo pida):**
- 3 días por semana (nunca pudo sostener 5). Full body, no PPL: más frecuencia por músculo, mejor para definición.
- Sin cardio en la rutina de gym. Objetivo de 8.000-10.000 pasos diarios aparte.
- Objetivo físico: atlético y definido, tipo V-taper (referencia: Clive Rosfield de FFXVI). Prioridades: deltoide lateral, dorsal, bajar grasa de cintura.

---

## 4. Diseño (mantener)

- Fondo casi negro (`#08080A`), superficies `#111114` / `#18181D`.
- Acento: **gradiente "brasa"** `#FF9A3D → #FF5A2C → #D8202B` (135°).
- Tipografías: **Bebas Neue** (títulos), **DM Mono** (datos y etiquetas), **Inter** (texto).
- **Contraste mínimo 4,5:1 en todo texto.** En una versión anterior hubo texto gris casi invisible y fue la queja principal. El gris más tenue permitido es `#7C7A86` sobre el fondo.
- Mobile-first, uso con una mano, botones de al menos 36 px de alto.
- Podés dividir el código en varios archivos (`app.js`, `styles.css`, `data/rutina.js`…) si mejora el mantenimiento. **Sin frameworks ni build step**: tiene que seguir funcionando subiendo archivos a GitHub Pages tal cual.

---

## 5. Lo que hay que hacer — por fases

### FASE 0 · Diagnóstico y base (sin cambios visibles)

1. Leé todo el código y confirmá que coincide con la sección 2. Reportá diferencias.
2. Pedile a Agus su exportación de datos.
3. Proponé el **nuevo formato de datos (v5)** que soporte todo lo de las fases siguientes: variantes por ejercicio, fechas, perfiles, medidas corporales y objetivos. Mostráselo explicado en criollo antes de implementarlo.
4. Escribí la migración v4 → v5 y probala con sus datos reales (por ejemplo con Node + jsdom o Playwright).
5. Separá la definición de la rutina del código de la interfaz, para que sumar ejercicios o alternativas sea editar datos y no lógica.
6. A partir de acá, **registrá la fecha** de cada sesión (cuando se marca la primera serie). Las sesiones viejas quedan sin fecha: está bien, no inventes fechas.

### FASE 1 · Mejoras rápidas

**1.1 Alternativas de ejercicios**
- Cada ejercicio muestra un botón "Cambiar ejercicio" con 2-4 alternativas **del mismo patrón de movimiento**.
- La app guarda **qué variante se hizo en cada sesión**. La sugerencia de peso y el historial se calculan **por variante** (no comparar press banca con flexiones).
- Permitir agregar una alternativa propia escribiendo el nombre y eligiendo su tipo de peso.
- Alternativas sugeridas (revisalas, podés ajustarlas):

| Original | Alternativas |
|---|---|
| Press banca con barra | Press banca con mancuernas · Press en máquina · Flexiones |
| Remo mancuerna un brazo | Remo con barra · Remo en máquina · Remo pecho apoyado |
| Sentadilla goblet | Prensa · Sentadilla en Smith · Sentadilla búlgara |
| Press militar mancuernas | Press militar con barra · Press de hombros en máquina |
| Extensión tríceps polea | Press francés · Extensión sobre la cabeza con mancuerna · Fondos en banco |
| Curl bíceps con barra | Curl con barra Z · Curl con mancuernas · Curl en polea |
| Peso muerto rumano | RDL con mancuernas · Peso muerto convencional · Hip thrust |
| Jalón al pecho | Dominadas · Dominadas asistidas · Jalón agarre neutro |
| Press inclinado mancuernas | Press inclinado con barra · Press inclinado en Smith o máquina |
| Prensa de piernas | Sentadilla hack · Sentadilla en Smith · Sentadilla búlgara |
| Elevaciones laterales | Laterales en polea · Laterales en máquina |
| Curl martillo | Curl martillo en polea con cuerda · Curl invertido |
| Sentadilla libre | Sentadilla en Smith · Sentadilla hack · Prensa |
| Remo en polea baja | Remo en máquina · Remo con barra · Remo pecho apoyado |
| Fondos en paralelas | Fondos asistidos en máquina · Press cerrado con barra · Fondos en banco |
| Curl femoral acostado | Curl femoral sentado · Curl femoral de pie |
| Face pull | Pájaros con mancuernas · Peck deck inverso |
| Curl concentrado | Curl en banco Scott · Curl en polea |
| Plancha / Elevación de piernas / Rueda | Crunch en polea · Dead bug · Elevación de piernas en paralelas · Plancha con peso |

**1.2 Ver peso por serie del ciclo anterior**
- Botón opcional "Ver ciclo anterior" en cada ejercicio que muestre, al lado de cada serie actual, el peso y reps de **esa misma serie** en el ciclo anterior. Los datos ya existen.

**1.3 Renombrar los días y etiquetar patrones**
- Hoy dice "énfasis empuje" y el día tiene ejercicios de tirón, lo que confunde. En full body es correcto que cada día mezcle patrones; el problema es la etiqueta.
- Nombrá cada día por su **ejercicio principal**: "DÍA 1 · Press banca", "DÍA 2 · Peso muerto rumano", "DÍA 3 · Sentadilla". Subtítulo: "Full body".
- Cada ejercicio lleva una etiqueta chica de patrón: **Empuje / Tirón / Pierna / Core**.

**1.4 Bloque de core al final**
- Los ejercicios de core (a7, b7, c7) pasan a un bloque visual separado al final: "CIERRE · CORE". **No opcional**: cuenta para el progreso de la sesión.
- Texto corto en el bloque explicando por qué: no queman grasa de la panza (eso lo hace la dieta), pero desarrollan el recto abdominal, y un abdomen más desarrollado se marca con más porcentaje de grasa. Agus tiende a saltearlos.

**1.5 Frase del día**
- Una frase motivadora por sesión, rotando.
- Solo **frases originales** escritas por vos o de **autores clásicos de dominio público** (Séneca, Marco Aurelio, Epicteto, etc.). Nada de citas de libros, películas o personas actuales.
- Tono: directo, sobre constancia y disciplina, sin cursilería.

**1.6 Descanso diferenciado (confirmar con Agus)**
- Se le recomendó 2-3 min de descanso en el compuesto principal de cada día y 90 s en el resto. Preguntale si lo quiere antes de implementarlo.

### FASE 2 · Estadísticas, objetivos y medidas

**2.1 Vista general**
- Evolución desde el primer ciclo: volumen por ciclo, sesiones completadas.
- Ranking de ejercicios: **los que más progresaron y los estancados**. Para comparar series con distinta cantidad de reps usá 1RM estimado (fórmula de Epley: `peso × (1 + reps/30)`).
- **Ejercicios que casi no hace** (cuántas veces se salteó o se dejó vacío cada uno).
- Aclaración visible: el volumen es para comparar ciclos entre sí, no son kilos reales levantados (por la convención "por lado" / "una mancuerna").

**2.2 Objetivos y casillas**
- Objetivos semanales tildables, por ejemplo: "Fui 3 veces esta semana", "Hice el cierre de core", "Subí reps o peso en al menos un ejercicio". Se calculan solos con las fechas registradas desde la Fase 0.
- Racha de semanas cumplidas.

**2.3 Medidas corporales**
- Registro fechado de: peso, % grasa, % músculo y grasa visceral (de su balanza de bioimpedancia), cintura a la altura del ombligo, contorno de hombros, muñeca, tobillo (opcional), envergadura y altura.
- Calculados automáticos:
  - **Hombro / cintura** (la métrica del V-taper; referencia estética habitual ≈ 1,6). Es la métrica principal para su objetivo: mostrar su evolución en un gráfico.
  - **Estructura ósea** = altura ÷ muñeca (hombres: >10,4 pequeña · 9,6-10,4 media · <9,6 grande).
  - Cintura / altura.
- Datos actuales de referencia de Agus (pre-cargalos solo si él confirma): altura 180 cm, muñeca 18 cm, envergadura 170 cm, hombros 123 cm, cintura 101 cm, peso 85,4 kg y 24,4 % grasa (21/08/2026).
- Aclaración visible: la balanza de bioimpedancia varía bastante día a día. Recomendar medirse siempre igual (en ayunas, misma hora) y mirar la **tendencia**, no el número suelto.

### FASE 3 · Perfiles para amigos

**Contexto importante:** los datos viven en el navegador de cada celular. Si un amigo abre el link en **su** teléfono, ya tiene sus propios datos y no toca los de Agus. Esto ya funciona hoy.

Lo que hay que agregar:
- **Varios perfiles en un mismo dispositivo**: selector de perfil, cada uno con sus datos, medidas, objetivos y notas. Los datos actuales de Agus se migran a un perfil "Agus".
- Exportar / importar **por perfil**.
- Cada perfil arranca con la misma rutina base; las alternativas elegidas son por perfil.

**Fuera de alcance salvo que Agus lo pida explícitamente:** cuentas con login, sincronización en la nube, ver el progreso de otros. Si lo pide, primero explicale los costos (servidor, privacidad de los datos de sus amigos, mantenimiento) y las opciones, antes de escribir código.

---

## 6. Checklist antes de cada entrega

- [ ] Probado con los datos reales exportados de Agus (si la fase toca datos).
- [ ] La migración no pierde ninguna serie, nota ni ciclo.
- [ ] Exportar → importar funciona con el formato nuevo **y** con el v4.
- [ ] Versión del cache en `sw.js` actualizada.
- [ ] Contraste de texto ≥ 4,5:1 y se ve bien a 360 px de ancho.
- [ ] Mensaje a Agus: qué cambió, cómo probarlo, y recordatorio de cerrar y reabrir la app.

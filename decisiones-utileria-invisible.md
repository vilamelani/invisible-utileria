# INVISIBLE: decisiones de utilería digital

Versión 0.5, 2026-11-10. App del teléfono v2 con correcciones de la primera prueba en iPhone (15 Pro).

**Convenciones**
- `[DECIDIDO]`: lo cerraste vos.
- `[PROPUESTA]`: lo propongo yo, falta tu OK.
- `[INVENTADO]`: texto, nombre o comportamiento que no está en el guion ni en tus indicaciones; decidís vos.
- `[ABIERTA]`: pregunta pendiente (lista completa en la sección 9).

---

## 1. Fuentes y reglas de texto

- `[DECIDIDO]` El **guion** es la fuente de verdad. El doc de utilería es una referencia con aclaraciones. El guion técnico (desglose de planos) define encuadre y qué se ve en cada plano.
- `[DECIDIDO]` La numeración de escenas válida es la del guion literario y técnico. Los títulos "ESC 4–7" que aparecen en el desglose están mal numerados y se ignoran.
- `[DECIDIDO]` Los textos en pantalla se copian **literal del guion** (acentos, puntuación y emojis incluidos). Donde el desglose o el doc difieren, gana el guion y queda anotado en la sección 8 bis.
- `[DECIDIDO]` El número del remitente es **+54 9 11 1103-1976**.

## 2. Dispositivos

- `[DECIDIDO]` Celular: **iPhone 14** (tiene notch, no Dynamic Island). Por ahora no se usa Android.
- `[DECIDIDO]` Laptop: **MacBook Air M1** (supuesto, a confirmar). Pantalla 13,3" de 2560×1600, sin notch; en Safari a pantalla completa el viewport es de 1440×900 puntos. Si termina siendo una M2 (con notch), la barra de menú se adapta.
- Consecuencias de usar solo iPhone:
  - No hay vibración web. Todo lo que "vibre" o suene va en post, o se resuelve con truco de utilería (ver pregunta 2).
  - La barra de estado toma el color de cada pantalla.

## 3. Arquitectura y controles de rodaje

- `[PROPUESTA]` Dos web apps estáticas, sin backend, offline (PWA), publicadas en GitHub Pages:
  1. **Teléfono (iPhone):** un solo "teléfono" con todas las apps adentro (pantalla de bloqueo, inicio, Bristagram, Eco, TalkGram, llamada entrante). Así el estado (chat, contacto agendado, hora) se mantiene entre planos aunque el actor cambie de app.
  2. **Mac:** escritorio macOS completo a pantalla completa (barra de menú, dock, ventanas).
- `[DECIDIDO]` macOS completo en la laptop, no solo el navegador.
- `[PROPUESTA]` Sin logos reales: en vez de la manzana de la barra de menú va un símbolo neutro propio. Los íconos del dock son propios.
- `[DECIDIDO]` Controles heredados de GUITA, en las dos apps:
  - Toque invisible para avanzar estados.
  - Temporizadores para eventos automáticos.
  - Menú oculto en la esquina superior izquierda para: cargar fotos y videos desde la galería; editar textos; ajustar hora y batería; reiniciar y fijar un estado exacto por continuidad.
- `[DECIDIDO]` Hora y batería: reales por defecto y modificables. No hay un valor fijo para la noche del corto; se define en el set.
- `[DECIDIDO]` El **sonido y la vibración van siempre en post**. La música de la Mac solo se ve.

## 4. Apps, nombres y diseño

| App | Nombre en pantalla | Estado |
|---|---|---|
| Red social tipo Instagram | **Bristagram** | Viene del doc de utilería. El guion dice "Instagram", pero en pantalla no va marca real. |
| Chat tipo WhatsApp | **TalkGram** | `[DECIDIDO]` |
| Chat de IA tipo ChatGPT (celular) y página de IA (Mac, incógnito) | **Eco** | `[DECIDIDO]` provisorio. `[PROPUESTA]` misma marca en celular y Mac, para sostener que es la misma IA. |

- `[DECIDIDO]` Arte no tiene propuesta de paleta: el diseño (paleta, logos, íconos, tipografía) lo propongo yo. Respeta la lógica de uso de cada tipo de app sin copiar la original; colores y detalles varían.
- `[DECIDIDO]` Dirección visual del iPhone: **B · Clara** (modo claro, lo más cercano a un iPhone de fábrica), sobre la grilla real de iOS (barra de estado 47 pt, íconos de 60 pt, texto de 17 pt).
  - TalkGram: fondo `#E7EDF0`, burbuja propia `#CDEFF2`, ajena `#FFFFFF`, acento turquesa `#0B7F8C`.
  - Eco: fondo blanco, acento violeta `#6D4AFF`.
  - Bristagram: anillo azul cobalto a turquesa.
  - Inicio: fondo de pantalla atardecer, widgets de clima y de fotos ("Hace un año"), íconos de colores.
  - Íconos propios (no se pueden usar los de Apple). Tipografía del sistema (SF) en el dispositivo.

## 5. iPhone: comportamiento

### Pantalla de bloqueo e inicio
- `[DECIDIDO]` Celular en el piso (1.C planos 1 y 5): pantalla de bloqueo. Los banners de notificación de TalkGram entran por temporizador o toque invisible. Al levantar el celular, Martina toca el banner y se abre el chat.
- `[INVENTADO]` Wallpaper de la pantalla de bloqueo e inicio, y apps de la home: te los propongo en la dirección visual.

### TalkGram
- `[DECIDIDO]` El chat corre **completo** durante el set.
- `[DECIDIDO]` Dos modos para los mensajes de Martina, seleccionables desde el menú oculto:
  - **Libre:** el actor escribe lo que quiera y envía.
  - **Completar:** el actor toca teclas cualquiera y aparece el texto guionado; con el envío se manda el mensaje del guion.
- `[DECIDIDO]` Teclado real de iOS. **No verificable acá:** cómo se comporta en una PWA en el iPhone 14 (por ejemplo, la barra de autocorrección y el desplazamiento al abrir el teclado). Hay que probarlo en el dispositivo.
- `[DECIDIDO]` Los mensajes de Julián entran por toque invisible o por temporizador, configurable por mensaje.
- Estados que hay que cubrir:
  - Burbujas de texto, foto y **audio** (con forma de onda y botón de reproducir). `[DECIDIDO]` La burbuja de audio existe solo en TalkGram.
  - Indicador "escribiendo…" que **aparece y desaparece dos veces** (1.E plano 8).
  - Grabación de nota de voz de Martina, incluida una **interrumpida** (1.F plano 4: "A mi también me encan…").
  - Flujo de **agendar contacto**: hasta ahí el encabezado muestra el número y después "Julián" (1.E plano 8).
  - `[INVENTADO]` Aviso de "número que no está en tus contactos" arriba del chat de un desconocido, para que sea creíble. Se puede sacar.
  - La foto de perfil del número es la **misma** que la de Julián en Bristagram (1.C plano 7).

### Eco (celular)
- `[DECIDIDO]` Las respuestas de la IA se ven como texto en pantalla. La voz se agrega en post.
- `[DECIDIDO]` Los audios de Martina en Eco se ven **solo como transcripción** (burbuja de texto con la leyenda "Mensaje de voz"). Sin burbuja de audio.

### Llamada entrante
- `[DECIDIDO]` Pantalla completa, porque va a haber un plano detalle del celular. Botones de aceptar y rechazar; rechazar corta la llamada (1.G 10) y un toque invisible o un temporizador la vuelve a disparar (1.G 11, ESC 2).
- ESC 2: no está definido si el celular suena en la mano de Martina o en el cuarto. La app cubre los dos casos sin cambios.

## 6. Mac: comportamiento

- Escritorio con fondo de pantalla y ventana de reproductor de música "sonando": barra de progreso que avanza, título de canción y artista `[INVENTADO]`. Martina lo pausa ("apaga la música") con un clic real o toque invisible.
- Notificación de mail nuevo (banner estilo macOS) → app de correo con un mail de Julián y un video adjunto → al abrirlo, ventana de reproductor con carga que tarda → reproduce el video cargado desde el menú oculto.
  - Mail de Julián (asunto, remitente, cuerpo): `[INVENTADO]`, el doc dice "inventar mail". Te lo propongo cuando construya.
- **1.G 6 (cerrar la tapa):** `[DECIDIDO]` la idea es cerrarla del todo; si el bloqueo de pantalla lo impide, se falsea bajando un poco la pantalla.
  - Para cerrar del todo, propongo desactivar en la Mac de rodaje la contraseña al despertar (Ajustes del Sistema → Pantalla bloqueada). La app guarda su estado, así que al abrir la tapa vuelve exactamente a donde estaba.
  - **No verificable acá:** si Safari mantiene la pantalla completa después de dormir. Hay que probarlo en la MacBook.
- **1.G 8 (plano desde la webcam):** `[DECIDIDO]` se filma con la webcam real de la Mac. No es pantalla de la app: se graba con una app del sistema (por ejemplo QuickTime o Photo Booth).
  - `[PROPUESTA]` Grabar también con la webcam real el video de Martina durmiendo (1.G 4), para que la imagen sea coherente.
  - Detalle de continuidad: mientras graba, se prende la luz verde de la webcam.
- **ESC 3:** ventana de navegador en incógnito con la página de Eco y las líneas del guion en orden.
  - `[PROPUESTA]` Para "la pantalla se mueve sola": un **cursor falso** animado, con el cursor real oculto durante esa secuencia.
  - Líneas del guion (literal): "Enviando a Martina" / "Cruzando historial de ubicación…" / "No sos horrible." / "No sos invisible."
  - El doc de utilería agrega 3 líneas que no están en el guion: "Replicando interacciones afectivas…", "Cargando datos visuales de Martina…", "Procesando métricas biométricas…". Quedan como opcionales y **apagadas** hasta que decidas.

## 7. Episodio 1: pantallas por plano

Resolución: **APP** = pantalla real en cámara. **POST** = sobreimpresión en postproducción. **REF** = pantalla de refilón o solo luz, según encuadre (a confirmar con Fotografía). **—** = no hay pantalla.

| Plano | Qué se ve | Resolución | Quién |
|---|---|---|---|
| 1.A / 1 | Lámpara de lava | — | — |
| 1.A / 2 | Mac: escritorio con fondo de pantalla y reproductor "sonando" | APP Mac (pasiva) | Nadie |
| 1.B / 3 | Bristagram: historias de Julián, fiesta de Halloween, Julián junto a Agustina | APP iPhone | Martina |
| 1.B / 4 | Eco: Martina graba y manda audio de voz; la IA responde en texto | APP iPhone | Martina + equipo |
| 1.B (sin plano en el desglose) | Mac: Martina apaga la música | APP Mac | Martina |
| 1.C / 1 | Celular en el piso rodeado de flores, pantalla de bloqueo encendida | APP iPhone | — |
| 1.C / 4–5 | Notificaciones; banners "Hola, estas?" y "estas bien?" en la pantalla de bloqueo; Martina levanta el celular | APP iPhone | Equipo + Martina |
| 1.C / 6 | Martina escribe | REF | Martina |
| 1.C / 7 | "¿Quién sos?" → "Julián."; foto de perfil = Bristagram | APP | Martina + equipo |
| 1.C / 9 | "Vi que te fuiste…", "¿Agustina?…", "¿Cómo que no?…" | APP | Martina + equipo |
| 1.C / 11 | Foto de la corona + "Te la olvidaste" | APP | Equipo |
| 1.D | Celular sobre el escritorio | — | — |
| 1.E / 1–4 | Audios de Martina, notificación, respuestas de Julián | POST (sobreimpresión de los mensajes). La app corre igual para que la actriz reaccione. | Martina + equipo |
| 1.E / 5 | "Compite con el del año pasado" + foto de Martina de Emily | APP (encabezado = número, sin agendar) | Equipo |
| 1.E / 6–7 | Martina reacciona y lee en voz alta | REF | Martina |
| 1.E / 8 | "Escribiendo…" (escribe y borra x2), agendar contacto, respuesta | APP | Martina + equipo |
| 1.F / 1–4 | Sobreimpresiones, audio de Julián con la canción, selfie, audio interrumpido | POST + REF | Martina + equipo |
| 1.F / 6 | "De la lámpara :) . La compraste el lunes ¿no?" / "Lo dijiste en clase" | APP | Equipo |
| 1.F / 9 | Notificación + "Sii! me pasa con vos :)" | APP | Equipo |
| 1.G / 2 | Mac: notificación de mail, mail de Julián con video, el video tarda en cargar | APP Mac | Martina |
| 1.G / 4 | Mac: video de Martina durmiendo (grabado con la webcam real) | APP Mac | Equipo |
| 1.G / 6 (celular) | "Hasta durmiendo sos hermosa <3" | APP iPhone | Equipo |
| 1.G / 6 (segundo "6") | Martina cierra la tapa (o baja la pantalla) | APP Mac (estado persistente) | Martina |
| 1.G / 8 | Plano desde la webcam real, post-it sobre la cámara | No es app (QuickTime/Photo Booth) | — |
| 1.G / 9–11 | Llamada entrante de Julián a pantalla completa; Martina corta; la llamada vuelve a entrar | APP iPhone | Equipo + Martina |
| 2 / 3 y 5 | El celular sigue sonando con la llamada de Julián | APP iPhone | Equipo |
| 3 / 1 | Habitación con la Mac de fondo | APP Mac (pasiva) | — |
| 3 / 2 | Mac: cursor se mueve solo, incógnito con Eco y las 4 líneas | APP Mac | Equipo |

## 8. Chat literal (tomado del guion)

La columna Tipo viene del desglose y no del guion. `?` = el desglose no lo aclara.

### TalkGram (número +54 9 11 1103-1976 → "Julián" a partir de 1.E plano 8)

| # | Quién | Tipo | Texto |
|---|---|---|---|
| 1 | Número | texto | Hola, estas? |
| 2 | Número | texto | estas bien? |
| 3 | Martina | texto | ¿Quién sos? |
| 4 | Número | texto | Julián. |
| 5 | Número | texto | Vi que te fuiste y le pedí el número a tu amiga. |
| 6 | Martina | texto | ¿Agustina? Pensé que estabas con ella. Como no nos vimos en toda la noche... |
| 7 | Número | texto | ¿Cómo que no? Tenías un vestido blanco, una corona y un ramo de flores. |
| 8 | Número | foto | (corona sostenida por una mano) |
| 9 | Número | texto | Te la olvidaste |
| 10 | Martina | audio | ¿Vos estás loco? ¿Cómo le vas a hablar a mi hermana? |
| 11 | Número | texto | Perdón, te vi muy mal y me re preocupé. |
| 12 | Martina | audio | Pero no entiendo… ¿Por qué nunca me hablaste antes? |
| 13 | Número | texto | Vergüenza. Me hubiese gustado que te quedaras. |
| 14 | Martina | texto | ¿Sí? ¿Y Agustina? |
| 15 | Número | texto | Agustina no para de hablar de ella. Se hace la interesante, pero es un embole. En cambio vos… buen disfraz, Carrie, ¿no? |
| 16 | Martina | texto | ¡Ay! ¿Viste cómo es? La quiero, pero a veces es… no sé |
| 17 | Número | texto | Insoportable |
| 18 | Martina | texto | Lo dijiste vos, no yo. |
| 19 | Martina | audio | ¿Te gustó? No sé si alguien se dio cuenta |
| 20 | Número | texto | Compite con el del año pasado |
| 21 | Número | foto | (Martina disfrazada de Emily, la novia cadáver) |
| 22 | Martina | audio | ¿Qué haces con esto? Ay no, estaba horrible encima |
| 23 | Número | texto | A mí me gusta. Horrible es que no estés acá. |
| 24 | Martina | texto | ¿Si? ¿Qué más te gusta? ¿Cómo es eso de pasarme a buscar? |
| 25 | Julián | "escribiendo…" x2, después texto | Y… muchas cosas. Pero bueno, tendría que contártelas personalmente |
| 26 | Martina | texto | ¿y no podés adelantarme algo? |
| 27 | Julián | audio | (la música que sonaba en el cuarto) |
| 28 | Martina | ? | ¿Qué? ¡Los amo! Te juro que recién los estaba escuchando |
| 29 | Julián | texto | Nos gusta la misma música, las mismas pelis. Me gusta que tengamos tanto en común… ¿no? |
| 30 | Martina | texto | ¿Sí? Y… ¿así te gustaría verme? |
| 31 | Martina | foto | (selfie frente al espejo) |
| 32 | Julián | texto | Wow sos hermosa. Me encantás <3 |
| 33 | Martina | audio (se interrumpe, no se envía) | A mi también me encan… |
| 34 | Julián | texto | Buena compra hiciste, te queda muy linda esa luz |
| 35 | Martina | texto | ¿De qué hablas? |
| 36 | Julián | texto | De la lámpara :) . La compraste el lunes ¿no? |
| 37 | Julián | texto | Lo dijiste en clase |
| 38 | Martina | texto | ¿En serio? perdón, ando con la cabeza a mil. Es...extraña, pero tiene algo, como si no pudiera dejar de verla. ¿Nunca te pasó algo así? |
| 39 | Julián | texto | Sii! me pasa con vos :) |
| 40 | Martina | audio | Para...vos me estas chamuyando, si no fuiste el lunes |
| 41 | Julián | texto | Hasta durmiendo sos hermosa <3 |

Las llamadas entrantes de Julián (1.G 9–11 y ESC 2) no tienen texto.

### Eco (celular, ESC 1)

- Martina, audio: "Es una forra. Sabía que me gustaba Julian, ¿entendes? La odio. Me odio."
- Eco, texto: "Lo lamento mucho. Tenés derecho a estar enojada, pero no significa que haya algo malo en vos."
- Martina, audio: "No entendés. Se hizo la boluda como siempre. Estuve sola toda la noche. Estoy cansada de esto. Me siento horrible."
- Eco, texto: "Comprendo, Martu. Es una situación difícil. Sabes que a mucha gente le importás, no sos…"
- Martina: "¡Callate!" (después tira el celular)

## 8 bis. Inconsistencias detectadas (no corregí nada)

1. **ESC 2, dónde está el celular:** el guion dice que "el celular sigue sonando en su cuarto"; el desglose lo muestra en la mano de Martina. La app sirve para los dos casos.
2. **"tendría que contártelas" vs "debería contártelas":** el guion dice "tendría", el desglose y el doc dicen "debería". Va el guion.
3. **"Instagram" vs "Bristagram":** el guion y el desglose dicen Instagram, el doc dice Bristagram. En pantalla va Bristagram.
4. **Encabezado del chat antes de agendar:** el desglose llama "JULIAN" al remitente desde 1.E plano 1, pero Martina agenda el contacto recién en 1.E plano 8. Hasta ahí el encabezado muestra el número.
5. **Llamadas:** el guion dice que llama el "número desconocido". Va "Julián" porque a esa altura ya está agendado.
6. **Numeración:** 1.G tiene dos planos "6".
7. **Las 3 líneas extra de ESC 3** del doc de utilería no están en el guion (ver sección 6).
8. **Capitalización de mensajes** entre guion, desglose y doc: va la del guion.
9. ~~Restos de títulos ESC 4–7 en el desglose~~: resuelto, están mal numerados y se ignoran.

## 9. Preguntas abiertas

1. **Reproductor de música de la Mac:** título y artista inventados por mí. ¿Te parece o tenés uno en mente?
2. **Vibración visible:** si en algún plano el celular se mueve en cuadro al vibrar, con iPhone hay que resolverlo con un truco de utilería.
3. **Modelo de MacBook Air:** se asume M1, a confirmar.
4. **Material que tiene que llegar** (Arte o rodaje):
   - Historias de la fiesta de Julián y Agustina.
   - Foto de perfil de Julián.
   - Foto de la corona.
   - Foto de Martina disfrazada de Emily.
   - Video de Martina durmiendo (webcam real).
   - Fondo de pantalla de la Mac.
   - Selfie de 1.F 3: ¿se toma con la cámara del iPhone en el set?

## 10. Construcción del teléfono (v1, 2026-11-10)

Código en `invisible-utileria/telefono/` (ver su README). Web app estática, offline, para instalar como app en el iPhone.

- Pantallas: bloqueo con notificaciones, Inicio, Bristagram (historias), TalkGram, Eco, llamada entrante (y llamada conectada si se acepta).
- `[PROPUESTA]` **Barra de estado real del iPhone**, no simulada: en una web app de iPhone no se puede ocultar. Consecuencias:
  - La hora de arriba se fija en Ajustes del iPhone.
  - La batería no se puede simular.
  - La app tiene su propia "hora de ficción" para el bloqueo y los horarios del chat.
  - Esto contradice el principio heredado de GUITA ("hora y batería modificables"), así que necesita tu OK.
- `[PROPUESTA]` Controles de rodaje:
  - Menú oculto: mantener 0,7 s la esquina superior izquierda.
  - Toque invisible: doble toque en la esquina superior derecha.
  - Ninguno de los dos bloquea los botones de debajo.
- `[PROPUESTA]` Al cargar un plano desde el menú, el primer mensaje de Julián espera el toque invisible, para arrancar en "acción".
- `[PROPUESTA]` Recomendación de set: Acceso guiado activado, No molestar o modo avión, bloqueo automático en Nunca.
- `[INVENTADO]` Duraciones de audios: m10 4 s, m12 4 s, m19 3 s, m22 4 s, m27 (la canción) 32 s, m40 4 s. Eco: 6 s y 9 s.
- `[INVENTADO]` Esperas: Julián responde a los 2,5 s y entre mensajes seguidos deja 1,8 s. "Hasta durmiendo sos hermosa <3" entra 8 s después del audio de Martina, para dejar correr el video.
- `[INVENTADO]` Textos de interfaz que no están en el guion:
  - Estado "grabando audio…".
  - Vistas previas de notificación "📷 Foto" y "🎤 Mensaje de voz".
  - En la llamada, "Llamada de audio de TalkGram", "Recordarme" y "Mensaje".
  - Pantalla vacía de Eco: "¿De qué querés hablar?".
  - Fecha del bloqueo: "domingo, 1 de noviembre".
- `[ABIERTA]` m28 "¿Qué? ¡Los amo!…": el guion no dice si es texto o audio. Quedó como texto.

## 11. Correcciones tras la primera prueba en iPhone (v2, 2026-11-10)

- `[DECIDIDO]` **Bristagram** abre en un **feed** con publicaciones y la fila de historias arriba. Las historias se abren tocando el círculo de julianm.
  - Hay historias de **varias personas**, no solo de Julián.
  - Se navega tocando a los costados y deslizando entre personas. Deslizar hacia abajo cierra.
- `[INVENTADO]` Contenido de Bristagram, todo reemplazable desde el menú oculto:
  - Usuarios: `agustinaa.m` (Agustina), `cami.rossi`, `tomi.benitez`, `flor.dalessio`, `lu.paz`.
  - Textos de historias: "la mejor noche 🖤", "gracias a todos por venir 🎃", "alguien sabe si mañana hay clase?", "volver a casa así", "no me hablen hasta el lunes".
  - Publicaciones: "la terraza a esta hora 🧡", "previa".
  - Cantidad de "me gusta" y ubicación "Buenos Aires, Argentina".
  - Imágenes predeterminadas abstractas (luces desenfocadas, atardecer) y nombre de la marca en letra manuscrita.
- `[DECIDIDO]` **Notificaciones del bloqueo** con temporizador: entran solas a los 5 s de mostrarse el bloqueo (configurable) y aparecen con animación.
- `[PROPUESTA]` Transiciones tipo iOS:
  - Abrir una app: zoom desde el ícono.
  - Volver a Inicio: la app se achica.
  - Desbloquear: el bloqueo sube.
  - Llamada: aparece con fundido.
- `[DECIDIDO]` **TalkGram**:
  - Tocar la miniatura abre la **foto de perfil**. Tocar el número abre "Nuevo contacto".
  - Burbuja con **tres puntitos** mientras Julián escribe, además de "escribiendo…" arriba.
  - **Todo mensaje de Martina se puede mandar como texto o como audio**, sin importar cómo figure en el guion. En modo Completar, al escribir aparece el texto del guion.
  - En el menú: "Audios como audio / como texto", que define cómo se ven los audios al forzarlos o al cargar un plano.
- `[DECIDIDO]` **Llamada**: el botón Aceptar "vibra" (se sacude y tiene ondas que se expanden).
- **Barra de estado negra**: era el fondo negro de la página, que iOS usa para pintar la barra. Ahora la página toma el color de cada pantalla.
  - `[PROPUESTA]` Tres modos en el menú: texto oscuro, texto blanco o automático (experimental). El texto de la barra no cambia de color solo en todos los iOS. **Hay que probar cuál queda mejor en el iPhone.**
- `[PROPUESTA]` Con conexión, la app siempre baja la última versión. Sin conexión (modo avión) usa la guardada.

## 12. Próximo paso

Probar la app en el iPhone 14 (lista de lo no verificable en el README). Después, direcciones visuales de la Mac.

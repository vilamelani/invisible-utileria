# Invisible · utilería del iPhone

Web app estática (sin backend, funciona sin conexión) que simula el iPhone de Martina:

- pantalla de bloqueo con notificaciones,
- Inicio,
- Bristagram (historias),
- TalkGram (chat con Julián),
- Eco (chat de IA),
- llamada entrante.

Está pensada para un iPhone 14 con la dirección visual B · Clara.

## Estructura

```
telefono/
  index.html              entrada
  css/app.css             estilos
  js/app.js               pantallas y motor del guion
  js/menu.js              menú oculto del equipo técnico
  js/media.js             fotos y videos guardados en el celular
  js/icons.js             íconos propios
  contenido/guion.json    TODOS los textos (literales del guion)
  sw.js                   modo sin conexión
  manifest.webmanifest    instalación como app
```

## Probar en la compu

```bash
cd telefono
python3 -m http.server 8000
# abrir http://localhost:8000 en Chrome, modo dispositivo iPhone 14 (390 × 844)
```

## Publicar en GitHub Pages

1. Subí la carpeta `telefono/` al repo.
2. En el repo: Settings › Pages › Deploy from a branch, rama `main`, carpeta `/ (root)`.
3. La URL queda `https://<usuario>.github.io/<repo>/telefono/`.
4. Cada vez que publiques cambios, subí `VERSION` en `sw.js` (por ejemplo `invisible-v2`). Si no, los celulares siguen mostrando la versión vieja guardada.

## Instalar en el iPhone de rodaje

1. Abrí la URL en **Safari**, con conexión.
2. Compartir › **Agregar a pantalla de inicio**.
3. Abrí siempre desde ese ícono, nunca desde Safari: así se ve a pantalla completa, sin barra de navegador.
4. Desde ese momento funciona sin conexión.

### Antes de cada jornada

- **Acceso guiado** (Ajustes › Accesibilidad › Acceso guiado). Activalo con triple clic en el botón lateral. Así la actriz no puede salir de la app con el gesto de inicio.
- **Modo No molestar** o **modo avión**, para que no entre ninguna notificación real.
- **Bloqueo automático: Nunca** (Ajustes › Pantalla y brillo).
- **Fotos y videos**: se cargan desde el menú oculto y quedan guardados en el celular.
- **Hora**: la barra de estado de arriba es la real del iPhone. Su hora se cambia en Ajustes › General › Fecha y hora, desactivando "Automático". La batería no se puede simular.

## Controles en el set

| Qué | Cómo |
|---|---|
| Menú oculto | Mantener apretada ~0,7 s la esquina **superior izquierda** |
| Toque invisible (siguiente evento) | **Doble toque** en la esquina **superior derecha**. En TalkGram hace entrar el próximo mensaje de Julián. En Eco hace avanzar Eco. |
| Desbloquear | Deslizar hacia arriba en la pantalla de bloqueo |
| Volver a Inicio | Deslizar hacia arriba desde el borde inferior. Si el Acceso guiado no lo deja, usar el botón ‹ de TalkGram o el menú. |

Los toques invisibles no bloquean los botones que hay debajo.

### Menú oculto

- **Plano**: deja el chat exactamente como empieza cada plano (1.C/5, 1.C/7 … 1.G/6). El primer mensaje de Julián espera el toque invisible, para arrancar en "acción".
- **Siguiente evento / Deshacer último / Reiniciar todo**.
- **Completar texto del guion**: la actriz toca teclas cualquiera y aparece el texto exacto del guion. Al enviar se manda el mensaje del guion. **Escritura libre**: se envía lo que escriba.
- **Temporizadores**: tiempos de respuesta de Julián, "escribiendo…" antes de cada mensaje y letras por tecla.
- **Agendar contacto** a mano, **borrar notificaciones** del bloqueo.
- **Eco**: siguiente, reiniciar y velocidad del texto.
- **Llamada**: dispararla, cuántas veces vuelve a sonar tras rechazarla y a los cuántos segundos.
- **Fotos y videos**:
  - perfil de Julián, historias 1 a 3, corona, Emily;
  - selfie (si no se saca en vivo);
  - fondo de pantalla y foto del widget.
- **Hora de ficción**: para la pantalla de bloqueo y los horarios del chat.
- **Textos (JSON)**: editar cualquier texto sin tocar código.

### Qué hace la actriz en cada app

- **TalkGram**:
  - Escribe y envía con el teclado real.
  - Para los audios, toca el micrófono para grabar y la flecha para enviar. El tacho cancela, que es el audio interrumpido de 1.F/4.
  - La cámara abre la cámara real del iPhone, para la selfie de 1.F/3, y la manda.
  - Tocando el nombre (o "Agregar") se agenda el contacto. En modo Completar aparece "Julián" letra por letra.
- **Eco**: toca el micrófono, habla y toca la flecha. Aparece la transcripción del guion y Eco responde palabra por palabra.
- **Bristagram**: desde Inicio. Las historias avanzan solas. Tocar a los costados cambia de historia.

## Editar textos

Todo está en `contenido/guion.json`:

- mensajes,
- número y nombre del contacto,
- fecha del bloqueo,
- widgets,
- usuario de Bristagram,
- textos de la llamada.

Por mensaje:

- `espera`: segundos antes de que entre el mensaje.
- `manual: true`: el mensaje solo entra con el toque invisible.
- `plano`: lo agrega a la lista de planos del menú.

## Lo que NO se pudo verificar fuera del iPhone

- Si la barra de estado real toma el color de cada pantalla (`theme-color`). Si no lo toma, probar `black-translucent` en `index.html`.
- El teclado real en modo Completar: autocorrección, barra predictiva y salto del texto al abrirse el teclado.
- Si la cámara (`capture="user"`) abre directo la cámara frontal.
- Si el gesto de "deslizar desde abajo" convive con el gesto del sistema con Acceso guiado.
- Si los videos de las historias se reproducen solos.

# Invisible · utilería de la MacBook

Web app estática (sin backend, funciona sin conexión) que simula el escritorio de la Mac de Martina, con la dirección visual A · Claro fiel. Incluye:

- barra de menú propia (sin logo de Apple),
- reproductor de música "sonando" (no suena: el sonido va en post),
- aviso de mail nuevo,
- Correo con el mail de Julián y el video adjunto,
- reproductor de video que tarda en cargar,
- ESC 3: Eco toma la Mac. La página de Eco, en una ventana privada del navegador, muestra las 4 líneas del guion. Con cada línea se abre sola una terminal que escribe comandos, y con la última se abre la cámara en vivo.

## Estructura

```
mac/
  index.html             entrada
  css/mac.css            estilos
  js/mac.js              escritorio, ventanas y secuencia de la escena
  js/menu.js             menú oculto del equipo técnico
  js/media.js            fotos y videos guardados en la Mac
  js/esc3.js             ESC 3: Eco, terminales y cámara en vivo
  contenido/mac.json     TODOS los textos (canción, mail, bandeja de entrada, fechas)
  sw.js                  modo sin conexión
```

## Probar en la compu

```bash
cd mac
python3 -m http.server 8000
# abrir http://localhost:8000 en una ventana de 1440 × 900
```

La pantalla está diseñada a 1440 × 900 (MacBook Air M1) y se escala para llenar cualquier ventana.

## Instalar en la MacBook de rodaje

1. Abrí `https://<usuario>.github.io/<repo>/mac/` en **Safari**, con conexión.
2. Archivo › **Agregar al Dock**. Abrí siempre desde ese ícono: es una ventana sin barras de navegador.
3. Ponela en pantalla completa con el botón verde o con Ctrl+Cmd+F. También funciona el botón **Pantalla completa** del menú oculto.
4. Desde ese momento funciona sin conexión.

### Antes de cada jornada

- **No llevar el cursor al borde de arriba ni al de abajo.** En pantalla completa, macOS muestra la barra de menú real (con el logo de Apple) si el cursor toca el borde de arriba, y el Dock real si toca el de abajo.
- **No molestar** activado, para que no entre ninguna notificación real.
- **Cargar el video** de Martina durmiendo y el **fondo de pantalla** desde el menú oculto (Fotos y videos). Quedan guardados en la Mac.
- **Cerrar la tapa (1.G/6):** la app guarda todo su estado. Para que al abrir la tapa no pida contraseña: Ajustes del Sistema › Pantalla bloqueada › "Solicitar contraseña" en Nunca.

## Controles en el set

| Qué | Cómo |
|---|---|
| Menú oculto | Mantener apretado ~0,7 s el **círculo** de arriba a la izquierda, o **Ctrl+Opción+M** |
| Siguiente evento | **Doble clic sobre la hora** (arriba a la derecha), o **Ctrl+Opción+→** |
| Deshacer | **Ctrl+Opción+←** |
| Cerrar el menú | Esc |

Secuencia de "Siguiente evento":

1. Pausa la música.
2. Llega el mail.
3. Abre el mail.
4. Abre el video.
5. Hace que el video termine de cargar ya.

En la ESC 3, "Siguiente evento" hace aparecer la próxima línea de Eco.

### ESC 3

1. En el menú: **Cargar ESC 3**. Queda el escritorio vacío.
2. Arranca con el toque invisible (doble clic sobre la hora o Ctrl+Opción+→), o sola a los X segundos.
3. **Paso 1:** un cursor que se mueve solo va al Dock y abre el Navegador en ventana privada. Hace clic en la barra de direcciones y escribe "eco.chat" letra por letra. La página carga y aparece "Enviando a Martina". Después el cursor hace clic en Terminal (Dock) y se abre la primera terminal, que escribe comandos.
4. **Pasos 2 y 3:** aparece la línea siguiente en Eco y el cursor abre otra terminal desde el Dock.
5. **Paso 4:** el cursor hace clic en la última terminal, que escribe `camara --abrir --en-vivo`. Se abre la ventana **cam0 — en vivo** y aparece "No sos invisible."

Cada paso sigue solo 2 s después de que la terminal terminó de escribir (configurable). También se puede apagar el avance solo y pasar paso por paso con el toque. Si se toca antes de que termine un paso, el siguiente espera a que termine.

Las ventanas salen del ícono del Dock y el ícono rebota, como en macOS. El cursor real queda oculto mientras tanto.

**Cámara:** por defecto usa la **webcam real** de la Mac. La primera vez Safari pide permiso:
- Usá **Pedir permiso de cámara ahora** del menú antes de la toma, así el cartel no aparece en cámara.
- Para que no lo pida nunca más: Safari › Ajustes › Sitios web › Cámara › Permitir.

Si la cámara está tapada con cinta, o se prefiere una imagen controlada, se puede cargar un **video de respaldo** en Fotos y videos y elegir "Cámara: video de respaldo".

Los comandos, las terminales, las posiciones de las ventanas y el recorrido del cursor están en `contenido/mac.json` (sección `esc3`).

### Lo que hace la actriz con el trackpad

- **Pausar la música**: botón de pausa del reproductor.
- **Abrir el mail**: clic en el aviso, en el ícono de Correo del Dock o en el mail de la lista.
- **Abrir el video**: clic en el adjunto. Aparece un reproductor que se queda cargando unos segundos (configurable) y después reproduce el video.
- Las ventanas se pueden mover arrastrando la barra de arriba. El botón rojo las cierra.

### Menú oculto

- **Plano**: deja la Mac exactamente como empieza cada plano (1.A, 1.B, 1.G/2, mail abierto, 1.G/4).
- **Música**: pausar o reproducir, ir a un segundo, canción, artista y duración.
- **Mail**: hacerlo llegar, si llega solo a los X segundos de cargar 1.G/2, si el aviso queda fijo o se va solo, y todos sus textos.
- **Video**: cuánto tarda en cargar y si se repite.
- **Fotos y videos**: video del adjunto, fondo de pantalla, portada del disco y video de respaldo de la cámara (ESC 3).
- **Hora, fecha y batería** de la barra de menú.
- **Textos (JSON)**: editar cualquier texto sin tocar código.

## Lo que NO se pudo verificar fuera de la MacBook

- Si Safari mantiene la pantalla completa después de cerrar y abrir la tapa.
- Que el video cargado (de la webcam) se reproduzca bien en Safari. Si es un `.mov` HEVC, debería; si falla, convertirlo a `.mp4` H.264.
- El tamaño real de los textos en la pantalla de 13".
- La webcam real en Safari: el cartel de permiso, si al recargar vuelve a pedirlo, y la imagen en la ventanita. Se probó con una cámara simulada en Chrome.
- Si la luz verde de la cámara queda encendida al salir de la ESC 3 (debería apagarse al cargar otro plano).

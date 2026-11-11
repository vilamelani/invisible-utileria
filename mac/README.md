# Invisible · utilería de la MacBook

Web app estática (sin backend, funciona sin conexión) que simula el escritorio de la Mac de Martina, con la dirección visual A · Claro fiel. Incluye:

- barra de menú propia (sin logo de Apple),
- reproductor de música "sonando" (no suena: el sonido va en post),
- aviso de mail nuevo,
- Correo con el mail de Julián y el video adjunto,
- reproductor de video que tarda en cargar.

La ESC 3 (Eco toma la Mac) queda para cuando se elija la dirección.

## Estructura

```
mac/
  index.html             entrada
  css/mac.css            estilos
  js/mac.js              escritorio, ventanas y secuencia de la escena
  js/menu.js             menú oculto del equipo técnico
  js/media.js            fotos y videos guardados en la Mac
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

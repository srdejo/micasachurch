# Design

## Context

Ver proposal.md. Todo el cambio vive en `frontend-landing`:
- `pages/home/home.html`:
  - La tarjeta de Prédicas tiene dos botones, "Suscribirse" y "En vivo {{ dailyDevotionalTime() }}".
  - La barra fija inferior (`hidden max-[980px]:flex fixed bottom-0 …`) tiene "En vivo" y "WhatsApp" y se muestra siempre en móvil.
  - El footer lleva `max-[980px]:pb-32` para que la barra no tape su texto.
- `Home.live()` ya da la transmisión en curso, o `null`. Es `null` durante el render del servidor y cuando el admin ocultó la franja.
- `shared/devotional-article/devotional-article.html` renderiza, en este orden: lectura, título, versículo, contenido, audio y Biblia en un año.

## Goals / Non-Goals

**Goals:** los tres ajustes pedidos, sin tocar el cálculo de "En vivo" ni el backend.

**Non-Goals:** reproducir el audio en segundo plano al cambiar de página (el reproductor vive en cada vista; si el visitante va de inicio a `/devocional`, el audio vuelve a empezar); cambiar la tarjeta "En vivo · 7:00 a.m." bajo la portada, el WhatsApp del header o el menú móvil (decisión de Daniel), ni el diseño de escritorio.

## Decisions

### 1. La barra inferior depende de `live()`
La barra se envuelve en `@if (live(); as current)` y el botón usa `current.url`. Como `live()` ya es `null` si el admin apagó la franja, la barra también se oculta en ese caso, igual que el resto de las señales de "en vivo". En SSR `live()` es `null`, así que el HTML prerenderizado no trae la barra y aparece al hidratar si hay transmisión. No provoca un salto de contenido porque es `fixed`.
- *Alternativa descartada*: calcular aparte con `liveStatus()?.live`, ignorando el interruptor de la franja. Rompería la regla de ocultar toda señal de "en vivo" cuando el admin la apaga.

### 2. El padding del footer también depende de `live()`
`max-[980px]:pb-32` se aplica solo cuando hay transmisión (`[ngClass]`). Sin transmisión, el footer usa su padding normal de móvil (`pb-11`).

### 3. Orden del devocional
En el `@else if (entry())` de `devotional-article.html`, el orden queda así: recuadro "La Biblia en un año" (si viene), referencia de la lectura, título, reproductor de audio (si viene), versículo y reflexión. Como cada bloque condicional es un hijo del `flex gap-5`, cuando falta no deja hueco. El home muestra solo el título y el versículo del devocional, así que no cambia.

### 4. Reproductor propio: `shared/audio-player`
Componente standalone con `input.required<string>() src`. Por dentro usa un `<audio preload="metadata">` oculto, sin `controls`, y lo maneja con signals: `playing`, `current`, `duration`, `rate` y `failed`.
- **Aspecto**, sobre el fondo tinta de `/devocional`: una tarjeta `rounded-2xl` con borde `paper/15` y fondo `paper/[0.06]`, igual que el recuadro de la Biblia en un año. Adentro:
  - un botón circular de 48 px `bg-accent text-ink` con los íconos SVG de reproducir y pausar;
  - al lado, la etiqueta "Escucha la lectura" (Gotham Bold, en mayúsculas espaciadas, en el color de acento) y el tiempo `m:ss / m:ss`;
  - debajo, la barra de progreso: un `<input type="range">` estilizado con el relleno en el acento, que da teclado (flechas) y toque sin código extra y tiene `aria-label="Posición del audio"`;
  - a la derecha, un botón que alterna 1× → 1.25× → 1.5×, con `aria-label="Velocidad de reproducción"`.
- **Tamaño**: el reproductor usa medidas fijas en px, así que el `fontSize.em` del artículo no lo agranda.
- **Errores**: `(error)` del `<audio>` pone `failed`, y entonces el componente no renderiza nada. Así, "si el archivo no carga no se muestra" se cumple dentro del componente.
- **Variantes**: `variant = input<'dark' | 'light'>('dark')`. En la variante oscura (la de `/devocional`) la tarjeta es `paper/[0.06]` con borde `paper/15` y el texto es `paper`. En la clara (la del home) la tarjeta es `ink/[0.05]` con borde `ink/10`, el texto es `ink`, la etiqueta va en `accent-deep` y el relleno de la barra en `ink`. El botón circular es `bg-accent text-ink` en ambas, porque el acento sobre el suave del mismo tema no da contraste suficiente para el relleno.
- *Alternativa descartada*: estilizar el `<audio controls>` nativo. Los navegadores casi no permiten personalizarlo y se ve distinto en cada uno, que es justo lo que se quiere evitar.

### 5. Tarjeta del devocional en el home
La tarjeta hoy es un `<a routerLink="/devocional">` que la envuelve entera. Un `<button>` o un `<input>` dentro de un `<a>` es HTML inválido y cada clic en el reproductor navegaría. La tarjeta pasa a ser un `<article>` con el mismo estilo: el título se vuelve un `<a routerLink="/devocional">` y "Leer completo →" también. El reproductor (`variant="light"`) va entre la referencia de la lectura y el versículo. Se pierde el hover de borde de toda la tarjeta; queda en el título y en el enlace.

## Risks / Trade-offs

- [En móvil, quien quiera escribir por WhatsApp pierde el acceso de la barra] → Sigue teniendo el botón del header, "Escribir por WhatsApp" en el menú y el de "Planea tu visita".
- [Con el reloj del visitante mal puesto, la barra no aparece] → No aplica: el estado usa la hora real del dispositivo convertida a la de Bogotá. Si el dispositivo tiene la hora mal, ya pasaba lo mismo con la franja.

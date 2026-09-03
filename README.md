# Niko y el Reino de Azúcar

Juego de plataformas original creado con React 19, TypeScript, Canvas y Vinext.
Incluye cuatro mundos conectados por un mapa con progreso guardado, controles de teclado y táctiles,
enemigos con patrullas, corazones de vida, poderes de escudo y turbo,
estrellas coleccionables, puntuación, puntos de reaparición seguros y
diseño responsive para computadora y celular.

## Capítulos

1. Pradera de Gomitas
2. Cañón de Caramelo
3. Grutas de Chocolate
4. Castillo de Cristal

<img width="1652" height="863" alt="image" src="https://github.com/user-attachments/assets/98e7f6be-cc94-4efa-aa55-95916cbc6701" />

<img width="1721" height="870" alt="image" src="https://github.com/user-attachments/assets/90a0e7c7-dd0d-4e85-ab00-c20e4995d832" />

## Requisitos

- Node.js 22.13 o superior
- npm

Comprueba las versiones instaladas:

```powershell
node --version
npm --version
```

## Instalación

Abre una terminal dentro de la carpeta del proyecto e instala las dependencias:

```powershell
npm install
```

También puedes utilizar `npm ci` si quieres instalar exactamente las versiones
registradas en `package-lock.json`.

## Ejecutar en desarrollo

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

Los cambios realizados en `app/page.tsx` o `app/globals.css` se actualizarán
automáticamente. Para detener el servidor, presiona `Ctrl + C`.

## Controles

- Mover: `A`, `D`, `←` o `→`
- Saltar: `W`, `↑` o `Espacio`
- En celular: utiliza los botones táctiles de la pantalla

## Compilar para producción

```powershell
npm run build
```

Para ejecutar localmente la compilación generada:

```powershell
npm run start
```

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el entorno local de desarrollo |
| `npm run build` | Genera y valida la compilación de producción |
| `npm run start` | Ejecuta localmente la compilación |
| `npm run lint` | Revisa el código y los estilos |

## Archivos principales

- `app/page.tsx`: coordina el bucle principal y el renderizado Canvas.
- `app/game/levels.ts`: mundos, plataformas, estrellas, objetos y enemigos.
- `app/game/physics.ts`: colisiones, aterrizajes y patrullas.
- `app/game/audio.ts`: efectos de sonido.
- `app/game/types.ts`: tipos compartidos del juego.
- `app/game/ui.tsx`: HUD, mapa, pantallas y controles táctiles.
- `app/globals.css`: estilos base e importación de las hojas especializadas.
- `app/styles/game-layout.css`: escenario, HUD y controles.
- `app/styles/world-map.css`: mapa y selector de mundos.
- `app/styles/responsive.css`: adaptación para celular y orientación horizontal.
- `app/layout.tsx`: título y metadatos del sitio.
- `.openai/hosting.json`: conexión con el despliegue de ChatGPT Sites.

## Sitio publicado

El juego está disponible en:

[https://niko-reino-azucar.jordan2023.chatgpt.site](https://niko-reino-azucar.jordan2023.chatgpt.site)

El despliegue se administra desde **Sites** en ChatGPT .

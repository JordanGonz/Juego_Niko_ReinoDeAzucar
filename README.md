# Niko y el Reino de Azúcar

Juego de plataformas original creado con React 19, TypeScript, Canvas y Vinext.
Incluye controles de teclado y táctiles, enemigos, monedas, puntuación, vidas y
diseño responsive para computadora y celular.

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

- `app/page.tsx`: lógica, físicas, escenario y componentes del juego.
- `app/globals.css`: diseño visual y comportamiento responsive.
- `app/layout.tsx`: título y metadatos del sitio.
- `.openai/hosting.json`: conexión con el despliegue de ChatGPT Sites.

## Sitio publicado

El juego está disponible en:

[https://niko-reino-azucar.jordan2023.chatgpt.site](https://niko-reino-azucar.jordan2023.chatgpt.site)

El despliegue se administra desde **Sites** en la barra lateral de ChatGPT o
desde la conversación de Codex donde se creó.

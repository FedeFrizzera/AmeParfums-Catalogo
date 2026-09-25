# Lumière Perfumes — sitio del catálogo

Estructura lista para abrir en Visual Studio Code y subir a GitHub.

```
catalogoperfumes/
├── index.html          → portada
├── catalogo.html       → catálogo con buscador y filtros
├── css/style.css       → todos los estilos
├── js/datos.js         → los 177 perfumes (acá agregás o sacás productos)
├── js/app.js           → configuración + lógica del catálogo
└── img/
    ├── logo.jpg        → tu logo (cuadrado, mínimo 200x200)
    └── perfumes/       → fotos de los frascos (opcional)
```

## 1. Poné tu número de WhatsApp

Abrí `js/app.js`, primera línea del bloque CONFIG:

```js
whatsapp: "5493834994971",
```

Formato: 54 + 9 + código de área sin el 0 + número sin el 15.
Ejemplo La Rioja 3804 123456 → `5493804123456`.

Ese número se usa en todos los botones: el del menú, el flotante, el del pie
y el de cada ficha de perfume (que además manda el nombre y el código ya escritos).

## 2. Poné tu logo

Guardá tu imagen como `img/logo.jpg`. Si no existe, el sitio muestra solo el
nombre escrito y no se rompe nada. Para cambiar el nombre de la marca, buscá
`LUMIÈRE` y `PERFUMES` en `index.html` y `catalogo.html`.

## 3. Agregar o editar perfumes

Todo vive en `js/datos.js`. Cada producto es un bloque así:

```js
{
  "codigo": "N148",
  "nombre": "Sauvage",
  "referencia": "Dior",
  "categoria": "masculino",        // masculino | femenino | unisex
  "familia": "Fougère / Amaderada",
  "perfil": "Fresco, especiado, masculino",
  "uso": "Día y noche",
  "nota": "Texto que aparece en la ficha.",
  "imagen": ""                      // "img/perfumes/sauvage.jpg"
}
```

Mientras `imagen` esté vacío, la tarjeta dibuja un frasco con el código adentro.
En cuanto le cargues una foto, la usa. Podés ir cargando fotos de a poco.

## 4. Subirlo a GitHub Pages

1. Creá un repositorio nuevo (por ejemplo `perfumes`).
2. Subí todos los archivos (Source Control en VS Code, o arrastrándolos en github.com).
3. En el repo: Settings → Pages → Branch: `main` → carpeta `/ (root)` → Save.
4. En un par de minutos tenés el enlace: `https://tuusuario.github.io/perfumes/`

Ese es el enlace que compartís por WhatsApp o ponés en la bio de Instagram.

## Sobre PHP

GitHub Pages solo sirve archivos estáticos: **no ejecuta PHP**. Si subís un
`.php` ahí, se descarga en vez de ejecutarse. Por eso el sitio está hecho con
HTML + CSS + JavaScript, que es lo que un catálogo como este necesita.

PHP recién te haría falta si más adelante querés un panel para cargar perfumes
desde el navegador con usuario y contraseña, o un carrito con base de datos. En
ese caso vas a necesitar un hosting con PHP (Hostinger, Donweb, InfinityFree)
en lugar de GitHub Pages. La parte visual que ya tenés se reutiliza igual.

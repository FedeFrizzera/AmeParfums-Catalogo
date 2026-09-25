/* =======================================================
   CONFIGURACIÓN
   ======================================================= */

   const CONFIG = {
    whatsapp: "5493834994971",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    porPagina: 24,
  
    /* Precios por defecto (se pueden sobrescribir por perfume) */
    preciosDefault: {
      "30ml": 31000,
      "50ml": 36000,
      "100ml": 50000
    }
  };
  
  /* =======================================================
     MENÚ MÓVIL
     ======================================================= */
  
  const botonMenu = document.getElementById("abrirMenu");
  const menu = document.getElementById("menu");
  
  if (botonMenu && menu) {
    botonMenu.addEventListener("click", () => {
      const abierto = menu.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", abierto);
    });
  }
  
  /* =======================================================
     SUBMENÚ DE CATÁLOGO
     ======================================================= */
  
  const submenus = document.querySelectorAll(".menu__submenu");
  
  submenus.forEach(submenu => {
    const boton = submenu.querySelector(".menu__submenu-boton");
    if (!boton) return;
  
    boton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const abierto = submenu.classList.toggle("abierto");
      boton.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  });
  
  /* Cerrar el submenú al tocar fuera (solo desktop) */
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 820) {
      submenus.forEach(submenu => {
        if (!submenu.contains(e.target)) {
          submenu.classList.remove("abierto");
          submenu.querySelector(".menu__submenu-boton")
            ?.setAttribute("aria-expanded", "false");
        }
      });
    }
  });
  
  /* Cerrar menú móvil al hacer click en un link */
  if (menu && botonMenu) {
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (menu.classList.contains("abierto")) {
          menu.classList.remove("abierto");
          botonMenu.setAttribute("aria-expanded", "false");
        }
      });
    });
  }
  
  /* =======================================================
     ENLACES DE WHATSAPP
     ======================================================= */
  
  function enlaceWhatsApp(mensaje) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  }
  
  document.querySelectorAll("[data-whatsapp]").forEach(a => {
    a.href = enlaceWhatsApp(a.dataset.whatsapp || "Hola! Quiero hacer una consulta sobre los perfumes.");
  });
  
  /* =======================================================
     CONTEO POR CATEGORÍA
     ======================================================= */
  
  if (typeof PERFUMES !== "undefined") {
    document.querySelectorAll("[data-conteo]").forEach(el => {
      const cat = el.dataset.conteo;
      el.textContent = cat === "todos"
        ? PERFUMES.length
        : PERFUMES.filter(p => p.categoria === cat).length;
    });
  
    document.querySelectorAll("[data-conteo-categoria]").forEach(el => {
      const tipo = el.dataset.conteoCategoria;
      const cat = el.closest("[data-categoria]")?.dataset.categoria;
      if (!cat) return;
  
      const listaCat = PERFUMES.filter(p => p.categoria === cat);
  
      if (tipo === "total") {
        el.textContent = listaCat.length;
      } else if (tipo === "bodysplash") {
        el.textContent = listaCat.filter(p => p.subcategoria === "bodysplash").length;
      } else if (tipo === "fragancias") {
        el.textContent = listaCat.filter(p => p.subcategoria !== "bodysplash").length;
      }
    });
  }
  
  /* =======================================================
     FUNCIÓN PARA DIBUJAR EL FRASCO O IMAGEN
     ======================================================= */
  
  function visualPerfume(p, contexto = "tarjeta") {
    const rutaImagen = contexto === "ficha"
      ? (p.imagenFicha || p.imagen)
      : p.imagen;
  
    if (rutaImagen) {
      return `<img src="${rutaImagen}" alt="${p.nombre}" loading="lazy">`;
    }
  
    return `
      <div class="frasco">
        <div class="frasco__tapa"></div>
        <div class="frasco__cuello"></div>
        <div class="frasco__cuerpo">
          <span class="frasco__codigo">${p.codigo}</span>
        </div>
      </div>`;
  }
  
  /* =======================================================
     FUNCIÓN PARA DIBUJAR LOS PRECIOS
     ======================================================= */
  
  function bloquePrecios(p) {
    const precios = p.precios || CONFIG.preciosDefault;
    if (!precios) return "";
  
    const items = Object.entries(precios).map(([ml, valor]) => `
      <li>
        <span class="ficha__precio-ml">${ml}</span>
        <span class="ficha__precio-valor">$${valor.toLocaleString("es-AR")}</span>
      </li>
    `).join("");
  
    return `
      <div class="ficha__precios">
        <h4>Presentaciones</h4>
        <ul>${items}</ul>
      </div>`;
  }
  
  /* =======================================================
     CATÁLOGO
     ======================================================= */
  
  const grilla = document.getElementById("grilla");
  
  if (grilla && typeof PERFUMES !== "undefined") {
  
    const buscador   = document.getElementById("buscador");
    const pastillas  = document.querySelectorAll(".pastilla");
    const selFamilia = document.getElementById("familia");
    const selOrden   = document.getElementById("orden");
    const conteo     = document.getElementById("conteo");
    const vacio      = document.getElementById("vacio");
    const botonMas   = document.getElementById("verMas");
    const ficha      = document.getElementById("ficha");
  
    let categoria = "todos";
    let visibles  = CONFIG.porPagina;
  
    /* --- Cargar familias olfativas --- */
    const familias = [...new Set(
      PERFUMES.flatMap(p => p.familia.split("/").map(f => f.trim()))
    )].sort((a, b) => a.localeCompare(b, "es"));
  
    familias.forEach(f => {
      const op = document.createElement("option");
      op.value = f;
      op.textContent = f;
      selFamilia.appendChild(op);
    });
  
    /* --- Categoría desde la URL --- */
    const paramCategoria = new URLSearchParams(location.search).get("categoria")
      || location.hash.replace("#", "");
    if (["masculino", "femenino", "unisex", "bodysplash"].includes(paramCategoria)) {
      categoria = paramCategoria;
    }
  
    /* --- Filtrado --- */
    function filtrar() {
      const texto = (buscador.value || "").toLowerCase().trim();
      const fam = selFamilia.value;
  
      let lista = PERFUMES.filter(p => {
        /* Caso especial: bodysplash (solo femeninos con subcategoria bodysplash) */
        if (categoria === "bodysplash") {
          const okBodysplash = p.subcategoria === "bodysplash";
          const okFamilia = fam === "todas" || p.familia.toLowerCase().includes(fam.toLowerCase());
          const okTexto = !texto || [p.nombre, p.referencia, p.codigo, p.familia, p.perfil]
            .join(" ").toLowerCase().includes(texto);
          return okBodysplash && okFamilia && okTexto;
        }
  
        /* Caso general */
        const okCategoria = categoria === "todos" || p.categoria === categoria;
        const okFamilia = fam === "todas" || p.familia.toLowerCase().includes(fam.toLowerCase());
        const okTexto = !texto || [p.nombre, p.referencia, p.codigo, p.familia, p.perfil]
          .join(" ").toLowerCase().includes(texto);
        return okCategoria && okFamilia && okTexto;
      });
  
      if (selOrden.value === "nombre") {
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      } else if (selOrden.value === "referencia") {
        lista.sort((a, b) => a.referencia.localeCompare(b.referencia, "es"));
      }
  
      return lista;
    }
  
    /* --- Dibujar tarjetas --- */
    function pintar() {
      const lista = filtrar();
      const mostrar = lista.slice(0, visibles);
  
      conteo.textContent = lista.length === 0
        ? "Sin resultados"
        : `${lista.length} ${lista.length === 1 ? "fragancia" : "fragancias"}`;
  
      vacio.hidden = lista.length > 0;
      botonMas.hidden = lista.length <= visibles;
  
      grilla.innerHTML = mostrar.map(p => `
        <article class="tarjeta tarjeta--${p.categoria}">
          <div class="tarjeta__visual">
            <span class="tarjeta__etiqueta">${p.subcategoria === "bodysplash" ? "Bodysplash" : p.categoria}</span>
            ${visualPerfume(p)}
          </div>
          <div class="tarjeta__cuerpo">
            <h3>${p.nombre}</h3>
            <p class="tarjeta__ref">Inspirado en ${p.referencia}</p>
            <p class="tarjeta__familia">${p.familia}</p>
            <p class="tarjeta__perfil">${p.perfil}</p>
            <div class="tarjeta__pie">
              <span>${p.uso}</span>
              <button class="tarjeta__ver" data-codigo="${p.codigo}">Ver ficha</button>
            </div>
          </div>
        </article>
      `).join("");
    }
  
    /* --- Ficha --- */
    function abrirFicha(codigo) {
      const p = PERFUMES.find(x => x.codigo === codigo);
      if (!p) return;
  
      ficha.innerHTML = `
        <button class="ficha__cerrar" id="cerrarFicha" aria-label="Cerrar">&times;</button>
        <div class="ficha__interior tarjeta--${p.categoria}">
          <div class="ficha__visual">${visualPerfume(p, "ficha")}</div>
          <div class="ficha__texto">
            <span class="ficha__codigo">Extracto ${p.codigo}</span>
            <p class="ficha__inspirado">Inspirado en</p>
            <h3>${p.nombre}</h3>
            <p class="ficha__ref">de ${p.referencia}</p>
            <dl class="ficha__lista">
              <div><dt>Familia</dt><dd>${p.familia}</dd></div>
              <div><dt>Perfil</dt><dd>${p.perfil}</dd></div>
              <div><dt>Uso</dt><dd>${p.uso}</dd></div>
              <div><dt>Género</dt><dd>${p.categoria[0].toUpperCase() + p.categoria.slice(1)}</dd></div>
            </dl>
            ${bloquePrecios(p)}
            <p class="ficha__nota">${p.nota}</p>
            <div class="ficha__acciones">
              <a class="boton" target="_blank" rel="noopener"
                 href="${enlaceWhatsApp(`Hola! Quiero consultar precio y disponibilidad de ${p.nombre} (extracto ${p.codigo}).`)}">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>`;
  
      ficha.showModal();
      document.getElementById("cerrarFicha").addEventListener("click", () => ficha.close());
    }
  
    grilla.addEventListener("click", e => {
      const boton = e.target.closest("[data-codigo]");
      if (boton) abrirFicha(boton.dataset.codigo);
    });
  
    ficha.addEventListener("click", e => {
      if (e.target === ficha) ficha.close();
    });
  
    /* --- Filtros --- */
    function reiniciar() {
      visibles = CONFIG.porPagina;
      pintar();
    }
  
    buscador.addEventListener("input", reiniciar);
    selFamilia.addEventListener("change", reiniciar);
    selOrden.addEventListener("change", reiniciar);
  
    pastillas.forEach(b => {
      b.setAttribute("aria-pressed", b.dataset.categoria === categoria);
      b.addEventListener("click", () => {
        categoria = b.dataset.categoria;
        pastillas.forEach(x => x.setAttribute("aria-pressed", x === b));
        reiniciar();
      });
    });
  
    window.addEventListener("hashchange", () => {
      const c = location.hash.replace("#", "");
      if (["todos", "masculino", "femenino", "unisex", "bodysplash"].includes(c)) {
        categoria = c;
        pastillas.forEach(x => x.setAttribute("aria-pressed", x.dataset.categoria === c));
        reiniciar();
      }
    });
  
    botonMas.addEventListener("click", () => {
      visibles += CONFIG.porPagina;
      pintar();
    });
  
    pintar();
  
  }
  
  /* =======================================================
     PÁGINAS DE CATEGORÍA
     ======================================================= */
  
  const contenedorCategoria = document.getElementById("categoriaContenido");
  
  if (contenedorCategoria && typeof PERFUMES !== "undefined") {
  
    const categoriaActual = contenedorCategoria.dataset.categoria;
    const listaCategoria = PERFUMES.filter(p => p.categoria === categoriaActual);
    const fichaCat = document.getElementById("ficha");
  
    function abrirFichaCat(codigo) {
      const p = PERFUMES.find(x => x.codigo === codigo);
      if (!p) return;
  
      fichaCat.innerHTML = `
        <button class="ficha__cerrar" id="cerrarFichaCat" aria-label="Cerrar">&times;</button>
        <div class="ficha__interior tarjeta--${p.categoria}">
          <div class="ficha__visual">${visualPerfume(p, "ficha")}</div>
          <div class="ficha__texto">
            <span class="ficha__codigo">Extracto ${p.codigo}</span>
            <p class="ficha__inspirado">Inspirado en</p>
            <h3>${p.nombre}</h3>
            <p class="ficha__ref">de ${p.referencia}</p>
            <dl class="ficha__lista">
              <div><dt>Familia</dt><dd>${p.familia}</dd></div>
              <div><dt>Perfil</dt><dd>${p.perfil}</dd></div>
              <div><dt>Uso</dt><dd>${p.uso}</dd></div>
              <div><dt>Género</dt><dd>${p.categoria[0].toUpperCase() + p.categoria.slice(1)}</dd></div>
            </dl>
            ${bloquePrecios(p)}
            <p class="ficha__nota">${p.nota}</p>
            <div class="ficha__acciones">
              <a class="boton" target="_blank" rel="noopener"
                 href="${enlaceWhatsApp(`Hola! Quiero consultar precio y disponibilidad de ${p.nombre} (extracto ${p.codigo}).`)}">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>`;
  
      fichaCat.showModal();
      document.getElementById("cerrarFichaCat").addEventListener("click", () => fichaCat.close());
    }
  
    function pintarEn(contenedor, lista) {
      contenedor.innerHTML = lista.map(p => `
        <article class="tarjeta tarjeta--${p.categoria}">
          <div class="tarjeta__visual">
            <span class="tarjeta__etiqueta">${p.subcategoria === "bodysplash" ? "Bodysplash" : p.categoria}</span>
            ${visualPerfume(p)}
          </div>
          <div class="tarjeta__cuerpo">
            <h3>${p.nombre}</h3>
            <p class="tarjeta__ref">Inspirado en ${p.referencia}</p>
            <p class="tarjeta__familia">${p.familia}</p>
            <p class="tarjeta__perfil">${p.perfil}</p>
            <div class="tarjeta__pie">
              <span>${p.uso}</span>
              <button class="tarjeta__ver" data-codigo="${p.codigo}">Ver ficha</button>
            </div>
          </div>
        </article>
      `).join("");
    }
  
    const contenedorUnico = document.getElementById("categoriaGrilla");
    const contenedorBodys  = document.getElementById("categoriaBodysplash");
    const contenedorFrag   = document.getElementById("categoriaFragancias");
  
    if (contenedorUnico) {
      pintarEn(contenedorUnico, listaCategoria);
    }
  
    if (contenedorBodys && contenedorFrag) {
      const bodys = listaCategoria.filter(p => p.subcategoria === "bodysplash");
      const frags = listaCategoria.filter(p => p.subcategoria !== "bodysplash");
  
      if (bodys.length === 0) {
        contenedorBodys.closest("section")?.remove();
      } else {
        pintarEn(contenedorBodys, bodys);
      }
  
      pintarEn(contenedorFrag, frags);
    }
  
    document.addEventListener("click", e => {
      const boton = e.target.closest("[data-codigo]");
      if (boton) abrirFichaCat(boton.dataset.codigo);
    });
  
    fichaCat.addEventListener("click", e => {
      if (e.target === fichaCat) fichaCat.close();
    });
  }
  
  /* =======================================================
     CARRUSEL DE DESTACADOS
     ======================================================= */
  
  const pistaCarrusel = document.getElementById("carruselPista");
  
  if (pistaCarrusel && typeof PERFUMES !== "undefined") {
  
    const btnPrev = document.getElementById("carruselPrev");
    const btnNext = document.getElementById("carruselNext");
    const puntos  = document.getElementById("carruselPuntos");
  
    const codigosDestacados = ["N148", "N100", "N194", "N36", "N88", "N81", "N213", "N44"];
    const codigosUnicos = [...new Set(codigosDestacados)];
  
    const destacados = codigosUnicos
      .map(c => PERFUMES.find(p => p.codigo === c))
      .filter(Boolean);
  
    pistaCarrusel.innerHTML = destacados.map(p => `
      <article class="tarjeta tarjeta--${p.categoria}">
        <div class="tarjeta__visual">
          <span class="tarjeta__etiqueta">${p.categoria}</span>
          ${visualPerfume(p)}
        </div>
        <div class="tarjeta__cuerpo">
          <h3>${p.nombre}</h3>
          <p class="tarjeta__ref">Inspirado en ${p.referencia}</p>
          <p class="tarjeta__familia">${p.familia}</p>
          <p class="tarjeta__perfil">${p.perfil}</p>
          <div class="tarjeta__pie">
            <span>${p.uso}</span>
            <a class="tarjeta__ver" target="_blank" rel="noopener"
               href="${enlaceWhatsApp(`Hola! Quiero consultar precio y disponibilidad de ${p.nombre} (extracto ${p.codigo}).`)}">
              Consultar
            </a>
          </div>
        </div>
      </article>
    `).join("");
  
    const tarjetas = pistaCarrusel.querySelectorAll(".tarjeta");
    const GAP = 20;
  
    function cantidadVisible() {
      const anchoPista = pistaCarrusel.clientWidth;
      const anchoTarjeta = tarjetas[0]?.getBoundingClientRect().width || 1;
      return Math.max(1, Math.round(anchoPista / (anchoTarjeta + GAP)));
    }
  
    function pasoScroll() {
      const visibles = cantidadVisible();
      const anchoTarjeta = tarjetas[0]?.getBoundingClientRect().width || 0;
      return visibles * (anchoTarjeta + GAP);
    }
  
    function pintarPuntos() {
      const visibles = cantidadVisible();
      const totalPaginas = Math.ceil(tarjetas.length / visibles);
      puntos.innerHTML = Array.from({ length: totalPaginas }, (_, i) =>
        `<button class="carrusel__punto" data-pagina="${i}" aria-label="Ir a la página ${i + 1}"></button>`
      ).join("");
  
      puntos.querySelectorAll(".carrusel__punto").forEach(btn => {
        btn.addEventListener("click", () => {
          const pagina = parseInt(btn.dataset.pagina, 10);
          const anchoTarjeta = tarjetas[0]?.getBoundingClientRect().width || 0;
          pistaCarrusel.scrollTo({
            left: pagina * visibles * (anchoTarjeta + GAP),
            behavior: "smooth"
          });
        });
      });
  
      actualizarPuntos();
    }
  
    function actualizarPuntos() {
      const visibles = cantidadVisible();
      const anchoTarjeta = tarjetas[0]?.getBoundingClientRect().width || 0;
      const paso = (anchoTarjeta + GAP) * visibles;
      const paginaActual = paso > 0 ? Math.round(pistaCarrusel.scrollLeft / paso) : 0;
  
      puntos.querySelectorAll(".carrusel__punto").forEach((btn, i) => {
        btn.setAttribute("aria-current", i === paginaActual ? "true" : "false");
      });
  
      const maxScroll = pistaCarrusel.scrollWidth - pistaCarrusel.clientWidth - 2;
      btnPrev.disabled = pistaCarrusel.scrollLeft <= 2;
      btnNext.disabled = pistaCarrusel.scrollLeft >= maxScroll;
    }
  
    btnPrev.addEventListener("click", () => {
      pistaCarrusel.scrollBy({ left: -pasoScroll(), behavior: "smooth" });
    });
    btnNext.addEventListener("click", () => {
      pistaCarrusel.scrollBy({ left: pasoScroll(), behavior: "smooth" });
    });
  
    pistaCarrusel.addEventListener("scroll", () => {
      window.requestAnimationFrame(actualizarPuntos);
    });
  
    let timeoutResize;
    window.addEventListener("resize", () => {
      clearTimeout(timeoutResize);
      timeoutResize = setTimeout(pintarPuntos, 150);
    });
  
    pintarPuntos();
  }
  
  /* =======================================================
     CARRUSEL DE TESTIMONIOS
     ======================================================= */
  
  const pistaTestimonios = document.getElementById("testiPista");
  
  if (pistaTestimonios) {
  
    const btnPrevT = document.getElementById("testiPrev");
    const btnNextT = document.getElementById("testiNext");
    const puntosT  = document.getElementById("testiPuntos");
  
    const testimonios = pistaTestimonios.querySelectorAll(".testimonio");
    const GAP_T = 32;
  
    function cantidadVisibleT() {
      const anchoPista = pistaTestimonios.clientWidth;
      const anchoItem = testimonios[0]?.getBoundingClientRect().width || 1;
      return Math.max(1, Math.round(anchoPista / (anchoItem + GAP_T)));
    }
  
    function pasoScrollT() {
      const visibles = cantidadVisibleT();
      const anchoItem = testimonios[0]?.getBoundingClientRect().width || 0;
      return visibles * (anchoItem + GAP_T);
    }
  
    function pintarPuntosT() {
      const visibles = cantidadVisibleT();
      const totalPaginas = Math.ceil(testimonios.length / visibles);
      puntosT.innerHTML = Array.from({ length: totalPaginas }, (_, i) =>
        `<button class="carrusel__punto" data-pagina="${i}" aria-label="Ir a la página ${i + 1}"></button>`
      ).join("");
  
      puntosT.querySelectorAll(".carrusel__punto").forEach(btn => {
        btn.addEventListener("click", () => {
          const pagina = parseInt(btn.dataset.pagina, 10);
          const anchoItem = testimonios[0]?.getBoundingClientRect().width || 0;
          pistaTestimonios.scrollTo({
            left: pagina * visibles * (anchoItem + GAP_T),
            behavior: "smooth"
          });
        });
      });
  
      actualizarPuntosT();
    }
  
    function actualizarPuntosT() {
      const visibles = cantidadVisibleT();
      const anchoItem = testimonios[0]?.getBoundingClientRect().width || 0;
      const paso = (anchoItem + GAP_T) * visibles;
      const paginaActual = paso > 0 ? Math.round(pistaTestimonios.scrollLeft / paso) : 0;
  
      puntosT.querySelectorAll(".carrusel__punto").forEach((btn, i) => {
        btn.setAttribute("aria-current", i === paginaActual ? "true" : "false");
      });
  
      const maxScroll = pistaTestimonios.scrollWidth - pistaTestimonios.clientWidth - 2;
      btnPrevT.disabled = pistaTestimonios.scrollLeft <= 2;
      btnNextT.disabled = pistaTestimonios.scrollLeft >= maxScroll;
    }
  
    btnPrevT.addEventListener("click", () => {
      pistaTestimonios.scrollBy({ left: -pasoScrollT(), behavior: "smooth" });
    });
    btnNextT.addEventListener("click", () => {
      pistaTestimonios.scrollBy({ left: pasoScrollT(), behavior: "smooth" });
    });
  
    pistaTestimonios.addEventListener("scroll", () => {
      window.requestAnimationFrame(actualizarPuntosT);
    });
  
    let timeoutResizeT;
    window.addEventListener("resize", () => {
      clearTimeout(timeoutResizeT);
      timeoutResizeT = setTimeout(pintarPuntosT, 150);
    });
  
    pintarPuntosT();
  }
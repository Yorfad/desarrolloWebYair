let contador = 0;



const contenedor = document.getElementById("container-cards");
const template = document.getElementById("card");
const fragmento = document.createDocumentFragment();


async function cargarProductosDesdeAPI(categoriaId = null) {
  const contenedor = document.getElementById("container-cards");
  const template = document.getElementById("card");
  const fragmento = document.createDocumentFragment();

  // Estado “cargando”
  contenedor.innerHTML = `<p class="text-muted">Cargando productos...</p>`;

  try {
    const respuesta = await fetch("https://backcvbgtmdesa.azurewebsites.net/api/productos");
    const productos = await respuesta.json();

    // Filtra por categoría si viene id
    const lista = categoriaId
      ? productos.filter(p => Number(p.CategoriaId) === Number(categoriaId))
      : productos;

    contenedor.innerHTML = "";

    lista.forEach(producto => {
      const clon = template.content.cloneNode(true);

      clon.querySelector(".img").src = producto.Imagen;
      clon.querySelector(".img").alt = producto.Nombre;
      clon.querySelector(".title").textContent = producto.Nombre;
      clon.querySelector(".descripction").textContent = producto.Descripcion;

      // Precios / oferta
      const price = clon.querySelector(".price");
      const priceOffer = clon.querySelector(".price-in-discount");

      price.textContent = `$${producto.Precio}`;
      priceOffer.textContent = "";

      if (producto.EnOferta === true && producto.PrecioOferta < producto.Precio) {
        price.classList.add("text-muted", "text-decoration-line-through");
        priceOffer.textContent = `$${producto.PrecioOferta}`;
        priceOffer.classList.add("fw-bold", "text-danger");
      } else {
        price.classList.remove("text-muted", "text-decoration-line-through");
        priceOffer.classList.remove("fw-bold", "text-danger");
      }

      clon.querySelector(".btn-buy").addEventListener("click", () => {
        alert(`Compraste: ${producto.Nombre}`);
      });

      fragmento.appendChild(clon);
    });

    contenedor.appendChild(fragmento);

    if (lista.length === 0) {
      contenedor.innerHTML = `<p class="text-muted">No hay productos en esta categoría.</p>`;
    }
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    contenedor.innerHTML = `<p class="text-danger">Ocurrió un error al cargar los productos.</p>`;
  }
}


cargarProductosDesdeAPI()

const contenedorCategories = document.getElementById("conteiner-categories");
const templateCategories = document.getElementById("categories");
const fragmentoCategories = document.createDocumentFragment();

async function cargarCategorias() {
  try {
    const respuesta = await fetch("https://backcvbgtmdesa.azurewebsites.net/api/categorias");
    const categorias = await respuesta.json();

    // Limpia y pinta
    contenedorCategories.innerHTML = "";
    categorias.forEach(cat => {
      const clon = templateCategories.content.cloneNode(true);
      const btn = clon.querySelector(".category-btn");
      const text = clon.querySelector(".category-text");

      text.textContent = cat.descripcion;
      btn.dataset.catId = cat.id_categoria; // <-- guardamos el id aquí

      fragmentoCategories.appendChild(clon);
    });

    contenedorCategories.appendChild(fragmentoCategories);

  } catch (error) {
    console.error("Error al cargar las categorías:", error);
    contenedorCategories.innerHTML = `<li class="text-danger">No se pudieron cargar las categorías.</li>`;
  }
}

cargarCategorias()

// Delegación de clics (un solo listener para todos los botones)
contenedorCategories.addEventListener("click", (e) => {
  const btn = e.target.closest(".category-btn");
  if (!btn) return;

  const categoriaId = Number(btn.dataset.catId);

  // Marcar activo (opcional visual)
  contenedorCategories.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // Repintar productos filtrados por categoría
  cargarProductosDesdeAPI(categoriaId);
});




/*
cargarProductosDesdeAPI();
const API = "https://backcvbgtmdesa.azurewebsites.net/api/productos";

async function buscarProductoPorNombre(nombre) {
  // Si tu API soporta filtro por query, úsalo:
  // const r = await fetch(`${API}?nombre=${encodeURIComponent(nombre)}`);
  // Si no, como demo: trae todo y filtra en cliente
  const r = await fetch(API);
  if (!r.ok) throw new Error(`GET productos falló: ${r.status}`);
  const lista = await r.json();
  return lista.find(p => (p.Nombre || "").trim().toLowerCase() === nombre.trim().toLowerCase());
}

async function crearProducto(payload) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const txt = await r.text();
    console.error("POST status:", r.status, r.statusText);
    console.error("POST body:", txt);
    throw new Error(`POST ${r.status}`);
  }
  return r.json().catch(() => ({}));
}

async function actualizarProducto(id, payload) {
  const r = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const txt = await r.text();
    console.error("PUT status:", r.status, r.statusText);
    console.error("PUT body:", txt);
    throw new Error(`PUT ${r.status}`);
  }
  return r.json().catch(() => ({}));
}

async function upsertProducto() {
  const payload = {
    // No envíes Id al crear si el server lo autogenera
    CategoriaId: 1,
    Nombre: "Auriculares Bluetooth",
    Descripcion: "Auriculares inalámbricos con cancelación de ruido y batería de larga duración.",
    Precio: 45.99,
    EnOferta: true,
    PrecioOferta: 35.99,
    Imagen: "https://placehold.co/300x200?text=Auriculares"
  };

  try {
    // 1) verifica si ya existe por Nombre (ajusta este criterio si tu API usa SKU)
    const existente = await buscarProductoPorNombre(payload.Nombre);
    if (existente) {
      // 2) si existe, decide: ¿actualizar o avisar?
      // Opción A: actualizar
      const actualizado = await actualizarProducto(existente.Id, { ...existente, ...payload });
      console.log("Actualizado:", actualizado);
      alert("Producto ya existía, se actualizó correctamente.");
    } else {
      // 3) crear
      const creado = await crearProducto(payload);
      console.log("Creado:", creado);
      alert("Producto creado correctamente.");
    }
  } catch (e) {
    console.error("Upsert falló:", e);
    if (String(e.message).includes("POST 409")) {
      alert("Conflicto al crear: ya existe un producto con los mismos datos. Intenta cambiar el Nombre o usa actualización.");
    } else {
      alert("Error al procesar el producto. Revisa consola.");
    }
  }
}

upsertProducto();

*/
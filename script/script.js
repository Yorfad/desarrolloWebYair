let contador = 0;



const contenedor = document.getElementById("container-cards");
const template = document.getElementById("card");
const fragmento = document.createDocumentFragment();


async function cargarProductosDesdeAPI() {
  try {
    const respuesta = await fetch("https://backcvbgtmdesa.azurewebsites.net/api/productos"); // ✅ tu URL real aquí
    const productos = await respuesta.json();

    productos.forEach(producto => {
      const clon = template.content.cloneNode(true);

      clon.querySelector(".img").src = producto.Imagen;
      clon.querySelector(".img").alt = producto.Nombre;
      clon.querySelector(".title").textContent = producto.Nombre;
      clon.querySelector(".descripction").textContent = producto.Descripcion;
      clon.querySelector(".price").textContent = '$' + producto.Precio;
      if(producto.EnOferta === true) {
        clon.querySelector(".price").classList.add("text-danger");
        clon.querySelector(".price-in-discount").textContent = '$' + producto.PrecioOferta
      }

      clon.querySelector(".btn-buy").addEventListener("click", () => {
        alert(`Compraste: ${producto.Nombre}`);
        contador++;
        document.getElementById('contador-carrito').textContent = contador;
      });

      fragmento.appendChild(clon);
    });

    contenedor.appendChild(fragmento);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    contenedor.innerHTML = `<p class="text-danger">Ocurrió un error al cargar los productos.</p>`;
  }
}

cargarProductosDesdeAPI();

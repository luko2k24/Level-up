document.addEventListener("DOMContentLoaded", () => {
  const carritoBody = document.getElementById("carrito-body");
  const totalPagar = document.getElementById("total-pagar");
  const totalOriginal = document.getElementById("total-original");
  const descuentoAplicado = document.getElementById("descuento-aplicado");

  // Lee carrito desde localStorage o crea un carrito vacío
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Verifica si hay un descuento disponible (desde localStorage)
  const descuentoDuoc = localStorage.getItem("descuentoDuoc") === "true";

  // Formatea $ en CLP
  const fmt = (n) => `$${Number(n).toLocaleString("es-CL")}`;

  // Renderiza todas las filas del carrito
  function render() {
    carritoBody.innerHTML = "";

    if (carrito.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="6" class="text-center text-muted">
          Tu carrito está vacío. Ve a <a href="productos.html">Productos</a> para agregar ítems.
        </td>`;
      carritoBody.appendChild(tr);
      totalPagar.textContent = fmt(0);
      totalOriginal.textContent = fmt(0);
      descuentoAplicado.textContent = fmt(0);
      return;
    }

    let total = 0;
    let totalSinDescuento = 0;

    carrito.forEach((item, idx) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      totalSinDescuento += subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.categoria}</td>
        <td>${fmt(item.precio)}</td>
        <td>
          <input type="number" class="form-control text-center" value="${item.cantidad}" min="1" data-index="${idx}">
        </td>
        <td>${fmt(subtotal)}</td>
        <td>
          <button class="btn btn-danger btn-sm" data-index="${idx}">Eliminar</button>
        </td>
      `;
      carritoBody.appendChild(tr);
    });

    totalOriginal.textContent = fmt(totalSinDescuento);

    // Aplica el descuento si es válido
    if (descuentoDuoc) {
      total = total * 0.8;  // Aplica el 20% de descuento
      descuentoAplicado.textContent = fmt(totalSinDescuento - total); // Muestra cuánto se ahorra
    } else {
      descuentoAplicado.textContent = fmt(0); // No hay descuento si no es usuario de Duoc UC
    }

    totalPagar.textContent = fmt(total);

    // Guarda el carrito actualizado en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // Delegación: Eliminar producto
  carritoBody.addEventListener("click", (e) => {
    if (e.target.matches(".btn-danger")) {
      const i = Number(e.target.dataset.index); // Obtén el índice del producto
      carrito.splice(i, 1); // Elimina el producto del carrito (array)
      render(); // Vuelve a renderizar el carrito

      // Elimina el carrito actualizado de localStorage
      localStorage.setItem("carrito", JSON.stringify(carrito));

      // Actualiza el contador del carrito en la navbar
      actualizarContadorCarrito();
    }
  });

  // Delegación: Cambiar cantidad del producto
  carritoBody.addEventListener("input", (e) => {
    if (e.target.tagName === "INPUT") {
      const index = e.target.dataset.index;
      const cantidad = Math.max(1, parseInt(e.target.value, 10)); // Asegura que la cantidad no sea menor a 1
      carrito[index].cantidad = cantidad;
      render(); // Vuelve a renderizar el carrito

      // Actualiza el carrito en localStorage
      localStorage.setItem("carrito", JSON.stringify(carrito));

      // Actualiza el contador del carrito en la navbar
      actualizarContadorCarrito();
    }
  });

  // Función para actualizar el contador de productos en la navbar
  function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    document.getElementById("cart-count").textContent = totalItems;
  }

  // Función para vaciar el carrito
  document.getElementById("btn-vaciar").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres vaciar el carrito?")) {
      carrito = [];
      render(); // Renderiza el carrito vacío

      // Elimina el carrito en localStorage
      localStorage.setItem("carrito", JSON.stringify([]));

      // Actualiza el contador del carrito en la navbar
      actualizarContadorCarrito();
    }
  });

  // Función para finalizar la compra
  document.querySelector(".btn-success").addEventListener("click", () => {
    // Verifica si el carrito está vacío
    if (carrito.length === 0) {
      alert("Tu carrito está vacío. Agrega productos para realizar la compra.");
      return;
    }

    // Mostrar mensaje de confirmación
    const totalCompra = parseFloat(totalPagar.textContent.replace("$", "").replace(".", ""));
    const mensaje = `¡Gracias por tu compra!\n\nTotal a pagar: ${fmt(totalCompra)}\n\nTu compra ha sido procesada correctamente.`;

    // Muestra el mensaje de agradecimiento
    alert(mensaje);

    // Vaciar el carrito y actualizar el localStorage
    localStorage.setItem("carrito", JSON.stringify([]));

    // Actualiza el contador del carrito en la navbar
    actualizarContadorCarrito();

    // Actualiza la vista del carrito
    render();
  });

  // Inicializa la renderización del carrito
  render();
  actualizarContadorCarrito();
});

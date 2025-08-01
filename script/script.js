let contador = 0;
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', () => {
    contador++;
    document.getElementById('contador-carrito').textContent = contador;
  });
});

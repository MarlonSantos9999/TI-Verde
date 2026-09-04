// Atualiza o ano do rodapé automaticamente.
document.querySelector("#ano").textContent = new Date().getFullYear();

// Abre e fecha o menu em telas pequenas.
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");

botaoMenu.addEventListener("click", () => {
  const menuEstaAberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", menuEstaAberto);
  botaoMenu.setAttribute("aria-label", menuEstaAberto ? "Fechar menu" : "Abrir menu");
});

// Fecha o menu ao selecionar uma seção da página.
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  });
});

// Mostra cada bloco suavemente quando ele aparece na tela.
const elementosParaRevelar = document.querySelectorAll(".reveal");
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.14 }
);

elementosParaRevelar.forEach((elemento) => observador.observe(elemento));

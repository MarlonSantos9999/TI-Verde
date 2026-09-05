// Atualiza o ano do rodapé automaticamente.
document.querySelector("#ano").textContent = new Date().getFullYear();

// Abre e fecha o menu em telas pequenas.
const botaoMenu = document.querySelector(".menu-botao");
const menu = document.querySelector(".menu");

if (botaoMenu && menu) {
  botaoMenu.addEventListener("click", () => {
    const menuEstaAberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", menuEstaAberto);
    botaoMenu.setAttribute("aria-label", menuEstaAberto ? "Fechar menu" : "Abrir menu");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.setAttribute("aria-label", "Abrir menu");
    });
  });
}

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

// Formulário do questionário: salva localmente, exporta CSV e pode enviar para Google Sheets.
const formularioQuestionario = document.getElementById("form-questionario");
const botaoExportarCsv = document.getElementById("exportar-csv");
const mensagemFormulario = document.getElementById("mensagem-formulario");
const chaveLocalStorage = "ti-verde-questionario";
const urlPlanilha = "https://script.google.com/macros/s/AKfycbypQFd88vUVaVVVvvcOnGbtHnhtuP8R9P_uJLa8PTfvXyRXrgtOucpftYbMbJic2GGx/exec";

function obterDadosFormulario() {
  const formData = new FormData(formularioQuestionario);
  const dados = Object.fromEntries(formData.entries());

  return {
    dataEnvio: new Date().toISOString(),
    ...dados,
  };
}

function salvarLocalmente(dados) {
  const respostasSalvas = JSON.parse(localStorage.getItem(chaveLocalStorage) || "[]");
  respostasSalvas.push(dados);
  localStorage.setItem(chaveLocalStorage, JSON.stringify(respostasSalvas));
}

function criarCsv(dados) {
  const cabecalho = Object.keys(dados);
  const valores = cabecalho.map((chave) => {
    const valor = dados[chave] ?? "";
    return `"${String(valor).replace(/"/g, '""')}"`;
  });

  return [cabecalho.join(","), valores.join(",")].join("\n");
}

function exportarCsv(dados) {
  const blob = new Blob([criarCsv(dados)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "questionario-ti-verde.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function enviarParaPlanilha(dados) {
  if (!urlPlanilha || urlPlanilha.includes("COLOQUE_A_URL")) {
    return false;
  }

  try {
    const resposta = await fetch(urlPlanilha, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    return resposta.ok;
  } catch (error) {
    console.error("Erro ao enviar para planilha:", error);
    return false;
  }
}

function mostrarMensagem(texto) {
  if (!mensagemFormulario) return;
  mensagemFormulario.textContent = texto;
}

formularioQuestionario?.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!formularioQuestionario.checkValidity()) {
    formularioQuestionario.reportValidity();
    return;
  }

  const dados = obterDadosFormulario();
  salvarLocalmente(dados);
  exportarCsv(dados);

  const envioOk = await enviarParaPlanilha(dados);
  mostrarMensagem(
    envioOk
      ? "Respostas salvas com sucesso e enviadas para a planilha."
      : "Respostas salvas localmente e exportadas em CSV. Para enviar para uma planilha online, configure a URL do Google Apps Script."
  );

  formularioQuestionario.reset();
});

botaoExportarCsv?.addEventListener("click", () => {
  const dadosAtuais = obterDadosFormulario();
  exportarCsv(dadosAtuais);
  mostrarMensagem("CSV gerado com as respostas atuais.");
});

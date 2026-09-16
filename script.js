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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (evento) => {
    const destino = document.querySelector(link.getAttribute("href"));
    if (!destino) return;

    evento.preventDefault();

    const inicio = window.scrollY;
    const topo = Math.max(0, destino.getBoundingClientRect().top + inicio - 18);
    const distancia = topo - inicio;
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const atualizarHash = () => window.history.pushState(null, "", link.getAttribute("href"));

    if (reduzirMovimento || Math.abs(distancia) < 4) {
      window.scrollTo(0, topo);
      atualizarHash();
    } else {
      const duracao = Math.min(1400, Math.max(800, Math.abs(distancia) * 0.65));
      const inicioAnimacao = performance.now();
      const rolarComCalma = (agora) => {
        const progresso = Math.min((agora - inicioAnimacao) / duracao, 1);
        const suavizado = progresso < 0.5
          ? 4 * progresso ** 3
          : 1 - ((-2 * progresso + 2) ** 3) / 2;

        window.scrollTo(0, inicio + distancia * suavizado);

        if (progresso < 1) {
          requestAnimationFrame(rolarComCalma);
        } else {
          atualizarHash();
        }
      };

      requestAnimationFrame(rolarComCalma);
    }

    destino.classList.remove("alvo-suave");
    requestAnimationFrame(() => destino.classList.add("alvo-suave"));
    window.setTimeout(() => destino.classList.remove("alvo-suave"), 1200);
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

const contadorLixoEletronico = document.querySelector(".circulo-dados strong[data-valor]");

function animarContador(elemento) {
  const valorFinal = Number(elemento.dataset.valor);
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduzirMovimento) {
    elemento.textContent = valorFinal;
    return;
  }

  const inicio = performance.now();
  const atualizarContador = (agora) => {
    const progresso = Math.min((agora - inicio) / 1400, 1);
    const suavizado = 1 - (1 - progresso) ** 3;
    elemento.textContent = Math.round(valorFinal * suavizado);

    if (progresso < 1) {
      requestAnimationFrame(atualizarContador);
    }
  };

  requestAnimationFrame(atualizarContador);
}

if (contadorLixoEletronico) {
  const observadorContador = new IntersectionObserver(
    (entradas, observadorAtual) => {
      if (entradas.some((entrada) => entrada.isIntersecting)) {
        animarContador(contadorLixoEletronico);
        observadorAtual.disconnect();
      }
    },
    { threshold: 0.6 }
  );

  observadorContador.observe(contadorLixoEletronico);
}

const modalInfo = document.querySelector("#modal-info");
const botoesInfo = document.querySelectorAll(".ponto-interativo");
const modalInfoTitulo = document.querySelector("#modal-info-titulo");
const modalInfoTexto = document.querySelector("#modal-info-texto");
const modalInfoDetalhe = document.querySelector("#modal-info-detalhe");
const botaoFecharModal = document.querySelector(".modal-fechar");

const informacoesInterativas = {
  servidores: {
    etiqueta: "INFRAESTRUTURA EFICIENTE",
    titulo: "Servidores que usam menos energia",
    texto: "Equipamentos modernos e bem dimensionados entregam o mesmo processamento com menor consumo de eletricidade.",
    detalhe: "Boas práticas: virtualização, manutenção preventiva e monitoramento de desempenho.",
  },
  conexao: {
    etiqueta: "INTEGRAÇÃO INTELIGENTE",
    titulo: "Dados conectados a decisões melhores",
    texto: "Monitorar o fluxo de energia e processamento ajuda a encontrar desperdícios e ajustar os recursos de acordo com a demanda.",
    detalhe: "Otimizar software também é uma ação de sustentabilidade: menos processamento significa menos energia.",
  },
  solar: {
    etiqueta: "ENERGIA RENOVÁVEL",
    titulo: "Sol como fonte de energia limpa",
    texto: "Painéis solares podem abastecer parte da infraestrutura digital e reduzir as emissões associadas ao consumo elétrico.",
    detalhe: "A combinação com armazenamento e planejamento de demanda torna o uso da energia renovável mais eficiente.",
  },
};

function abrirModalInfo(tipo) {
  const informacao = informacoesInterativas[tipo];
  if (!modalInfo || !informacao) return;

  document.querySelector("#modal-info-etiqueta").textContent = informacao.etiqueta;
  modalInfoTitulo.textContent = informacao.titulo;
  modalInfoTexto.textContent = informacao.texto;
  modalInfoDetalhe.textContent = informacao.detalhe;
  modalInfo.showModal();
  botaoFecharModal?.focus();
}

botoesInfo.forEach((botao) => {
  botao.addEventListener("click", () => abrirModalInfo(botao.dataset.info));
});

botaoFecharModal?.addEventListener("click", () => modalInfo?.close());

modalInfo?.addEventListener("click", (evento) => {
  if (evento.target === modalInfo) modalInfo.close();
});

// Formulário do questionário: salva localmente e pode enviar para Google Sheets.
const formularioQuestionario = document.getElementById("form-questionario");
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

async function enviarParaPlanilha(dados) {
  if (!urlPlanilha || urlPlanilha.includes("COLOQUE_A_URL")) {
    return false;
  }

  try {
    const resposta = await fetch(urlPlanilha, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(dados),
    });

    return resposta.type === "opaque" || resposta.ok;
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

  const envioOk = await enviarParaPlanilha(dados);
  mostrarMensagem(
    envioOk
      ? "Respostas salvas com sucesso e enviadas para a planilha."
      : "Respostas salvas localmente. Para enviar para uma planilha online, configure a URL do Google Apps Script."
  );

  formularioQuestionario.reset();
});

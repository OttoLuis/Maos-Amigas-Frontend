import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../services/api";
import "./ChatIA.css";

const LOGO = "/logo-maos-amigas.png";
const LIMITE = 2000;
const TIMEOUT_MS = 45000;
const AGNO_API_URL = import.meta.env.VITE_AGNO_API_URL || "http://localhost:8000";
const ID_INICIAL = "inicial";

class RespostaInvalidaError extends Error {}

const markdownComponents = {
  table: ({ node, ...props }) => (
    <div className="chat-table-wrapper">
      <table {...props} />
    </div>
  ),
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
  // Não carrega imagens vindas do texto da IA
  img: () => null,
};

function hora() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function criarMensagemInicial() {
  return {
    id: ID_INICIAL,
    role: "assistant",
    hora: hora(),
    content:
      "Olá! Eu sou o assistente virtual do Mãos Amigas. Posso ajudar você a encontrar psicólogos e consultar horários para atendimento. Como posso ajudar hoje?",
  };
}

const sugestoes = [
  {
    icone: "user",
    titulo: "Encontrar um psicólogo",
    descricao: "Veja quem atende na plataforma",
    texto: "Quero encontrar um psicólogo",
  },
  {
    icone: "clock",
    titulo: "Ver horários",
    descricao: "Consulte a disponibilidade",
    texto: "Quais horários estão disponíveis?",
  },
  {
    icone: "calendar",
    titulo: "Como agendar",
    descricao: "Entenda o passo a passo",
    texto: "Como funciona o agendamento?",
  },
];

const beneficios = [
  {
    titulo: "Encontre profissionais",
    texto: "Conheça os psicólogos disponíveis na plataforma.",
  },
  {
    titulo: "Consulte horários",
    texto: "Veja opções de atendimento conforme a disponibilidade.",
  },
  {
    titulo: "Organize sua consulta",
    texto: "Receba orientações para realizar seu agendamento.",
  },
];

const propsIcone = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function IconeSugestao({ tipo }) {
  if (tipo === "user") {
    return (
      <svg {...propsIcone}>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" />
      </svg>
    );
  }

  if (tipo === "clock") {
    return (
      <svg {...propsIcone}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    );
  }

  return (
    <svg {...propsIcone}>
      <rect x="4" y="5.5" width="16" height="14" rx="3" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  );
}

function IconeCopiar({ copiado }) {
  if (copiado) {
    return (
      <svg {...propsIcone}>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    );
  }

  return (
    <svg {...propsIcone}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5v-1a2.5 2.5 0 0 0-2.5-2.5H7A2.5 2.5 0 0 0 4.5 7.5v6A2.5 2.5 0 0 0 7 16h1.5" />
    </svg>
  );
}

function reduzirMovimento() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function ChatIA() {
  const [mensagens, setMensagens] = useState(() => [criarMensagemInicial()]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiadoId, setCopiadoId] = useState(null);
  const [reservaPendente, setReservaPendente] = useState(null);
  const [confirmandoReserva, setConfirmandoReserva] = useState(false);
  const listaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listaRef.current?.scrollTo({
      top: listaRef.current.scrollHeight,
      behavior: reduzirMovimento() ? "auto" : "smooth",
    });
  }, [mensagens, carregando, erro]);

  // O campo cresce conforme o texto, até 120px
  useEffect(() => {
    const campo = inputRef.current;
    if (!campo) return;
    campo.style.height = "auto";
    campo.style.height = `${Math.min(campo.scrollHeight, 120)}px`;
  }, [texto]);

  async function enviarMensagem(conteudo = texto, reenvio = false) {
    const mensagem = conteudo.trim();

    if (!mensagem || carregando) return;

    setErro("");

    if (!reenvio) {
      setTexto("");
      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: Date.now(),
          role: "user",
          hora: hora(),
          content: mensagem,
        },
      ]);
    }

    setCarregando(true);

    try {
      const response = await api.post(
        `${AGNO_API_URL}/agentes/acolhimento`,
        { mensagem },
        { timeout: TIMEOUT_MS }
      );

      if (response.data?.reserva_pendente?.id) {
        setReservaPendente(response.data.reserva_pendente);
      }

      const resposta =
        response.data?.resposta ??
        response.data?.mensagem ??
        (typeof response.data === "string" ? response.data : "");

      if (!resposta) {
        throw new RespostaInvalidaError(
          "O assistente não retornou uma resposta válida. Tente novamente."
        );
      }

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: Date.now() + 1,
          role: "assistant",
          hora: hora(),
          content: resposta,
        },
      ]);
    } catch (error) {
      const status = error.response?.status;

      let mensagemErro =
        "Não foi possível enviar sua mensagem. Tente novamente.";

      if (error instanceof RespostaInvalidaError) {
        mensagemErro = error.message;
      } else if (error.code === "ECONNABORTED") {
        mensagemErro =
          "O assistente demorou mais que o esperado para responder. Tente novamente.";
      } else if (!error.response) {
        mensagemErro =
          "Não consegui conectar ao servidor. Verifique sua conexão e tente novamente.";
      } else if (status === 401) {
        mensagemErro =
          "Sua sessão não está autenticada ou expirou. Entre novamente na sua conta.";
      } else if (status === 403) {
        mensagemErro =
          "Você não tem permissão para acessar o assistente. Confira sua conta.";
      } else if (status === 429) {
        mensagemErro =
          "O assistente está com muitas solicitações no momento. Aguarde cerca de 15 segundos e tente novamente.";
      } else if (status >= 500) {
        mensagemErro =
          "O servidor encontrou um problema ao processar sua mensagem. Tente novamente em instantes.";
      }

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
    }
  }

  async function confirmarReserva() {
    if (!reservaPendente?.id || confirmandoReserva) return;

    setConfirmandoReserva(true);
    setErro("");

    try {
      const response = await api.post(
        `${AGNO_API_URL}/agentes/acolhimento/confirmar`,
        { reserva_id: reservaPendente.id },
        { timeout: TIMEOUT_MS }
      );

      setMensagens((anteriores) => [
        ...anteriores,
        {
          id: Date.now(),
          role: "assistant",
          hora: hora(),
          content: response.data?.mensagem || "Consulta confirmada com sucesso.",
        },
      ]);
      setReservaPendente(null);
    } catch (error) {
      const status = error.response?.status;
      const mensagemErro = status === 409
        ? "Esse horário acabou de ficar indisponível. Peça ao assistente para consultar outros horários."
        : status === 410
          ? "A reserva expirou. Consulte os horários novamente para criar uma nova reserva."
          : status === 401
            ? "Sua sessão expirou. Entre novamente na sua conta."
            : error.response?.data?.detail || "Não foi possível confirmar a consulta. Tente novamente.";
      setErro(mensagemErro);
      if (status === 409 || status === 410) setReservaPendente(null);
    } finally {
      setConfirmandoReserva(false);
    }
  }

  function novaConversa() {
    if (carregando || confirmandoReserva) return;
    setMensagens([criarMensagemInicial()]);
    setErro("");
    setTexto("");
    setReservaPendente(null);
    inputRef.current?.focus();
  }

  async function copiar(item) {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiadoId(item.id);
      setTimeout(
        () => setCopiadoId((atual) => (atual === item.id ? null : atual)),
        1800
      );
    } catch {
      // Sem permissão para a área de transferência: ignora
    }
  }

  function lidarComTecla(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      enviarMensagem();
    }
  }

  const ultima = mensagens[mensagens.length - 1];
  const podeReenviar = ultima?.role === "user";
  const conversaNova = mensagens.length === 1;
  const mostrarAtalhos =
    !conversaNova && ultima?.role === "assistant" && !carregando && !erro;

  return (
    <div className="chat-page">
      <header className="chat-topbar">
        <Link to="/home" className="chat-back" aria-label="Voltar ao início">
          <svg {...propsIcone} strokeWidth={1.9}>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          <span>Voltar ao início</span>
        </Link>

        <Link
          to="/home"
          className="chat-brand"
          aria-label="Mãos Amigas - ir para o início"
        >
          <img src={LOGO} alt="" className="chat-brand-logo" />
          <span className="chat-brand-text">
            <strong>Mãos Amigas</strong>
            <span>Assistente virtual</span>
          </span>
        </Link>

        <Link to="/psicologos" className="chat-professionals-link">
          <svg {...propsIcone}>
            <circle cx="12" cy="8" r="3.6" />
            <path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" />
          </svg>
          <span>Encontrar psicólogo</span>
        </Link>
      </header>

      <main className="chat-workspace">
        <div className="chat-intro">
          <h1>Você não precisa resolver tudo sozinho.</h1>
          <p className="chat-intro-description">
            Converse com nosso assistente para conhecer os profissionais e
            encontrar possibilidades de atendimento psicológico.
          </p>

          <ol className="chat-benefits">
            {beneficios.map((item, i) => (
              <li className="chat-benefit" key={item.titulo}>
                <span className="chat-benefit-number" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <strong>{item.titulo}</strong>
                  <p>{item.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="chat-emergency">
            <strong>Precisa de ajuda agora?</strong>
            <ul>
              <li>
                <a href="tel:188">188</a>
                <span>CVV · apoio emocional, 24h</span>
              </li>
              <li>
                <a href="tel:192">192</a>
                <span>SAMU · emergência médica</span>
              </li>
              <li>
                <a href="tel:180">180</a>
                <span>Central de Atendimento à Mulher</span>
              </li>
            </ul>
          </div>
        </div>

        <section className="chat-panel" aria-label="Conversa com o assistente">
          <div className="chat-panel-header">
            <div className="chat-avatar" aria-hidden="true">
              <img src={LOGO} alt="" />
            </div>
            <div className="chat-panel-title">
              <strong>Assistente Mãos Amigas</strong>
              <span>Assistente virtual com inteligência artificial</span>
            </div>

            {!conversaNova && (
              <button
                type="button"
                className="chat-new-button"
                onClick={novaConversa}
                disabled={carregando}
              >
                Nova conversa
              </button>
            )}
          </div>

          <div
            className="chat-messages"
            ref={listaRef}
            role="log"
            aria-live="polite"
            aria-busy={carregando}
          >
            <div className="chat-date-divider">
              <span>Hoje</span>
            </div>

            {mensagens.map((item) => (
              <div
                key={item.id}
                className={`chat-message-row ${
                  item.role === "user"
                    ? "chat-message-user"
                    : "chat-message-assistant"
                }`}
              >
                {item.role === "assistant" && (
                  <div className="chat-message-avatar" aria-hidden="true">
                    <img src={LOGO} alt="" />
                  </div>
                )}

                <div className="chat-message-content">
                  <span className="chat-sender">
                    {item.role === "user" ? "Você" : "Mãos Amigas"}
                    <time>{item.hora}</time>
                  </span>
                  <div className="chat-bubble">
                    {item.role === "assistant" ? (
                      <div className="chat-markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      item.content
                    )}
                  </div>

                  {item.role === "assistant" && item.id !== ID_INICIAL && (
                    <button
                      type="button"
                      className="chat-copy"
                      onClick={() => copiar(item)}
                      aria-label={
                        copiadoId === item.id
                          ? "Resposta copiada"
                          : "Copiar resposta"
                      }
                    >
                      <IconeCopiar copiado={copiadoId === item.id} />
                      {copiadoId === item.id ? "Copiado" : "Copiar"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {carregando && (
              <div className="chat-message-row chat-message-assistant">
                <div className="chat-message-avatar" aria-hidden="true">
                  <img src={LOGO} alt="" />
                </div>
                <div className="chat-message-content">
                  <span className="chat-sender">Mãos Amigas</span>
                  <div className="chat-bubble chat-typing" role="status">
                    <span className="chat-sr-only">Assistente digitando</span>
                    <span className="chat-dot" aria-hidden="true" />
                    <span className="chat-dot" aria-hidden="true" />
                    <span className="chat-dot" aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}

            {reservaPendente && (
              <div className="chat-error chat-reservation-pending" role="status">
                <p><strong>Reserva aguardando sua confirmação.</strong> O horário fica reservado temporariamente por até 10 minutos. A consulta ainda não foi agendada.</p>
                <button
                  type="button"
                  onClick={confirmarReserva}
                  disabled={confirmandoReserva}
                >
                  {confirmandoReserva ? "Confirmando..." : "Confirmar consulta"}
                </button>
              </div>
            )}

            {erro && (
              <div className="chat-error" role="alert">
                <p>{erro}</p>
                {podeReenviar && (
                  <button
                    type="button"
                    onClick={() => enviarMensagem(ultima.content, true)}
                    disabled={carregando}
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}

            {mostrarAtalhos && (
              <div className="chat-quick-actions">
                <Link to="/psicologos">Ver psicólogos</Link>
                <Link to="/consultas">Minhas consultas</Link>
              </div>
            )}

            {conversaNova && !carregando && (
              <div className="chat-suggestions">
                <h2>Por onde você quer começar?</h2>
                <div className="chat-suggestion-list">
                  {sugestoes.map((sugestao) => (
                    <button
                      key={sugestao.titulo}
                      type="button"
                      onClick={() => enviarMensagem(sugestao.texto)}
                    >
                      <span className="chat-suggestion-icon">
                        <IconeSugestao tipo={sugestao.icone} />
                      </span>
                      <strong>{sugestao.titulo}</strong>
                      <small>{sugestao.descricao}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              enviarMensagem();
            }}
          >
            <label className="chat-sr-only" htmlFor="chat-message">
              Sua mensagem para o assistente
            </label>
            <div className="chat-input-wrapper">
              <textarea
                id="chat-message"
                ref={inputRef}
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                onKeyDown={lidarComTecla}
                placeholder="Escreva sua mensagem..."
                rows={1}
                maxLength={LIMITE}
                disabled={carregando}
              />
              <button
                type="submit"
                className="chat-send-button"
                disabled={!texto.trim() || carregando}
                aria-label="Enviar mensagem"
                title="Enviar mensagem"
              >
                <svg {...propsIcone}>
                  <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <div className="chat-composer-footer">
              <span>Enter envia · Shift + Enter quebra a linha</span>
              {texto.length > LIMITE * 0.8 && (
                <span className="chat-counter">
                  {texto.length}/{LIMITE}
                </span>
              )}
            </div>
          </form>

          <p className="chat-disclaimer">
            O assistente oferece orientações gerais e não substitui o
            acompanhamento de um profissional de psicologia.
            <span className="chat-emergency-line">
              Em emergência, ligue <a href="tel:192">192</a> (SAMU) ou{" "}
              <a href="tel:188">188</a> (CVV). Violência contra a mulher:{" "}
              <a href="tel:180">180</a>.
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HeartHandshake,
    UserRound,
    MapPin,
    Eye,
    EyeOff,
    LoaderCircle,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import "./Cadastro.css";

const API_URL = "http:" + "/" + "/" + "localhost:8080" + "/auth/register";

const initialForm = {
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    dataNascimento: "",
    contatoPessoal: "",
    contatoConfianca: "",
    endereco: {
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "AL",
        cep: "",
    },
};

export default function Cadastro() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    function atualizarCampo(event) {
        const { name, value } = event.target;

        if (name.startsWith("endereco.")) {
            const campo = name.split(".")[1];

            setForm((anterior) => ({
                ...anterior,
                endereco: {
                    ...anterior.endereco,
                    [campo]: value,
                },
            }));
        } else {
            setForm((anterior) => ({
                ...anterior,
                [name]: value,
            }));
        }
    }

    async function cadastrar(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");

        if (form.senha.length < 6) {
            setErro("A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                const detalhes = Array.isArray(dados.detalhes)
                    ? dados.detalhes
                    : Array.isArray(dados.errors)
                        ? dados.errors
                        : [];

                const mensagemDetalhes = detalhes
                    .map((item) => {
                        if (typeof item === "string") {
                            return item;
                        }

                        return item.defaultMessage
                            || item.message
                            || item.mensagem
                            || "";
                    })
                    .filter(Boolean)
                    .join(". ");

                const mensagem =
                    mensagemDetalhes
                    || dados.mensagem
                    || dados.message
                    || dados.detail
                    || (resposta.status === 409
                        ? "E-mail ou CPF já cadastrado. Verifique os dados."
                        : resposta.status === 400
                            ? "Existem dados inválidos. Confira os campos."
                            : resposta.status >= 500
                                ? "O servidor encontrou um problema. Tente novamente mais tarde."
                                : "Não foi possível realizar o cadastro.");

                throw new Error(mensagem);
            }

            setSucesso("Conta criada com sucesso! Redirecionando para o login...");

            window.setTimeout(() => navigate("/login"), 1800);
        } catch (error) {
            setErro(
                error instanceof TypeError
                    ? "Não foi possível conectar ao servidor. Confira se a API está ligada."
                    : error.message || "Não foi possível realizar o cadastro."
            );
        } finally {
            setCarregando(false);
        }
    }

    function campo(nome, titulo, tipo = "text", obrigatorio = true, placeholder = "") {
        const valor = nome.startsWith("endereco.")
            ? form.endereco[nome.split(".")[1]]
            : form[nome];

        const autocomplete = {
            nome: "name",
            email: "email",
            senha: "new-password",
            cpf: "off",
            dataNascimento: "bday",
            contatoPessoal: "tel",
            contatoConfianca: "off",
            "endereco.rua": "address-line1",
            "endereco.numero": "off",
            "endereco.bairro": "address-level3",
            "endereco.cidade": "address-level2",
            "endereco.estado": "address-level1",
            "endereco.cep": "postal-code",
        };

        return (
            <div className={`cad-field ${nome === "senha" ? "cad-password-field" : ""}`} key={nome}>
                <label htmlFor={nome}>
                    {titulo}
                    {obrigatorio && <span className="cad-required"> *</span>}
                </label>

                <div className="cad-input-wrap">
                    <input
                        id={nome}
                        name={nome}
                        type={nome === "senha" && mostrarSenha ? "text" : tipo}
                        value={valor}
                        onChange={atualizarCampo}
                        required={obrigatorio}
                        minLength={nome === "senha" ? 6 : undefined}
                        autoComplete={autocomplete[nome] || "off"}
                        placeholder={placeholder}
                    />

                    {nome === "senha" && (
                        <button
                            className="cad-eye-button"
                            type="button"
                            onClick={() => setMostrarSenha((atual) => !atual)}
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <main className="cad-page">
            <aside className="cad-brand-panel">
                <Link to="/login" className="cad-brand">
                    <span className="cad-brand-icon">
                        <HeartHandshake size={29} />
                    </span>
                    <span>Mãos Amigas</span>
                </Link>

                <div className="cad-brand-content">
                    <span className="cad-eyebrow">UM NOVO COMEÇO</span>
                    <h1>Cuidar de você também é uma forma de coragem.</h1>
                    <p>
                        Crie sua conta e encontre um espaço de acolhimento,
                        apoio psicológico e cuidado com a sua saúde emocional.
                    </p>

                    <div className="cad-benefit">
                        <span><CheckCircle2 size={19} /></span>
                        <div>
                            <strong>Um espaço para você</strong>
                            <p>Encontre apoio no seu próprio ritmo.</p>
                        </div>
                    </div>

                    <div className="cad-benefit">
                        <span><CheckCircle2 size={19} /></span>
                        <div>
                            <strong>Praticidade no atendimento</strong>
                            <p>Organize suas informações em um só lugar.</p>
                        </div>
                    </div>
                </div>

                <p className="cad-brand-footer">
                    Mãos Amigas · Acolhimento que aproxima.
                </p>
                <div className="cad-decoration cad-decoration-one" />
                <div className="cad-decoration cad-decoration-two" />
            </aside>

            <section className="cad-form-panel">
                <div className="cad-form-container">
                    <div className="cad-mobile-brand">
                        <span className="cad-brand-icon">
                            <HeartHandshake size={26} />
                        </span>
                        <span>Mãos Amigas</span>
                    </div>

                    <header className="cad-heading">
                        <span className="cad-eyebrow">FAÇA PARTE</span>
                        <h2>Crie sua conta</h2>
                        <p>Preencha seus dados para começar sua jornada de cuidado.</p>
                    </header>

                    {erro && (
                        <div className="cad-alert cad-alert-error" role="alert">
                            {erro}
                        </div>
                    )}

                    {sucesso && (
                        <div className="cad-alert cad-alert-success" role="status">
                            <CheckCircle2 size={20} />
                            <span>{sucesso}</span>
                        </div>
                    )}

                    <form onSubmit={cadastrar}>
                        <div className="cad-section-heading">
                            <span className="cad-section-icon"><UserRound size={19} /></span>
                            <div>
                                <h3>Dados pessoais</h3>
                                <p>Informações para criar seu acesso.</p>
                            </div>
                        </div>

                        <div className="cad-fields-grid">
                            {campo("nome", "Nome completo", "text", true, "Digite seu nome completo")}
                            {campo("cpf", "CPF", "text", true, "000.000.000-00")}
                            {campo("email", "E-mail", "email", true, "voce@exemplo.com")}
                            {campo("dataNascimento", "Data de nascimento", "date")}
                            {campo("contatoPessoal", "Telefone de contato", "tel", true, "(00) 00000-0000")}
                            {campo("contatoConfianca", "Contato de confiança", "tel", false, "Telefone opcional")}
                            {campo("senha", "Crie uma senha", "password", true, "Mínimo de 6 caracteres")}
                        </div>

                        <div className="cad-section-heading cad-address-heading">
                            <span className="cad-section-icon"><MapPin size={19} /></span>
                            <div>
                                <h3>Seu endereço</h3>
                                <p>Informe onde você mora.</p>
                            </div>
                        </div>

                        <div className="cad-fields-grid">
                            {campo("endereco.rua", "Rua", "text", true, "Nome da rua")}
                            {campo("endereco.numero", "Número", "text", true, "Nº da residência")}
                            {campo("endereco.bairro", "Bairro", "text", true, "Seu bairro")}
                            {campo("endereco.cidade", "Cidade", "text", true, "Sua cidade")}
                            {campo("endereco.estado", "Estado (UF)", "text", true, "Ex.: AL")}
                            {campo("endereco.cep", "CEP", "text", true, "00000-000")}
                        </div>

                        <p className="cad-required-note">
                            <span className="cad-required">*</span> Campos obrigatórios
                        </p>

                        <button
                            className="cad-submit"
                            type="submit"
                            disabled={carregando}
                        >
                            {carregando ? (
                                <>
                                    <LoaderCircle className="cad-spinner" size={19} />
                                    Criando sua conta...
                                </>
                            ) : (
                                <>
                                    Criar minha conta
                                    <ArrowRight size={19} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="cad-login-link">
                        Já tem uma conta? <Link to="/login">Entrar</Link>
                    </p>

                    <p className="cad-privacy">
                        Suas informações são utilizadas para o funcionamento da plataforma.
                    </p>
                </div>
            </section>
        </main>
    );
}

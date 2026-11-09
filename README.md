# Mãos Amigas — Front-end

<p align="center">
  <img width="500" height="500" alt="a325c96e-bbeb-4c5c-b215-6eaad40cca04" src="https://github.com/user-attachments/assets/7c13447f-0e21-4ddc-8b16-de41ad0fa70f" />
</p>


Interface web da plataforma Mãos Amigas, desenvolvida para conectar pessoas a profissionais de psicologia e facilitar o acesso ao atendimento psicológico on-line.

O projeto oferece uma interface para autenticação de usuários, consulta de psicólogos, acompanhamento de consultas e interação com um chatbot baseado em inteligência artificial.

## Funcionalidades

- **Autenticação:** páginas de login e cadastro de usuários.
- **Página inicial:** acesso às principais funcionalidades da plataforma.
- **Psicólogos:** visualização dos profissionais disponíveis.
- **Consultas:** acesso às funcionalidades relacionadas aos agendamentos.
- **Chat com inteligência artificial:** interface integrada ao agente Agno, com autenticação JWT, consulta de profissionais/horários e confirmação explícita de reservas pendentes.
- **Integração com API REST:** comunicação com o back-end para consumir os serviços da aplicação.
- **Navegação entre páginas:** gerenciamento de rotas com React Router.

## Tecnologias utilizadas

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router
- Lucide React

## Arquitetura

O front-end é responsável pela interface e pela interação com o usuário. As regras de negócio, autenticação, persistência dos dados e processamento das requisições ficam no back-end.

```text
Usuário
   |
   v
React + Vite
   |
   v
Axios / API REST
   |
   v
Spring Boot
   |
   +---- PostgreSQL
   |
   +---- Serviço de inteligência artificial
```

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js
- npm
- Git

O back-end Spring Boot deve estar em execução para utilizar as funcionalidades que dependem da API.

## Como executar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/OttoLuis/Maos-Amigas-Frontend.git
```

### 2. Entrar na pasta do projeto

```bash
cd Maos-Amigas-Frontend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar a URL da API

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
VITE_AGNO_API_URL=http://localhost:8000
```

O front-end utiliza `VITE_API_URL` para a API Spring Boot e `VITE_AGNO_API_URL` para o serviço Agno (chat e confirmação de reservas). O arquivo [`.env.example`](.env.example) contém os valores locais padrão.

Não coloque senhas, tokens privados ou chaves de API nesse arquivo. Variáveis `VITE_*` são incorporadas ao código disponibilizado no navegador e não devem conter segredos.

### 5. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em:

http://localhost:5173

Se essa porta estiver ocupada, o Vite poderá utilizar outra porta, informada no terminal.

## Compilação para produção

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos compilados serão gerados no diretório `dist/`.

Para testar localmente a versão compilada:

```bash
npm run preview
```

## Estrutura do projeto

```text
src/
├── assets/
├── components/
│   ├── Footer.jsx
│   └── Navbar.jsx
├── pages/
│   ├── Cadastro.jsx
│   ├── ChatIA.jsx
│   ├── Consultas.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   └── Psicologos.jsx
├── services/
│   └── api.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx

public/
├── favicon.svg
├── icons.svg
└── logo-maos-amigas.png

index.html
package.json
vite.config.js
```

## Integração com o back-end

O front-end consome a API Spring Boot (autenticação, profissionais e consultas) e o serviço Agno (conversa com o agente e confirmação de reserva).

O endereço local padrão da API é `http://localhost:8080`. Para executar a aplicação completa, o back-end e seus serviços necessários devem estar configurados e em execução.

A API Spring Boot e o serviço Agno devem permitir a origem utilizada pelo front-end. No Agno, configure `AGNO_CORS_ORIGINS`; no Spring Boot, configure `CORS_ORIGINS`.

Repositório do back-end:

https://github.com/OttoLuis/Maos-Amigas

## Executar com Docker

O ambiente de desenvolvimento do projeto utiliza Docker Compose e Colima para gerenciar os serviços do back-end. O front-end pode ser executado separadamente com npm.

Consulte o README do back-end para obter as instruções de configuração dos serviços e do banco de dados.

## Objetivo do projeto

O Mãos Amigas tem como objetivo facilitar o acesso ao atendimento psicológico por meio de uma plataforma digital que reúne profissionais, consultas on-line e recursos de inteligência artificial.

O projeto também permite aplicar conhecimentos de desenvolvimento web, integração entre aplicações, consumo de APIs REST e organização de interfaces com React.

## Autor

**Otto Luis**

GitHub: https://github.com/OttoLuis

Repositório do front-end: https://github.com/OttoLuis/Maos-Amigas-Frontend

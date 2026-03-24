# CRM API — Preview de Estrutura e Arquitetura

> **Nota:** Este projeto é um **preview** de estrutura e arquitetura. Tem como objetivo demonstrar padrões de organização, Clean Architecture modularizada e boas práticas em NestJS — não é um produto pronto para produção.

## Sobre o Projeto

API de CRM construída em NestJS seguindo **Clean Architecture** com módulos independentes por domínio. Inclui leads, contatos, empresas, deals, pipelines e tarefas, com validação via Zod, documentação Swagger e persistência em PostgreSQL com Prisma.

## Stack

| Tecnologia   | Uso                          |
|-------------|------------------------------|
| **NestJS**  | Framework backend            |
| **Prisma**  | ORM + `schema.prisma` (PostgreSQL; sync com `db push`) |
| **nestjs-zod** | Validação e integração Swagger |
| **Swagger** | Documentação OpenAPI (UI clássica em `/docs`) |
| **Scalar** | UI moderna sobre o mesmo OpenAPI (`@scalar/nestjs-api-reference`, `/scalar`) |
| **Zod**     | Schema e validação em runtime|

## Pré-requisitos

- Node.js 20+
- Docker Desktop (ou outro runtime com `docker compose`) — para subir PostgreSQL local
- npm ou pnpm

## Como Rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Na raiz há `.env.example`. Copie para `.env` (o arquivo `.env` não é versionado):

```bash
# Windows (PowerShell / CMD)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Valores padrão alinhados ao `docker-compose.yml`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db?schema=public"
PORT=3000
NODE_ENV=development
```

### 3. Subir o PostgreSQL e criar tabelas

```bash
npm run db:up
npm run db:push
```

O schema fica em `prisma/schema.prisma`; a URL do banco para o CLI (`db push`, `studio`) está em **`prisma.config.ts`** (Prisma 7+). Em runtime, a API usa **`pg`** (pool) + **Unit of Work** com SQL explícito (`ctx.client.query`). Não há pasta `migrations` — o banco é atualizado com `prisma db push` (adequado para dev/preview).

### 4. Iniciar a aplicação

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Ou, em modo normal
npm run start

# Produção (após build)
npm run build
npm run start:prod
```

### 5. Acessar a API

- **API:** `http://localhost:3000/api/v1`
- **Swagger UI:** `http://localhost:3000/docs`
- **Scalar (OpenAPI interativo):** `http://localhost:3000/scalar`

## Scripts Disponíveis

| Comando            | Descrição                          |
|-------------------|------------------------------------|
| `npm run start:dev` | Inicia em modo watch (hot reload) |
| `npm run build`   | Compila o projeto                   |
| `npm run start:prod` | Inicia versão compilada          |
| `npm run lint`    | Executa ESLint                      |
| `npm run db:up`   | Sobe PostgreSQL (Docker Compose)    |
| `npm run db:down` | Para e remove containers do banco   |
| `npm run db:push` | Aplica `schema.prisma` ao banco     |
| `npm run db:studio` | Abre Prisma Studio               |

## Estrutura da Arquitetura (Preview)

Cada domínio segue a mesma organização:

```
modules/<dominio>/
├── domain/          # Entidades, value objects, contratos (interfaces)
├── application/     # Use cases, DTOs, mappers
├── infrastructure/  # Implementações (repositórios SQL + Unit of Work)
├── presentation/    # Controllers, roteamento
└── <dominio>.module.ts
```

- **Domain:** regras de negócio puras, sem dependências externas
- **Application:** orquestração, recebe interfaces de repositório
- **Infrastructure:** implementações concretas (repositórios via `pg`, factories, etc.)
- **Presentation:** HTTP, Swagger, validação de entrada

## Módulos

| Módulo     | Recurso principal                     |
|-----------|--------------------------------------|
| Leads     | CRUD + conversão em contato          |
| Contacts  | CRUD de contatos                     |
| Companies | CRUD de empresas                     |
| Deals     | CRUD + movimentação de estágio       |
| Pipelines | CRUD de pipelines e estágios         |
| Tasks     | CRUD + conclusão de tarefas          |

## Rotas da API

**Prefixo global:** `http://localhost:3000/api/v1` (ajuste host/porta conforme `.env`).

### Leads — `/api/v1/leads`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/leads` | Criar lead |
| `GET` | `/leads` | Listar leads (paginação / filtros) |
| `GET` | `/leads/:id` | Buscar lead por id |
| `PUT` | `/leads/:id` | Atualizar lead |
| `DELETE` | `/leads/:id` | Remover lead |
| `POST` | `/leads/:id/convert` | Converter lead em contato |

### Contatos — `/api/v1/contacts`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/contacts` | Criar contato |
| `GET` | `/contacts` | Listar contatos |
| `GET` | `/contacts/:id` | Buscar contato por id |
| `PUT` | `/contacts/:id` | Atualizar contato |
| `DELETE` | `/contacts/:id` | Remover contato |

### Empresas — `/api/v1/companies`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/companies` | Criar empresa |
| `GET` | `/companies` | Listar empresas |
| `GET` | `/companies/:id` | Buscar empresa por id |
| `PUT` | `/companies/:id` | Atualizar empresa |
| `DELETE` | `/companies/:id` | Remover empresa |

### Deals — `/api/v1/deals`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/deals` | Criar deal |
| `GET` | `/deals` | Listar deals |
| `GET` | `/deals/:id` | Buscar deal por id |
| `PUT` | `/deals/:id` | Atualizar deal |
| `PATCH` | `/deals/:id/stage` | Alterar estágio do deal |
| `DELETE` | `/deals/:id` | Remover deal |

### Pipelines — `/api/v1/pipelines`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/pipelines` | Criar pipeline (com estágios) |
| `GET` | `/pipelines` | Listar pipelines |
| `GET` | `/pipelines/:id` | Buscar pipeline por id |
| `PUT` | `/pipelines/:id` | Atualizar pipeline |
| `DELETE` | `/pipelines/:id` | Remover pipeline |

### Tarefas — `/api/v1/tasks`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/tasks` | Criar tarefa |
| `GET` | `/tasks` | Listar tarefas |
| `GET` | `/tasks/:id` | Buscar tarefa por id |
| `PUT` | `/tasks/:id` | Atualizar tarefa |
| `PATCH` | `/tasks/:id/complete` | Marcar tarefa como concluída |
| `DELETE` | `/tasks/:id` | Remover tarefa |

> Contratos e parâmetros de query/body: **Swagger** em `/docs` ou **Scalar** em `/scalar`.

## Sobre este Preview

Este repositório serve como referência de:

- **Modularização** por domínio com borders claros
- **Clean Architecture** em NestJS
- **Validação** com Zod e documentação automática no Swagger
- **Separação** entre domain, application, infrastructure e presentation

É um ponto de partida para evolução. Em um cenário real, considere adicionar:

- Autenticação/autorização
- Testes unitários e e2e
- Logging estruturado
- Tratamento de eventos assíncronos
- Cache, rate limiting, etc.

## Licença

UNLICENSED

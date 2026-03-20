# CRM API — Preview de Estrutura e Arquitetura

> **Nota:** Este projeto é um **preview** de estrutura e arquitetura. Tem como objetivo demonstrar padrões de organização, Clean Architecture modularizada e boas práticas em NestJS — não é um produto pronto para produção.

## Sobre o Projeto

API de CRM construída em NestJS seguindo **Clean Architecture** com módulos independentes por domínio. Inclui leads, contatos, empresas, deals, pipelines e tarefas, com validação via Zod, documentação Swagger e persistência em PostgreSQL com Prisma.

## Stack

| Tecnologia   | Uso                          |
|-------------|------------------------------|
| **NestJS**  | Framework backend            |
| **Prisma**  | ORM + migrations (PostgreSQL)|
| **nestjs-zod** | Validação e integração Swagger |
| **Swagger** | Documentação da API          |
| **Zod**     | Schema e validação em runtime|

## Pré-requisitos

- Node.js 20+
- PostgreSQL em execução
- npm ou pnpm

## Como Rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/crm_db"
PORT=3000
NODE_ENV=development
```

> Ajuste `usuario`, `senha` e `crm_db` conforme seu ambiente PostgreSQL.

### 3. Rodar as migrations

```bash
npx prisma migrate dev --name init_crm
```

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
- **Swagger (docs):** `http://localhost:3000/docs`

## Scripts Disponíveis

| Comando            | Descrição                          |
|-------------------|------------------------------------|
| `npm run start:dev` | Inicia em modo watch (hot reload) |
| `npm run build`   | Compila o projeto                   |
| `npm run start:prod` | Inicia versão compilada          |
| `npm run lint`    | Executa ESLint                      |
| `npx prisma studio` | Abre interface visual do banco   |

## Estrutura da Arquitetura (Preview)

Cada domínio segue a mesma organização:

```
modules/<dominio>/
├── domain/          # Entidades, value objects, contratos (interfaces)
├── application/     # Use cases, DTOs, mappers
├── infrastructure/  # Implementações (ex: repositórios Prisma)
├── presentation/    # Controllers, roteamento
└── <dominio>.module.ts
```

- **Domain:** regras de negócio puras, sem dependências externas
- **Application:** orquestração, recebe interfaces de repositório
- **Infrastructure:** implementações concretas (Prisma, etc.)
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

Todas sob o prefixo `/api/v1`:

- `POST/GET/GET/:id/PUT/DELETE` para cada recurso
- `POST /leads/:id/convert` — converte lead em contato
- `PATCH /deals/:id/stage` — move deal de estágio
- `PATCH /tasks/:id/complete` — marca tarefa como concluída

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

# 📚 Documentação Técnica de Arquitetura

---

# 📐 1. Visão Geral da Arquitetura

## 🧠 O que é a arquitetura deste projeto?

Este projeto foi estruturado utilizando dois conceitos arquiteturais principais:

- **DDD (Domain-Driven Design)**
- **Clean Architecture**

Esses padrões não são apenas organização de pastas — eles definem **como o sistema pensa, se organiza e evolui**.

---

## 🧩 O problema que essa arquitetura resolve

Sem esse tipo de arquitetura, sistemas geralmente sofrem com:

- Código misturado (regra de negócio + banco + HTTP no mesmo lugar)
- Dificuldade de manutenção
- Alto acoplamento
- Regras de negócio espalhadas
- Baixa testabilidade

👉 Essa arquitetura resolve isso separando responsabilidades de forma rigorosa.

---

## 🏗️ Estrutura real do projeto

```
src/modules/*
  domain
  application
  infrastructure
  presentation
  shared
```

---

## 🧠 O que é DDD (Domain-Driven Design)?

DDD é uma abordagem onde:

> O sistema é construído **em torno do domínio do negócio**, e não da tecnologia.

### 📌 O que isso significa na prática?

- O código reflete regras reais do negócio
- Entidades possuem comportamento (não são apenas dados)
- Tipos simples são substituídos por objetos ricos (Value Objects)

---

## 🧠 O que é Clean Architecture?

Clean Architecture define que:

> O sistema deve ser dividido em camadas independentes.

### 📌 Regra mais importante

> **Camadas internas NÃO conhecem camadas externas**

---

## 🧱 Camadas identificadas no projeto

| Camada | Papel |
|--------|------|
| **Domain** | Regras de negócio puras |
| **Application** | Orquestra o fluxo |
| **Infrastructure** | Acesso ao banco |
| **Presentation** | Entrada HTTP |

---

## 🔄 Fluxo de requisição

```
Controller → UseCase → Domain → Repository → Banco
```

---

## 🧠 Como pensar nesse fluxo

- **Controller** = porta de entrada
- **UseCase** = orquestrador
- **Domain** = cérebro do sistema
- **Repository** = ponte para o banco

---

# 📁 2. Estrutura de Pastas (Didático + Técnico)

---

## 📂 `src/modules/leads`

### 📌 O que é?

Representa um **contexto de negócio completo** (Lead).

### 📌 O que contém?

- Domain
- Application
- Infrastructure
- Presentation

👉 Ou seja: um módulo completo e isolado.

---

# 🟣 DOMAIN (NÚCLEO DO SISTEMA)

---

## 📂 `domain/entities`

### 📌 O que é uma Entity?

Entity é um objeto que:

- Possui **identidade única (ID)**
- Possui **ciclo de vida**
- Possui **comportamento**

---

## ❌ Problema sem Entity

```ts
const lead = {
  name: "João",
  email: "qualquer coisa"
}
```

👉 Sem validação
👉 Sem regra
👉 Sem controle

## ✅ Exemplo real: Lead

```ts
export class Lead extends AggregateRoot {
  private constructor(private readonly props: LeadProps) {
    super();
  }

  static create(props: {
    name: Name;
    email: Email;
  }): Lead {
    const id = randomUUID();
    const now = new Date();

    const lead = new Lead({
      id,
      name: props.name,
      email: props.email,
      createdAt: now,
      updatedAt: now,
    });

    lead.addDomainEvent(new LeadCreatedEvent(id));
    return lead;
  }
}
```

### 📌 O que essa Entity faz?

- Garante consistência
- Controla criação
- Dispara eventos

### 🚨 O que NÃO pode existir aqui

- SQL
- Prisma
- Controller

---

## 📂 `domain/value-objects`

### 🧠 O que é um Value Object?

Um Value Object representa um valor com regras.

### ❌ Problema sem Value Object

```ts
email: string
```

👉 Qualquer valor entra
👉 Nenhuma validação

### ✅ Exemplo real: Email

```ts
export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!this.validate(value)) {
      throw new Error('Invalid email');
    }
    this.value = value;
  }
}
```

### 📌 O que isso resolve?

- Validação centralizada
- Imutabilidade
- Segurança

---

## 📂 `domain/events`

### 🧠 O que são eventos de domínio?

Eventos representam algo que já aconteceu no sistema.

### 📌 Exemplo

```ts
export class LeadCreatedEvent {
  constructor(public readonly leadId: string) {}
}
```

### 📌 Por que isso existe?

Para desacoplar:

- Quem faz a ação
- Quem reage à ação

---

## 📂 `domain/repositories`

### 🧠 O que é?

Interface que define acesso a dados.

### ❌ Problema sem isso

Domain dependeria de banco diretamente.

### ✅ Exemplo

```ts
export abstract class LeadRepository {
  abstract save(lead: Lead): Promise<void>;
}
```

---

## 📂 `domain/specifications`

### 🧠 O que é?

Regras complexas que não pertencem à Entity.

### 📌 Exemplo

- Verificar email único

---

## 📂 `domain/factories`

### 🧠 O que é?

Responsável por criar objetos complexos.

---

# 🔵 APPLICATION (ORQUESTRAÇÃO)

## 📂 `application/use-cases`

### 🧠 O que é um Use Case?

Use Case é quem executa uma ação do sistema.

### ❌ Problema sem Use Case

Controller faria tudo:

- validar
- criar
- salvar

👉 código acoplado

### ✅ Exemplo real

```ts
export class CreateLeadUseCase {
  constructor(private readonly repository: LeadRepository) {}

  async execute(dto: CreateLeadDto) {
    const lead = Lead.create({
      name: new Name(dto.name),
      email: new Email(dto.email),
    });

    await this.repository.save(lead);
    return lead;
  }
}
```

### 📌 Responsabilidade

- Orquestrar fluxo
- Não conter regra de domínio complexa

---

## 📂 `application/dtos`

### 🧠 O que é DTO?

Objeto de transferência de dados.

```ts
export class CreateLeadDto {
  name: string;
  email: string;
}
```

### 📌 Função

- Receber dados externos
- Separar da entidade

---

## 📂 `application/handlers`

### 🧠 O que fazem?

Reagem a eventos

---

# 🟡 INFRASTRUCTURE (ACESSO A DADOS)

## 📂 `infrastructure/repositories`

### 🧠 O que faz?

Implementa acesso ao banco.

```ts
export class LeadPrismaRepository implements LeadRepository {
  async save(lead: Lead): Promise<void> {
    // implementação
  }
}
```

### 📌 Detalhes internos:

Não identificado no código

---

# 🟢 PRESENTATION (ENTRADA)

## 📂 `presentation/controllers`

### 🧠 O que é?

Responsável por receber requisições HTTP.

```ts
@Controller('leads')
export class LeadController {
  constructor(private readonly createLeadUseCase: CreateLeadUseCase) {}

  @Post()
  async create(@Body() dto: CreateLeadDto) {
    return this.createLeadUseCase.execute(dto);
  }
}
```

---

# 🧪 3. Exemplo Completo (Criação de Lead)

## 🧠 Passo a passo mental

### 1. Requisição entra

Controller recebe dados

### 2. Vai para UseCase

```ts
this.createLeadUseCase.execute(dto)
```

### 3. Criação de objetos

```ts
new Name(dto.name)
new Email(dto.email)
```

### 4. Criação da entidade

```ts
Lead.create(...)
```

### 5. Evento disparado

```ts
LeadCreatedEvent
```

### 6. Persistência

```ts
repository.save(lead)
```

---

# 🔄 4. Fluxo de Dados (Explicado)

## 🧠 O que acontece internamente?

1. Controller recebe requisição
2. DTO encapsula dados
3. UseCase inicia execução
4. Value Objects validam dados
5. Entity garante consistência
6. Evento é registrado
7. Repository salva
8. Retorna resposta

## 📌 Onde cada coisa acontece?

| Etapa | Local |
|-------|-------|
| Validação de formato | Value Objects |
| Regra de negócio | Entity |
| Orquestração | UseCase |
| Persistência | Infrastructure |

---

# 📌 5. Conclusão Técnica

## ✅ Pontos Fortes

- Separação clara de responsabilidades
- Código orientado ao domínio
- Alta manutenibilidade
- Baixo acoplamento
- Facilidade de testes

## 🧠 Resumo Final

Este projeto implementa uma arquitetura robusta baseada em:

- DDD (foco no domínio)
- Clean Architecture (separação de camadas)

Isso resulta em:

- Código mais organizado
- Mais fácil de evoluir
- Mais seguro
- Preparado para escala

## 💡 Forma correta de pensar esse sistema

- O sistema não é um conjunto de endpoints
- Ele é um conjunto de regras de negócio organizadas por domínio
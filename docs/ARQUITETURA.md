# Documento técnico — Arquitetura do projeto CRM API (abp-nest-test)

> Documentação baseada **exclusivamente** no código do repositório. Onde algo não existe, está indicado explicitamente.

## Visão geral do repositório

O projeto é uma **API NestJS** de CRM com **PostgreSQL + Prisma**, validação com **Zod** (via **nestjs-zod**), documentação **Swagger** e prefixo global **`/api/v1`**. O README descreve o projeto como **preview** de estrutura e arquitetura, não produto pronto para produção.

**Módulos de domínio (bounded contexts) em `src/modules/`:** `leads`, `contacts`, `companies`, `deals`, `pipelines`, `tasks`.

**Não existe** pasta `src/common` nem `src/core`; o código transversal fica em **`src/shared/`**.

**Não existe** pasta `application/services` em nenhum módulo; a orquestração é feita por **use cases** (`*.usecase.ts`).

---

## Raiz do projeto

### Arquivos de configuração e tooling

| Item | Papel no repositório |
|------|----------------------|
| `package.json` | Scripts (`build`, `start`, `test`, `lint`), dependências NestJS/Prisma/Zod, configuração **Jest** (incl. `moduleNameMapper` para imports `.js` em testes). |
| `tsconfig.json` | `module`/`moduleResolution`: **NodeNext** (imports com sufixo `.js` no código-fonte). |
| `nest-cli.json` | Configuração do Nest CLI. |
| `eslint.config.mjs`, `.prettierrc` | Lint e formatação. |
| `.vscode/launch.json` | Debug. |
| `docs/DESIGN_PATTERNS.md` | Documentação de padrões GoF aplicados ao projeto (análise textual). |

### `prisma/`

#### Descrição arquitetural

- **`schema.prisma`**: modelo de dados e enums (`LeadStatus`, `DealStage`, `TaskType`) — **fonte da verdade** para o banco e para o **Prisma Client** gerado.
- **`migrations/`**: migrações versionadas (ex.: `init_crm`) com `migration.sql` e `migration_lock.toml` (provider PostgreSQL).

#### Conceito

Persistência e evolução de schema via **migrations**; o domínio em TypeScript **não** importa Prisma diretamente nas entidades — a ponte é a **infraestrutura** (repositórios + mappers).

#### Fluxo

`PrismaService` conecta na subida da app; repositórios usam `this.prisma.*` para CRUD. Alterações de schema passam por `prisma migrate`.

#### Exemplo real

Trecho do modelo `Lead` no schema:

```prisma
model Lead {
  id          String     @id @default(uuid())
  name        String
  email       String     @unique
  phone       String?
  source      String?
  status      LeadStatus @default(NEW)
  notes       String?
  convertedAt DateTime?
  contactId   String?    @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  contact     Contact?   @relation(fields: [contactId], references: [id])
  tasks       Task[]
}
```

---

## `src/` — Bootstrap e composição

### `src/main.ts`

#### Descrição

Ponto de entrada HTTP: cria a aplicação Nest, configura **Swagger**, **pipes globais** (`ZodValidationPipe`), **filtro global** (`HttpExceptionFilter`), **prefixo** `api/v1`, **CORS**, middleware **catch-all 404** (após o restante da configuração) e `listen` na porta vinda de `env`.

#### Conceito

**Composition root** da aplicação: wiring de infraestrutura transversal (validação, erros, documentação, rotas inexistentes).

#### Fluxo

Cliente HTTP → Nest → pipeline global → módulos/feature controllers → use cases → repositórios.

#### Exemplo real

```ts
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.use((req, res, next) => {
    res.status(404).json({
      statusCode: 404,
      message: `Rota ${req.method} ${req.url} não encontrada`,
      error: 'Not Found',
    });
  });

  await app.listen(env.PORT);
```

---

### `src/app.module.ts`

#### Descrição

Módulo raiz que importa **`PrismaModule`**, **`DomainEventsModule`** e os **seis módulos de feature**.

#### Conceito

**Inversão de dependência** no nível de módulos Nest: infraestrutura global (DB, eventos) + bounded contexts.

#### Exemplo real

```ts
@Module({
  imports: [
    PrismaModule,
    DomainEventsModule,
    LeadsModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
    PipelinesModule,
    TasksModule,
  ],
})
export class AppModule {}
```

---

### `src/config/`

#### Descrição

Configuração tipada de ambiente com **Zod** (`NODE_ENV`, `PORT`, `DATABASE_URL`).

#### Exemplo real

```ts
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Ambiente de execução'),
  PORT: z.coerce.number().default(3000).describe('Porta do servidor'),
  DATABASE_URL: z.string().min(1).describe('URL de conexão PostgreSQL'),
});

export const env = envSchema.parse(process.env);
```

---

## `src/shared/` — Kernel transversal

Estrutura real:

- `shared/database/` — Prisma
- `shared/domain/` — `AggregateRoot`, `DomainEvent`, `IDomainEventDispatcher`
- `shared/infrastructure/` — implementação do dispatcher de eventos
- `shared/errors/` — erros de aplicação/domínio
- `shared/filters/` — mapeamento de exceções → HTTP
- `shared/pipes/` — reexport do `ZodValidationPipe`
- `shared/domain-events.module.ts` — módulo global de eventos

**Não existe** pasta `shared/common` além disso.

---

### `shared/database/`

#### Descrição

- **`prisma.module.ts`**: módulo **`@Global()`** que exporta `PrismaService`.
- **`prisma.service.ts`**: estende `PrismaClient`, conecta/desconecta no ciclo de vida do Nest.

#### Conceito

**Adapter de persistência** compartilhado: um único cliente Prisma por aplicação (padrão singleton do Nest para providers).

#### Fluxo

Repositórios em `modules/*/infrastructure/repositories/*` injetam `PrismaService`.

#### Exemplo real

```ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

---

### `shared/domain/`

#### Descrição

Conceitos de **DDD** reutilizáveis **sem** dependência de framework de persistência:

- **`aggregate-root.ts`**: fila de eventos de domínio, `addDomainEvent` protegido, `getDomainEvents` / `clearEvents`.
- **`domain-event.ts`**: classe abstrata com `occurredAt`.
- **`domain-event-dispatcher.ts`**: interface `IDomainEventDispatcher` + tipo `DomainEventHandler`.

#### Conceito

**Política de domínio** (eventos) separada do **mecanismo** de entrega (implementação em `shared/infrastructure`).

#### Exemplo real (`AggregateRoot`)

```ts
export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
```

**Uso no projeto:** apenas o agregado **Lead** estende `AggregateRoot` (demais entidades de módulos não estendem, conforme código atual).

---

### `shared/infrastructure/`

#### Descrição

Implementação concreta de **`DomainEventDispatcher`** (registro por `eventClass.name`, `dispatch` sequencial).

#### Exemplo real

```ts
@Injectable()
export class DomainEventDispatcher implements IDomainEventDispatcher {
  private readonly handlers = new Map<
    string,
    DomainEventHandler<DomainEvent>[]
  >();
  // ...
  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const key = event.constructor.name;
      const list = this.handlers.get(key) ?? [];
      for (const handler of list) {
        await handler(event);
      }
    }
  }
}
```

**Observação (acoplamento):** o registro usa **`constructor.name`**, o que pode ser frágil com minificação/bundling — é uma decisão visível no código atual.

---

### `shared/domain-events.module.ts`

#### Descrição

Módulo **`@Global()`** que registra o token **`'IDomainEventDispatcher'`** → `DomainEventDispatcher`.

---

### `shared/errors/`

#### Descrição

- `AppError` base, `DomainError` (400), `NotFoundError`, `ConflictError` — usados pelo filtro HTTP e pelos use cases.

#### Fluxo com `HttpExceptionFilter`

O filtro mapeia tipos de erro para status HTTP (404, 409, 400, 422 para Zod, 500 genérico).

```ts
    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof ZodValidationException) {
```

---

### `shared/filters/`

#### Descrição

Camada de **adaptação de erros de domínio/aplicação** para respostas HTTP JSON uniformes.

---

### `shared/pipes/`

#### Descrição

Reexport de `ZodValidationPipe` do **nestjs-zod** — o pipe global efetivo é configurado em **`main.ts`** (`new ZodValidationPipe()`).

```ts
import { ZodValidationPipe } from 'nestjs-zod';

export { ZodValidationPipe };
```

---

## Padrão por módulo de feature (`src/modules/<nome>/`)

Cada módulo segue (README + estrutura real):

- `domain/` — entidades, enums, VOs, contratos de repositório, (no Lead) events, factory, specifications
- `application/` — use cases, DTOs, mappers, (no Lead) handlers de evento
- `infrastructure/` — repositórios Prisma
- `presentation/` — controllers
- `<nome>.module.ts`

---

### `domain/entities/`

#### Descrição

Modelagem do **núcleo** do bounded context. No **Lead**, a entidade é **Aggregate Root** com comportamento e eventos; em **Contact**, a entidade é um **DTO de domínio** com `static create(props)` e getters — perfil mais **anêmico** (sem `AggregateRoot`).

#### Conceito

- **Lead:** invariantes e mudanças via métodos (`changeEmail`, etc.), `create` vs `reconstitute`, `toPersistence()`.
- **Contact:** encapsula estado imutável via `props`, sem eventos no código atual.

#### Fluxo

Use cases carregam/salvam via repositório; mappers constroem entidades a partir do Prisma.

#### Exemplo real — Contact (padrão “data holder”)

```ts
export class Contact {
  private constructor(readonly props: ContactEntity) {}

  static create(props: ContactEntity): Contact {
    return new Contact(props);
  }
```

#### Exemplo real — Lead (Aggregate + evento na criação)

```ts
  static create(props: {
    name: string;
    email: Email;
    phone?: Phone | null;
    source?: LeadSource | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Lead {
    const id = randomUUID();
    const now = new Date();
    const lead = new Lead({
      id,
      name: props.name,
      email: props.email,
      // ...
    });
    lead.addDomainEvent(new LeadCreatedEvent(id));
    return lead;
  }
```

**Decisão arquitetural visível:** só **Lead** adota `AggregateRoot` + domain events; os outros módulos **não** replicam esse padrão no estado atual do repositório.

---

### `domain/value-objects/`

#### Descrição

VOs com validação e valor interno (`Email`, `Phone` em contacts; `LeadSource` em leads; `DomainUrl` em companies; `DealValue` em deals). Lançam `DomainError` em caso inválido.

#### Conceito

Substituir **string solta** por tipo com regra — ex.: email com regex e normalização.

#### Fluxo

- **LeadFactory** instancia `Email`, `Phone`, `LeadSource` a partir de strings do DTO.
- **LeadMapper** reconstrói VOs a partir de strings do Prisma ao fazer `reconstitute`.

#### Exemplo real — uso no mapper Lead

```ts
  static toDomain(prisma: PrismaLead): Lead {
    const email = new Email(prisma.email);
    const phone = prisma.phone ? new Phone(prisma.phone) : null;
    const source = prisma.source ? new LeadSource(prisma.source) : null;

    return Lead.reconstitute({
      id: prisma.id,
      name: prisma.name,
      email,
      phone,
      source,
      status: prisma.status as LeadStatus,
      notes: prisma.notes ?? null,
      convertedAt: prisma.convertedAt ?? null,
      contactId: prisma.contactId ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }
```

**Por que não usar só `string`:** garante que, ao entrar no agregado, email/telefone já passaram pelas regras dos VOs; a API ainda valida entrada com Zod nos DTOs — são camadas complementares (HTTP vs domínio).

---

### `domain/enums/`

#### Descrição

Enums de domínio alinhados ao Prisma quando aplicável (ex.: `LeadStatus`).

#### Fluxo

Usados em DTOs Zod (`z.nativeEnum`) e em entidades/repositórios.

---

### `domain/repositories/`

#### Descrição

**Portas** (interfaces) — ex.: `ILeadRepository` define contrato sem Prisma.

#### Exemplo real

```ts
export interface ILeadRepository {
  create(lead: Lead): Promise<Lead>;
  update(lead: Lead): Promise<Lead>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead | null>;
  list(params: ListLeadsParams): Promise<ListLeadsResult>;
  convert(leadId: string): Promise<Lead>;
}
```

**Observação:** `convert` concentra **transação** lead+contact no repositório Prisma (vide infra), não em um domain service separado no código atual.

---

### `domain/events/` (existe no módulo **leads**)

#### Descrição

Eventos específicos: `LeadCreatedEvent`, `LeadUpdatedEvent`, estendendo `DomainEvent`.

#### Exemplo real

```ts
import { DomainEvent } from '../../../../shared/domain/domain-event.js';

export class LeadCreatedEvent extends DomainEvent {
  constructor(public readonly leadId: string) {
    super();
  }
}
```

**Outros módulos:** **não há** pasta `domain/events/` fora de leads no estado atual.

---

### `domain/factories/` (existe no módulo **leads**)

#### Descrição

`LeadFactory` encapsula criação do agregado a partir de primitivos do use case.

#### Exemplo real

```ts
export class LeadFactory {
  create(props: {
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Lead {
    const emailVO = new Email(props.email);
    const phoneVO = props.phone ? new Phone(props.phone) : null;
    const sourceVO = props.source ? new LeadSource(props.source) : null;

    return Lead.create({
      name: props.name,
      email: emailVO,
      phone: phoneVO,
      source: sourceVO,
      status: props.status,
      notes: props.notes,
    });
  }
}
```

---

### `domain/specifications/` (existe no módulo **leads**)

#### Descrição

`LeadEmailUniqueSpec` — regra **“email único”** com dependência da porta `ILeadRepository`.

#### Exemplo real

```ts
export class LeadEmailUniqueSpec {
  constructor(private readonly repository: ILeadRepository) {}

  async isSatisfiedBy(email: string, excludeLeadId?: string): Promise<boolean> {
    const existing = await this.repository.findByEmail(email);
    if (!existing) return true;
    if (excludeLeadId && existing.id === excludeLeadId) return true;
    return false;
  }
```

**Nota:** o arquivo foi nomeado `*.specification.ts` para não colidir com sufixo de testes Jest (`*.spec.ts`).

---

### `application/use-cases/`

#### Descrição

Casos de uso **injetáveis** (`@Injectable`), orquestram repositório, regras e (no Lead) factory, specification e dispatcher de eventos.

#### Exemplo real — `CreateLeadUseCase`

```ts
  async execute(dto: CreateLeadDto): Promise<Lead> {
    const emailUnique = await this.emailUniqueSpec.isSatisfiedBy(dto.email);
    if (!emailUnique) {
      throw new ConflictError(`Lead com email ${dto.email} já existe`);
    }

    const lead = this.factory.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      source: dto.source ?? null,
      status: dto.status,
      notes: dto.notes ?? null,
    });

    const saved = await this.repository.create(lead);
    const events = lead.getDomainEvents();
    await this.eventDispatcher.dispatch(events);

    return saved;
  }
```

**Ordem explícita no código:** persistir **antes** de `dispatch` dos eventos — handlers rodam após o lead existir no banco.

#### `ConvertLeadUseCase`

Valida existência e status, depois delega `repository.convert(leadId)` — **não** usa `LeadFactory` nem eventos no trecho atual.

---

### `application/dtos/`

#### Descrição

Classes geradas com **nestjs-zod** + **Zod** — contrato de entrada HTTP e base para Swagger.

#### Exemplo real — `CreateLeadDto`

```ts
const schema = z.object({
  name: z.string().min(2).describe('Nome completo do lead'),
  email: z.string().email().describe('Email de contato'),
  phone: z.string().optional().nullable().describe('Telefone'),
  source: z.string().optional().nullable().describe('Fonte do lead'),
  status: z.nativeEnum(LeadStatus).optional().describe('Status do lead'),
  notes: z.string().optional().nullable().describe('Observações'),
});

export class CreateLeadDto extends createZodDto(schema) {}
```

---

### `application/mappers/`

#### Descrição

Anti-Corruption entre **modelo Prisma** e **entidade de domínio** — ex. `LeadMapper.toDomain`.

#### Fluxo

Chamado **apenas** na infraestrutura (`LeadPrismaRepository` retorna `LeadMapper.toDomain(...)`).

---

### `application/handlers/` (existe no módulo **leads**)

#### Descrição

`LeadCreatedEventHandler` registra handler no `IDomainEventDispatcher` em `onModuleInit`.

#### Exemplo real

```ts
  onModuleInit(): void {
    this.dispatcher.registerHandler(
      LeadCreatedEvent,
      this.handle.bind(this),
    );
  }

  private async handle(event: LeadCreatedEvent): Promise<void> {
    // Domain event handler - e.g. send welcome email, sync to analytics
    console.debug(`[LeadCreatedEvent] Lead ${event.leadId} was created`);
  }
```

**Outros módulos:** **não possuem** `application/handlers/` no estado atual.

---

### `infrastructure/repositories/`

#### Descrição

Implementações **`XxxPrismaRepository`** de `IXxxRepository`; usam `PrismaService` + mapper para devolver entidades de domínio.

#### Exemplo real — create/update Lead

```ts
  async create(lead: Lead): Promise<Lead> {
    const data = lead.toPersistence();
    const created = await this.prisma.lead.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: data.status,
        notes: data.notes,
      },
    });
    return LeadMapper.toDomain(created);
  }

  async update(lead: Lead): Promise<Lead> {
    const data = lead.toPersistence();
    const updated = await this.prisma.lead.update({
      where: { id: lead.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: data.status,
        notes: data.notes,
        contactId: data.contactId,
        convertedAt: data.convertedAt,
      },
    });
    return LeadMapper.toDomain(updated);
  }
```

**Coesão:** persistência e tradução Prisma↔domínio ficam na infra; o domínio não importa `@prisma/client`.

---

### `presentation/controllers/`

#### Descrição

Controllers Nest com rotas REST, Swagger (`@ApiTags`, `@ApiOperation`, etc.), chamada direta aos **use cases** e mapeamento de resposta (ex.: `toResponse` no `LeadController`).

#### Fluxo

HTTP → controller → use case → repositório.

**Não há** camada “Application Service” separada entre controller e use case no código atual.

---

### `<modulo>.module.ts`

#### Descrição

Registra controller, providers (use cases, repositório com token string, factory, spec, handler no Lead), imports (`PrismaModule`, `ContactsModule` no `LeadsModule`).

#### Exemplo real — `leads.module.ts`

```ts
@Module({
  imports: [PrismaModule, ContactsModule],
  controllers: [LeadController],
  providers: [
    {
      provide: 'ILeadRepository',
      useClass: LeadPrismaRepository,
    },
    LeadFactory,
    LeadEmailUniqueSpec,
    LeadCreatedEventHandler,
    CreateLeadUseCase,
    UpdateLeadUseCase,
    DeleteLeadUseCase,
    FindLeadUseCase,
    ListLeadsUseCase,
    ConvertLeadUseCase,
  ],
  exports: [],
})
export class LeadsModule {}
```

**Padrão DI:** tokens string `'ILeadRepository'` e `'IDomainEventDispatcher'` — explícito no código, facilita testes com mocks se necessário.

---

## Testes

### `src/**/*.spec.ts` (Jest)

Existem testes de domínio para Lead, por exemplo:

- `src/modules/leads/domain/entities/lead.entity.spec.ts`
- `src/modules/leads/domain/factories/lead.factory.spec.ts`

Configuração em **`package.json`** (`jest` + `moduleNameMapper` para resolver imports `.js` → `.ts`).

### `test/*.e2e-spec.ts`

Existe **`test/jest-e2e.json`** e teste e2e referenciando `AppModule` no repositório; o README ainda lista “Testes e2e” como algo a considerar em cenário real — **há** arquivo de teste e2e no projeto; validar execução localmente.

---

## Coesão, acoplamento e melhorias (baseadas no código)

1. **Coesão:** Por módulo, pastas `domain` / `application` / `infrastructure` / `presentation` estão **alinhadas** ao README.
2. **Inconsistência intencional ou evolutiva:** **Lead** está mais “DDD rico” (aggregate, events, factory, spec); **Contact** e outros permanecem com entidades mais **anêmicas** — isso é **factual** no repositório atual.
3. **Acoplamento entre contextos:** Lead usa `Email` e `Phone` definidos em **`contacts`** — acoplamento entre bounded contexts (compartilhamento de VO), documentado no código.
4. **Convert:** regra transacional no **`LeadPrismaRepository.convert`** — forte coesão com infra; alternativa futura seria orquestrar use case + transação explícita, **não** presente assim hoje.
5. **Eventos:** dispatcher **síncrono** em memória; **não há** fila (Redis/SQS) no código atual.

---

## Checklist do que **não** existe (explícito)

- Pasta **`src/modules/*/application/services/`** — **não existe**.
- Pasta **`src/common`** — **não existe** (usa-se `shared`).
- **`domain/events`**, **`domain/factories`**, **`domain/specifications`**, **`application/handlers`** em **todos** os módulos — **só constam no módulo Lead** no estado atual.
- **`AggregateRoot` / `DomainEvent`** fora de **`shared/domain`** e do agregado Lead — outras entidades **não** estendem `AggregateRoot` no código documentado.

---

## Referências no repositório

- [README.md](../README.md) — visão geral e stack
- [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) — padrões GoF

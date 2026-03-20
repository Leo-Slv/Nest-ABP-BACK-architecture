# Análise de Padrões de Projeto — CRM API

Este documento analisa os **padrões de projeto** (GoF — Gang of Four) presentes no projeto CRM e sugere implementações adicionais.

---

## 1. Padrões Criacionais

### 1.1 Factory Method ✅ **Implementado**

**Onde:** Entidades de domínio em todos os módulos.

**Como:** Método estático `create(props)` com construtor privado.

**Exemplo:**

```typescript
// src/modules/leads/domain/entities/lead.entity.ts
export class Lead {
  private constructor(readonly props: LeadEntity) {}

  static create(props: LeadEntity): Lead {
    return new Lead(props);
  }
  // ...
}
```

**Por quê:** Centraliza a criação, garante imutabilidade e encapsula a construção. Impede `new Lead()` direto, forçando o uso de `Lead.create()`.

**Onde mais:** `Contact`, `Company`, `Deal`, `Task`, `Pipeline`, `PipelineStage`.

---

### 1.2 Singleton ✅ **Implementado**

**Onde:** Serviços NestJS e módulos compartilhados.

**Como:** NestJS registra providers como singletons por escopo de módulo.

**Exemplo:**

```typescript
// src/shared/database/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Uma única instância por aplicação
}
```

**Por quê:** Uma conexão de banco, um pool de recursos. Evita múltiplas conexões e desperdício de recursos.

**Onde mais:** `PrismaModule` (@Global), use cases, repositórios.

---

### 1.3 Builder ❌ **Não implementado**

**Como implementar:** Criar builders fluentes para entidades complexas.

```typescript
// Exemplo: DealBuilder
class DealBuilder {
  private data: Partial<DealEntity> = {};
  
  withTitle(title: string) { this.data.title = title; return this; }
  withValue(value: number) { this.data.value = value; return this; }
  withContact(id: string) { this.data.contactId = id; return this; }
  
  build(): Deal {
    return Deal.create({ ...defaults, ...this.data });
  }
}
```

**Por quê:** Deals têm muitos campos opcionais. O Builder deixa a criação legível e evita construtores com muitos parâmetros.

---

### 1.4 Abstract Factory ❌ **Não implementado**

**Como implementar:** Fábrica abstrata para famílias de entidades (ex.: multi-tenant).

```typescript
interface CRMEntityFactory {
  createLead(data: CreateLeadData): Lead;
  createContact(data: CreateContactData): Contact;
  createDeal(data: CreateDealData): Deal;
}

class DefaultCRMFactory implements CRMEntityFactory { /* ... */ }
class EnterpriseCRMFactory implements CRMEntityFactory { /* ... */ }
```

**Por quê:** Útil para variar o conjunto de entidades ou regras por tenant, plano ou ambiente.

---

## 2. Padrões Estruturais

### 2.1 Adapter ✅ **Implementado**

**Onde:** Repositórios Prisma e mappers.

**Como:** Repositórios implementam interfaces de domínio e adaptam modelos Prisma para entidades de domínio.

**Exemplo:**

```typescript
// Interface no domínio (contrato)
export interface ILeadRepository {
  create(data: {...}): Promise<Lead>;
  findById(id: string): Promise<Lead | null>;
  // ...
}

// Implementação adapta Prisma → Domínio
@Injectable()
export class LeadPrismaRepository implements ILeadRepository {
  async findById(id: string): Promise<Lead | null> {
    const found = await this.prisma.lead.findUnique({ where: { id } });
    return found ? LeadMapper.toDomain(found) : null;  // Adapter
  }
}
```

**Por quê:** O domínio não conhece Prisma. A infraestrutura adapta o ORM ao contrato do domínio, permitindo trocar de persistência sem alterar use cases.

---

### 2.2 Facade ✅ **Implementado**

**Onde:** Controllers e use cases.

**Como:** Interfaces simplificadas sobre a lógica de domínio.

**Exemplo:**

```typescript
// Controller expõe API HTTP simplificada
@Controller('leads')
export class LeadController {
  @Post()
  async create(@Body() dto: CreateLeadDto) {
    const lead = await this.createUseCase.execute(dto);
    return this.toResponse(lead);
  }
}

// Use case encapsula validação, regras e repositório
@Injectable()
export class CreateLeadUseCase {
  async execute(dto: CreateLeadDto): Promise<Lead> {
    // Validação, conflitos, criação
    return this.repository.create({...});
  }
}
```

**Por quê:** O cliente (HTTP) não precisa conhecer repositórios, mappers ou regras. Uma única entrada por operação.

---

### 2.3 Composite ✅ **Implementado**

**Onde:** Módulo de pipelines.

**Como:** `Pipeline` agrega `PipelineStage` como componentes.

**Exemplo:**

```typescript
// src/modules/pipelines/domain/entities/pipeline.entity.ts
export class Pipeline {
  get stages(): PipelineStage[] | undefined {
    return this.props.stages?.map((s) => PipelineStage.create(s));
  }
}
```

**Por quê:** Pipeline e estágios formam uma árvore. Tratar ambos de forma uniforme (Pipeline como composto, Stage como folha) simplifica iteração e validação.

---

### 2.4 Decorator ❌ **Não implementado**

**Como implementar:** Envolver repositórios ou use cases com comportamentos extras.

```typescript
// Cache decorator
@Injectable()
class CachedLeadRepository implements ILeadRepository {
  constructor(
    @Inject('ILeadRepository') private readonly inner: ILeadRepository,
    private readonly cache: CacheService,
  ) {}
  
  async findById(id: string): Promise<Lead | null> {
    const cached = await this.cache.get(`lead:${id}`);
    if (cached) return cached;
    const result = await this.inner.findById(id);
    if (result) await this.cache.set(`lead:${id}`, result);
    return result;
  }
}
```

**Por quê:** Adicionar cache, logging ou métricas sem alterar o repositório original. Composição em vez de herança.

---

### 2.5 Proxy ❌ **Não implementado**

**Como implementar:** Proxy para lazy loading ou controle de acesso.

```typescript
// Lazy load de relacionamentos
class LeadProxy {
  private _contact: Contact | null = null;
  
  get contact(): Promise<Contact | null> {
    if (!this._contact) {
      this._contact = await this.contactRepo.findById(this.contactId);
    }
    return this._contact;
  }
}
```

**Por quê:** Evitar carregar relacionamentos pesados até o uso. Útil para entidades com muitas associações.

---

## 3. Padrões Comportamentais

### 3.1 Command ✅ **Implementado (implícito)**

**Onde:** Use cases.

**Como:** Cada use case encapsula uma ação e seus parâmetros.

**Exemplo:**

```typescript
@Injectable()
export class ConvertLeadUseCase {
  async execute(leadId: string): Promise<Lead> {
    const lead = await this.repository.findById(leadId);
    if (!lead) throw new NotFoundError(...);
    if (lead.status === LeadStatus.CONVERTED) throw new ConflictError(...);
    return this.repository.convert(leadId);
  }
}
```

**Por quê:** Cada operação é um comando isolado. Facilita testes, auditoria e possíveis filas assíncronas (undo/redo seria uma extensão).

---

### 3.2 Strategy ⚠️ **Parcial**

**Onde:** Tratamento de erros no `HttpExceptionFilter`.

**Como:** Escolha de status e mensagem baseada no tipo da exceção.

**Exemplo:**

```typescript
// src/shared/filters/http-exception.filter.ts
if (exception instanceof NotFoundError) {
  status = HttpStatus.NOT_FOUND;
} else if (exception instanceof ConflictError) {
  status = HttpStatus.CONFLICT;
} else if (exception instanceof DomainError) {
  status = HttpStatus.BAD_REQUEST;
}
// ...
```

**Por quê:** Hoje é um `if/else` por tipo. Uma **Strategy** explícita permitiria registrar handlers por tipo de erro e facilitaria extensão.

**Como melhorar:**

```typescript
interface ErrorHandler {
  canHandle(error: Error): boolean;
  handle(error: Error): { status: number; message: string };
}

const handlers: ErrorHandler[] = [
  new NotFoundErrorHandler(),
  new ConflictErrorHandler(),
  new DomainErrorHandler(),
];
```

---

### 3.3 State ❌ **Não implementado**

**Como implementar:** Máquina de estados para `LeadStatus` e `DealStage`.

```typescript
// LeadStateMachine
interface LeadState {
  canTransitionTo(status: LeadStatus): boolean;
  onConvert(lead: Lead): Contact;
}

class NewLeadState implements LeadState {
  canTransitionTo(status: LeadStatus) {
    return ['CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED'].includes(status);
  }
}

class ConvertedLeadState implements LeadState {
  canTransitionTo() { return false; }  // Estado final
}
```

**Por quê:** Transições de lead e deal têm regras (ex.: só converter de QUALIFIED). O State deixa essas regras explícitas e testáveis.

---

### 3.4 Observer ❌ **Não implementado**

**Como implementar:** Eventos de domínio e handlers.

```typescript
// Domain Event
class LeadConvertedEvent {
  constructor(
    public readonly leadId: string,
    public readonly contactId: string,
  ) {}
}

// Handlers
@Injectable()
class SendWelcomeEmailHandler {
  @OnEvent('lead.converted')
  handle(event: LeadConvertedEvent) {
    // Enviar email ao novo contato
  }
}

@Injectable()
class CreateDealFromLeadHandler {
  @OnEvent('lead.converted')
  handle(event: LeadConvertedEvent) {
    // Criar deal automaticamente
  }
}
```

**Por quê:** Desacopla ações secundárias (email, notificações, criação de deal) do use case de conversão. Facilita novas integrações sem alterar o core.

---

### 3.5 Mediator ❌ **Não implementado**

**Como implementar:** Mediador para orquestrar operações entre módulos.

```typescript
@Injectable()
class LeadConversionMediator {
  constructor(
    private leadRepo: ILeadRepository,
    private contactRepo: IContactRepository,
    private eventBus: EventBus,
  ) {}
  
  async convert(leadId: string): Promise<ConversionResult> {
    const lead = await this.leadRepo.findById(leadId);
    const contact = await this.contactRepo.create({...});
    await this.leadRepo.update(leadId, { contactId: contact.id, status: 'CONVERTED' });
    await this.eventBus.publish(new LeadConvertedEvent(leadId, contact.id));
    return { lead, contact };
  }
}
```

**Por quê:** `ConvertLeadUseCase` hoje coordena lead + contact. Um mediador centraliza essa orquestração e evita que use cases dependam uns dos outros diretamente.

---

### 3.6 Template Method ⚠️ **Parcial**

**Onde:** Use cases compartilham fluxo (validar → executar → persistir), mas sem classe base.

**Como implementar:** Classe base abstrata para use cases.

```typescript
abstract class BaseUseCase<TInput, TOutput> {
  async run(input: TInput): Promise<TOutput> {
    await this.validate(input);      // Template
    const result = await this.execute(input);
    await this.afterExecute(result);  // Hook opcional
    return result;
  }
  
  protected abstract execute(input: TInput): Promise<TOutput>;
  protected async validate(input: TInput): Promise<void> {}
  protected async afterExecute(result: TOutput): Promise<void> {}
}
```

**Por quê:** Padroniza fluxo (validação, logging, transação) e reduz duplicação entre use cases.

---

## 4. Value Objects (Padrão de Domínio)

**Onde:** `Email`, `Phone`, `LeadSource`, `DealValue`, `DomainUrl`.

**Como:** Objetos imutáveis que encapsulam validação e identidade por valor.

**Exemplo:**

```typescript
// src/modules/contacts/domain/value-objects/email.vo.ts
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new DomainError('Email inválido');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
```

**Por quê:** Garante que emails, telefones e valores monetários sejam sempre válidos. Evita validação espalhada e centraliza regras de domínio.

---

## 5. Resumo

| Categoria | Padrão | Status | Localização |
|-----------|--------|--------|-------------|
| **Criacional** | Factory Method | ✅ | Entidades (`static create`) |
| | Singleton | ✅ | NestJS DI, PrismaService |
| | Builder | ❌ | — |
| | Abstract Factory | ❌ | — |
| **Estrutural** | Adapter | ✅ | Repositórios Prisma + Mappers |
| | Facade | ✅ | Controllers, Use cases |
| | Composite | ✅ | Pipeline + PipelineStage |
| | Decorator | ❌ | — |
| | Proxy | ❌ | — |
| **Comportamental** | Command | ✅ | Use cases |
| | Strategy | ⚠️ | HttpExceptionFilter |
| | State | ❌ | — |
| | Observer | ❌ | — |
| | Mediator | ❌ | — |
| | Template Method | ⚠️ | Use cases (implícito) |

---

## 6. Prioridades de Implementação

1. **Observer / Eventos de domínio** — Desacoplar ações secundárias (emails, notificações).
2. **State** — Máquinas de estado para Lead e Deal.
3. **Decorator** — Cache e logging em repositórios.
4. **Builder** — Criação fluente de Deals e entidades complexas.
5. **Strategy** — Handlers de erro plugáveis.
6. **Template Method** — Base abstrata para use cases.

---

*Documento gerado a partir da análise do projeto CRM API — NestJS + Clean Architecture.*

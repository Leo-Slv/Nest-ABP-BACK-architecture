# ADR 001 — Arquitetura de domínio (DDD tático + eventos)

## Status

Aceito — alinhado à implementação atual do repositório Nest-ABP-BACK-architecture.

## Contexto

O backend expõe CRM (leads, contatos, empresas, deals, pipelines, tarefas) com NestJS e Prisma. Foi adotada separação por módulos com camadas `domain` / `application` / `infrastructure` / `presentation`.

## Decisões

1. **Aggregate Root**  
   Entidades com invariantes e eventos estendem `AggregateRoot` (`shared/domain/aggregate-root.ts`). Mutações passam por métodos do agregado; não há setters públicos soltos.

2. **Value Objects (Shared Kernel)**  
   `Email`, `Phone`, `Name` em `shared/domain/value-objects/` com erros semânticos (`InvalidEmailError`, etc.) herdando de `DomainError` → `AppError` com status HTTP adequado via filtro.

3. **Domain Events**  
   Eventos concretos por módulo (`domain/events/*.event.ts`). Publicação **após** commit de persistência no use case, via `IDomainEventDispatcher` global. Handlers registram-se em `OnModuleInit`.

4. **Specification**  
   Regras como unicidade de email/domínio implementam `Specification<T>` ou equivalente explícito (`*Spec` com `isSatisfiedBy`).

5. **Repositório**  
   Portas no domínio; adaptadores Prisma recebem **agregado** quando o fluxo é orientado a `create(aggregate)` / `update(aggregate)` e mapeiam com `*Mapper.toDomain` / `toPersistence`.

6. **Erros**  
   `AppError` + especializações (`NotFoundError`, `ConflictError`, `DomainError`, `*NotFoundError`). O `HttpExceptionFilter` mapeia `AppError` usando `statusCode`.

## Consequências

- Novos módulos devem seguir o mesmo padrão para manter previsibilidade.
- Eventos são **síncronos em memória**; fila externa/outbox seria uma evolução separada (novo ADR).

## Exceção documentada: conversão de Lead

O fluxo `ILeadRepository.convert` usa **uma transação Prisma** que cria `Contact` e atualiza `Lead`. Não passa pelo `Contact` aggregate nem pelo `CreateContactUseCase` para manter **atomicidade** num único `tx`. Evolução futura: porta `IContactRepository` com suporte a `TransactionClient` ou serviço de aplicação dedicado.

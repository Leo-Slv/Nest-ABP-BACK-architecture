# Conversão de Lead → Contact (transação única)

## Onde está

- `src/modules/leads/infrastructure/repositories/lead.prisma.repository.ts` — método `convert`.
- Orquestrado por `src/modules/leads/application/use-cases/convert-lead.usecase.ts`.

## Por que não usa `CreateContactUseCase` / agregado `Contact`

1. **Atomicidade**: criar contato e marcar lead como `CONVERTED` com `contactId` e `convertedAt` deve ser **tudo ou nada**.
2. **Prisma**: o padrão atual usa `prisma.$transaction` com o mesmo `tx` para `contact.create` e `lead.update`.
3. **Duplicação de regras**: email/telefone já foram validados na jornada do lead; o contato espelha dados persistidos do lead.

## Evoluções possíveis (sem mudar comportamento hoje)

- Extrair um **serviço de aplicação** `ConvertLeadService` testável com portas `ILeadRepository` + factory de dados de contato.
- Introduzir repositório de contato com método `createWithinTransaction(tx, ...)` retornando o agregado reconstituído.
- Emitir `LeadConvertedEvent` / `ContactCreatedEvent` após a transação (cuidado com ordem e idempotência).

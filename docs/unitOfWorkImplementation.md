🧠 VISÃO GERAL DA IMPLEMENTAÇÃO

Objetivo:

Introduzir um Unit of Work transacional, garantindo que todas as operações de banco ocorram dentro de uma única transação por caso de uso.

🧱 FASE 1 — CRIAR INFRAESTRUTURA BASE
🎯 Objetivo

Criar o núcleo transacional reutilizável

✅ Tarefa 1.1 — Criar TransactionContext

📂 shared/infrastructure/database/transaction-context.ts

export interface TransactionContext {
  client: any; // PoolClient (pg) ou equivalente
}
✅ Tarefa 1.2 — Criar UnitOfWork

📂 shared/infrastructure/database/unit-of-work.ts

export interface IUnitOfWork {
  execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}
✅ Tarefa 1.3 — Implementação concreta (Postgres / SQL)
import { Pool } from 'pg';

export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly pool: Pool) {}

  async execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await work({ client });

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
✅ Critério de aceite
Existe um ponto único que controla:
BEGIN
COMMIT
ROLLBACK
🧱 FASE 2 — ADAPTAR REPOSITORIES
🎯 Objetivo

Garantir que TODOS os repositories usem a MESMA transação

🚨 Regra obrigatória

Nenhum repository pode abrir conexão própria

✅ Tarefa 2.1 — Alterar construtor dos repositories

ANTES:

constructor(private readonly prisma: PrismaService) {}

DEPOIS:

constructor(private readonly ctx: TransactionContext) {}
✅ Tarefa 2.2 — Adaptar queries
await this.ctx.client.query(
  `INSERT INTO leads (id, name, email) VALUES ($1, $2, $3)`,
  [lead.id, lead.name.value, lead.email.value]
);
⚠️ Se houver Prisma

Se ainda existir:

✔ usar:

this.prisma.$transaction(async (tx) => { ... })

OU

❌ remover completamente (preferível no seu caso)

✅ Critério de aceite
Nenhum repository acessa DB diretamente sem ctx
Todas queries usam ctx.client
🧱 FASE 3 — INTEGRAR UOW NOS USE CASES
🎯 Objetivo

Toda operação de negócio deve ser transacional

✅ Tarefa 3.1 — Injetar UnitOfWork
constructor(
  private readonly uow: IUnitOfWork,
  private readonly leadRepositoryFactory: LeadRepositoryFactory
) {}
✅ Tarefa 3.2 — Refatorar execute()

ANTES:

await this.repository.save(lead);

DEPOIS:

await this.uow.execute(async (ctx) => {
  const repository = this.leadRepositoryFactory.create(ctx);

  await repository.save(lead);
});
🧠 IMPORTANTE

Você NÃO pode reutilizar repository fora da transação

✅ Tarefa 3.3 — Criar Factory de Repository

📂 lead.repository.factory.ts

export class LeadRepositoryFactory {
  create(ctx: TransactionContext) {
    return new LeadRepository(ctx);
  }
}
✅ Critério de aceite
Todos os UseCases usam uow.execute
Nenhuma operação de banco ocorre fora disso
🧱 FASE 4 — PADRONIZAR ACESSO A REPOSITORIES
🎯 Objetivo

Evitar erro de contexto/transação

✅ Regra obrigatória

Repository SEMPRE criado dentro do UoW

❌ ERRADO
const repo = new LeadRepository();
await repo.save();
✅ CERTO
await uow.execute(async (ctx) => {
  const repo = factory.create(ctx);
  await repo.save();
});
🧱 FASE 5 — DOMAIN EVENTS (NÍVEL AVANÇADO)
🎯 Objetivo

Executar eventos APÓS commit

✅ Tarefa 5.1 — Coletar eventos

No AggregateRoot (já existe no seu projeto):

getDomainEvents(): DomainEvent[] {}
✅ Tarefa 5.2 — UoW com dispatch pós-commit
const events: DomainEvent[] = [];

await this.uow.execute(async (ctx) => {
  const repo = factory.create(ctx);

  await repo.save(lead);

  events.push(...lead.getDomainEvents());
});

for (const event of events) {
  await this.eventBus.publish(event);
}
✅ Critério de aceite
Eventos NÃO são disparados antes do commit
🧱 FASE 6 — COBERTURA TOTAL DO SISTEMA
🎯 Objetivo

Garantir consistência global

📌 Aplicar em:
Create
Update
Delete
Processos de conversão
Operações com múltiplos repositories
🚨 Regra crítica

Qualquer operação com mais de 1 query → OBRIGATORIAMENTE dentro de UoW

🧱 FASE 7 — BOAS PRÁTICAS (OBRIGATÓRIO)
✅ 1. Um UoW por request
Nunca compartilhar entre requests
✅ 2. Não aninhar UoW

❌

uow.execute(() => {
  uow.execute(...)
});
✅ 3. Evitar lógica fora do UseCase
Controller NÃO usa repository
Service NÃO acessa DB diretamente
✅ 4. Logging transacional (recomendado)
BEGIN
COMMIT
ROLLBACK
📌 CHECKLIST FINAL PARA O CURSOR
✔ Infraestrutura
 Criar TransactionContext
 Criar UnitOfWork
✔ Repositories
 Recebem ctx
 Não criam conexão própria
✔ UseCases
 Todos usam uow.execute
✔ Factories
 Criadas para todos repositories
✔ Eventos
 Disparados após commit
✔ Regras globais
 Nenhuma query fora do UoW
 Uma transação por caso de uso
🧠 CONCLUSÃO

Você está basicamente transformando seu sistema em:

Consistente, transacional e preparado para escala real

Esse nível de controle:

elimina inconsistência de dados
permite evolução para:
CQRS
Event Sourcing
Outbox Pattern
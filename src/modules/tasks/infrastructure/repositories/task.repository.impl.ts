import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { TaskMapper } from '../../application/mappers/task.mapper.js';
import type {
  ITaskRepository,
  ListTasksParams,
  ListTasksResult,
} from '../../domain/repositories/task.repository.js';
import { Task } from '../../domain/entities/task.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class TaskSqlRepository implements ITaskRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(task: Task): Promise<Task> {
    const d = TaskMapper.toPersistence(task);
    const p = task.toPersistence();
    const r = await this.ctx.client.query(
      `INSERT INTO "Task" (
        "id", "title", "description", "type", "dueAt", "completedAt",
        "leadId", "contactId", "companyId", "dealId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4::"TaskType", $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        d.id,
        d.title,
        d.description,
        d.type,
        d.dueAt,
        d.completedAt,
        d.leadId,
        d.contactId,
        d.companyId,
        d.dealId,
        p.createdAt,
        p.updatedAt,
      ],
    );
    return TaskMapper.toDomain(r.rows[0]);
  }

  async update(task: Task): Promise<Task> {
    const d = TaskMapper.toPersistence(task);
    const p = task.toPersistence();
    const r = await this.ctx.client.query(
      `UPDATE "Task" SET
        "title" = $2, "description" = $3, "type" = $4::"TaskType",
        "dueAt" = $5, "completedAt" = $6,
        "leadId" = $7, "contactId" = $8, "companyId" = $9, "dealId" = $10,
        "updatedAt" = $11
      WHERE "id" = $1
      RETURNING *`,
      [
        task.id,
        d.title,
        d.description,
        d.type,
        d.dueAt,
        d.completedAt,
        d.leadId,
        d.contactId,
        d.companyId,
        d.dealId,
        p.updatedAt,
      ],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Tarefa ${task.id} não encontrada`);
    }
    return TaskMapper.toDomain(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const r = await this.ctx.client.query(
      `DELETE FROM "Task" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Tarefa ${id} não encontrada`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Task" WHERE "id" = $1`,
      [id],
    );
    return r.rows[0] ? TaskMapper.toDomain(r.rows[0]) : null;
  }

  async list(params: ListTasksParams): Promise<ListTasksResult> {
    const { page, limit, type, dealId, contactId } = params;
    const skip = (page - 1) * limit;
    const conds: string[] = [];
    const vals: unknown[] = [];
    let n = 1;

    if (type) {
      conds.push(`"type" = $${n}::"TaskType"`);
      vals.push(type);
      n += 1;
    }
    if (dealId) {
      conds.push(`"dealId" = $${n}`);
      vals.push(dealId);
      n += 1;
    }
    if (contactId) {
      conds.push(`"contactId" = $${n}`);
      vals.push(contactId);
      n += 1;
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const whereParams = [...vals];

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Task" ${where}`,
      whereParams,
    );
    const total = countR.rows[0].c as number;

    vals.push(limit, skip);
    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Task" ${where}
       ORDER BY "dueAt" ASC NULLS LAST
       LIMIT $${n} OFFSET $${n + 1}`,
      vals,
    );

    return {
      data: dataR.rows.map((row) => TaskMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}

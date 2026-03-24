import { randomUUID } from 'node:crypto';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { LeadMapper } from '../../application/mappers/lead.mapper.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import type {
  ILeadRepository,
  ListLeadsParams,
  ListLeadsResult,
} from '../../domain/repositories/lead.repository.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class LeadSqlRepository implements ILeadRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(lead: Lead): Promise<Lead> {
    const d = lead.toPersistence();
    const r = await this.ctx.client.query(
      `INSERT INTO "Lead" (
        "id", "name", "email", "phone", "source", "status", "notes",
        "convertedAt", "contactId", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6::"LeadStatus", $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        d.id,
        d.name,
        d.email,
        d.phone,
        d.source,
        d.status,
        d.notes,
        d.convertedAt,
        d.contactId,
        d.createdAt,
        d.updatedAt,
      ],
    );
    return LeadMapper.toDomain(r.rows[0]);
  }

  async update(lead: Lead): Promise<Lead> {
    const d = lead.toPersistence();
    const r = await this.ctx.client.query(
      `UPDATE "Lead" SET
        "name" = $2, "email" = $3, "phone" = $4, "source" = $5,
        "status" = $6::"LeadStatus", "notes" = $7, "convertedAt" = $8,
        "contactId" = $9, "updatedAt" = $10
      WHERE "id" = $1
      RETURNING *`,
      [
        lead.id,
        d.name,
        d.email,
        d.phone,
        d.source,
        d.status,
        d.notes,
        d.convertedAt,
        d.contactId,
        d.updatedAt,
      ],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Lead ${lead.id} não encontrado`);
    }
    return LeadMapper.toDomain(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const r = await this.ctx.client.query(
      `DELETE FROM "Lead" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Lead | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Lead" WHERE "id" = $1`,
      [id],
    );
    return r.rows[0] ? LeadMapper.toDomain(r.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Lead" WHERE "email" = $1 LIMIT 1`,
      [email],
    );
    return r.rows[0] ? LeadMapper.toDomain(r.rows[0]) : null;
  }

  async list(params: ListLeadsParams): Promise<ListLeadsResult> {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;
    const conds: string[] = [];
    const vals: unknown[] = [];
    let n = 1;

    if (search) {
      const p = `%${search}%`;
      conds.push(`("name" ILIKE $${n} OR "email" ILIKE $${n + 1})`);
      vals.push(p, p);
      n += 2;
    }
    if (status) {
      conds.push(`"status" = $${n}::"LeadStatus"`);
      vals.push(status);
      n += 1;
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const whereParams = [...vals];

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Lead" ${where}`,
      whereParams,
    );
    const total = countR.rows[0].c as number;

    vals.push(limit, skip);
    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Lead" ${where}
       ORDER BY "createdAt" DESC
       LIMIT $${n} OFFSET $${n + 1}`,
      vals,
    );

    return {
      data: dataR.rows.map((row) => LeadMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }

  async convert(leadId: string): Promise<Lead> {
    const found = await this.ctx.client.query(
      `SELECT * FROM "Lead" WHERE "id" = $1 FOR UPDATE`,
      [leadId],
    );
    const lead = found.rows[0];
    if (!lead) {
      throw new NotFoundError(`Lead ${leadId} não encontrado`);
    }
    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictError(`Lead ${leadId} já foi convertido`);
    }

    const contactId = randomUUID();
    await this.ctx.client.query(
      `INSERT INTO "Contact" (
        "id", "name", "email", "phone", "role", "companyId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        contactId,
        lead.name,
        lead.email,
        lead.phone,
        null,
        null,
      ],
    );

    const upd = await this.ctx.client.query(
      `UPDATE "Lead" SET
        "status" = $1::"LeadStatus",
        "contactId" = $2,
        "convertedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "id" = $3
      RETURNING *`,
      [LeadStatus.CONVERTED, contactId, leadId],
    );
    return LeadMapper.toDomain(upd.rows[0]);
  }
}

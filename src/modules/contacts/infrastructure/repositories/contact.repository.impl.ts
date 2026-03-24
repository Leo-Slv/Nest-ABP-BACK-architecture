import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { ContactMapper } from '../../application/mappers/contact.mapper.js';
import type {
  IContactRepository,
  ListContactsParams,
  ListContactsResult,
} from '../../domain/repositories/contact.repository.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class ContactSqlRepository implements IContactRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(contact: Contact): Promise<Contact> {
    const d = ContactMapper.toPersistence(contact);
    const r = await this.ctx.client.query(
      `INSERT INTO "Contact" (
        "id", "name", "email", "phone", "role", "companyId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        d.id,
        d.name,
        d.email,
        d.phone,
        d.role,
        d.companyId,
        d.createdAt,
        d.updatedAt,
      ],
    );
    return ContactMapper.toDomain(r.rows[0]);
  }

  async update(contact: Contact): Promise<Contact> {
    const d = ContactMapper.toPersistence(contact);
    const r = await this.ctx.client.query(
      `UPDATE "Contact" SET
        "name" = $2, "email" = $3, "phone" = $4, "role" = $5,
        "companyId" = $6, "updatedAt" = $7
      WHERE "id" = $1
      RETURNING *`,
      [
        contact.id,
        d.name,
        d.email,
        d.phone,
        d.role,
        d.companyId,
        d.updatedAt,
      ],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Contato ${contact.id} não encontrado`);
    }
    return ContactMapper.toDomain(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const r = await this.ctx.client.query(
      `DELETE FROM "Contact" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Contato ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Contact | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Contact" WHERE "id" = $1`,
      [id],
    );
    return r.rows[0] ? ContactMapper.toDomain(r.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Contact" WHERE "email" = $1`,
      [email],
    );
    return r.rows[0] ? ContactMapper.toDomain(r.rows[0]) : null;
  }

  async list(params: ListContactsParams): Promise<ListContactsResult> {
    const { page, limit, search } = params;
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
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const whereParams = [...vals];

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Contact" ${where}`,
      whereParams,
    );
    const total = countR.rows[0].c as number;

    vals.push(limit, skip);
    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Contact" ${where}
       ORDER BY "createdAt" DESC
       LIMIT $${n} OFFSET $${n + 1}`,
      vals,
    );

    return {
      data: dataR.rows.map((row) => ContactMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}

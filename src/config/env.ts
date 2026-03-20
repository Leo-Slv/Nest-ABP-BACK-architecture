import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Ambiente de execução'),
  PORT: z.coerce.number().default(3000).describe('Porta do servidor'),
  DATABASE_URL: z.string().min(1).describe('URL de conexão PostgreSQL'),
});

export const env = envSchema.parse(process.env);

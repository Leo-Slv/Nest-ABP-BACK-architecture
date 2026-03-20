import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundError(`Empresa ${id} não encontrada`);
    }
    await this.repository.delete(id);
  }
}

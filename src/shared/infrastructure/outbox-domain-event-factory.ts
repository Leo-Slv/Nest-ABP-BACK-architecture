import type { DomainEvent } from '../domain/domain-event.js';
import { CompanyCreatedEvent } from '../../modules/companies/domain/events/company-created.event.js';
import { CompanyDeletedEvent } from '../../modules/companies/domain/events/company-deleted.event.js';
import { CompanyUpdatedEvent } from '../../modules/companies/domain/events/company-updated.event.js';
import { ContactCreatedEvent } from '../../modules/contacts/domain/events/contact-created.event.js';
import { ContactDeletedEvent } from '../../modules/contacts/domain/events/contact-deleted.event.js';
import { ContactUpdatedEvent } from '../../modules/contacts/domain/events/contact-updated.event.js';
import { DealCreatedEvent } from '../../modules/deals/domain/events/deal-created.event.js';
import { DealStageMovedEvent } from '../../modules/deals/domain/events/deal-stage-moved.event.js';
import { DealUpdatedEvent } from '../../modules/deals/domain/events/deal-updated.event.js';
import { DealStage } from '../../modules/deals/domain/enums/deal-stage.enum.js';
import { LeadCreatedEvent } from '../../modules/leads/domain/events/lead-created.event.js';
import { LeadUpdatedEvent } from '../../modules/leads/domain/events/lead-updated.event.js';
import { PipelineCreatedEvent } from '../../modules/pipelines/domain/events/pipeline-created.event.js';
import { PipelineUpdatedEvent } from '../../modules/pipelines/domain/events/pipeline-updated.event.js';
import { TaskCompletedEvent } from '../../modules/tasks/domain/events/task-completed.event.js';
import { TaskCreatedEvent } from '../../modules/tasks/domain/events/task-created.event.js';
import { TaskDeletedEvent } from '../../modules/tasks/domain/events/task-deleted.event.js';
import { TaskUpdatedEvent } from '../../modules/tasks/domain/events/task-updated.event.js';

/**
 * Rehydrates a domain event from persisted outbox row for handler dispatch.
 * Add a branch here when introducing a new event class.
 */
export function deserializeDomainEvent(
  eventName: string,
  payload: unknown,
): DomainEvent | null {
  const p = payload as Record<string, unknown>;
  switch (eventName) {
    case 'LeadCreatedEvent':
      return new LeadCreatedEvent(p.leadId as string);
    case 'LeadUpdatedEvent':
      return new LeadUpdatedEvent(p.leadId as string);
    case 'ContactCreatedEvent':
      return new ContactCreatedEvent(p.contactId as string);
    case 'ContactUpdatedEvent':
      return new ContactUpdatedEvent(p.contactId as string);
    case 'ContactDeletedEvent':
      return new ContactDeletedEvent(p.contactId as string);
    case 'CompanyCreatedEvent':
      return new CompanyCreatedEvent(p.companyId as string);
    case 'CompanyUpdatedEvent':
      return new CompanyUpdatedEvent(p.companyId as string);
    case 'CompanyDeletedEvent':
      return new CompanyDeletedEvent(p.companyId as string);
    case 'DealCreatedEvent':
      return new DealCreatedEvent(p.dealId as string);
    case 'DealUpdatedEvent':
      return new DealUpdatedEvent(p.dealId as string);
    case 'DealStageMovedEvent':
      return new DealStageMovedEvent(
        p.dealId as string,
        p.stage as DealStage,
      );
    case 'PipelineCreatedEvent':
      return new PipelineCreatedEvent(p.pipelineId as string);
    case 'PipelineUpdatedEvent':
      return new PipelineUpdatedEvent(p.pipelineId as string);
    case 'TaskCreatedEvent':
      return new TaskCreatedEvent(p.taskId as string);
    case 'TaskUpdatedEvent':
      return new TaskUpdatedEvent(p.taskId as string);
    case 'TaskCompletedEvent':
      return new TaskCompletedEvent(p.taskId as string);
    case 'TaskDeletedEvent':
      return new TaskDeletedEvent(p.taskId as string);
    default:
      return null;
  }
}

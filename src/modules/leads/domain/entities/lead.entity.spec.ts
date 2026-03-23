import { Lead } from './lead.entity.js';
import { LeadStatus } from '../enums/lead-status.enum.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { LeadSource } from '../value-objects/lead-source.vo.js';

describe('Lead Aggregate', () => {
  const validEmail = new Email('test@example.com');
  const validPhone = new Phone('11999999999');
  const validSource = new LeadSource('Website');

  describe('create', () => {
    it('should create a lead with required fields', () => {
      const lead = Lead.create({
        name: new Name('John Doe'),
        email: validEmail,
      });

      expect(lead.id).toBeDefined();
      expect(lead.name).toBe('John Doe');
      expect(lead.emailValue).toBe('test@example.com');
      expect(lead.phoneValue).toBeNull();
      expect(lead.sourceValue).toBeNull();
      expect(lead.status).toBe(LeadStatus.NEW);
      expect(lead.notes).toBeNull();
      expect(lead.convertedAt).toBeNull();
      expect(lead.contactId).toBeNull();
      expect(lead.domainEvents).toHaveLength(1);
      expect(lead.domainEvents[0].constructor.name).toBe('LeadCreatedEvent');
    });

    it('should create a lead with optional fields', () => {
      const lead = Lead.create({
        name: new Name('Jane Doe'),
        email: validEmail,
        phone: validPhone,
        source: validSource,
        status: LeadStatus.QUALIFIED,
        notes: 'Hot lead',
      });

      expect(lead.name).toBe('Jane Doe');
      expect(lead.phoneValue).toBe('11999999999');
      expect(lead.sourceValue).toBe('Website');
      expect(lead.status).toBe(LeadStatus.QUALIFIED);
      expect(lead.notes).toBe('Hot lead');
    });

    it('should generate unique ids', () => {
      const lead1 = Lead.create({ name: new Name('AA'), email: validEmail });
      const lead2 = Lead.create({ name: new Name('BB'), email: new Email('b@x.com') });
      expect(lead1.id).not.toBe(lead2.id);
    });
  });

  describe('change methods', () => {
    it('should change email and add LeadUpdatedEvent', () => {
      const lead = Lead.create({ name: new Name('Test'), email: validEmail });
      lead.clearEvents();

      const newEmail = new Email('new@example.com');
      lead.changeEmail(newEmail);

      expect(lead.emailValue).toBe('new@example.com');
      expect(lead.domainEvents).toHaveLength(1);
      expect(lead.domainEvents[0].constructor.name).toBe('LeadUpdatedEvent');
    });

    it('should change name', () => {
      const lead = Lead.create({ name: new Name('Old'), email: validEmail });
      lead.clearEvents();
      lead.changeName(new Name('New Name'));
      expect(lead.name).toBe('New Name');
    });

    it('should change phone', () => {
      const lead = Lead.create({ name: new Name('Test'), email: validEmail });
      lead.clearEvents();
      lead.changePhone(validPhone);
      expect(lead.phoneValue).toBe('11999999999');
    });

    it('should change status', () => {
      const lead = Lead.create({ name: new Name('Test'), email: validEmail });
      lead.clearEvents();
      lead.changeStatus(LeadStatus.CONTACTED);
      expect(lead.status).toBe(LeadStatus.CONTACTED);
    });

    it('should mark as converted', () => {
      const lead = Lead.reconstitute({
        id: 'test-id',
        name: new Name('Test'),
        email: validEmail,
        phone: null,
        source: null,
        status: LeadStatus.QUALIFIED,
        notes: null,
        convertedAt: null,
        contactId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      lead.markAsConverted('contact-123');
      expect(lead.contactId).toBe('contact-123');
      expect(lead.status).toBe(LeadStatus.CONVERTED);
      expect(lead.convertedAt).toBeInstanceOf(Date);
    });
  });

  describe('toPersistence', () => {
    it('should export persistence snapshot', () => {
      const lead = Lead.create({
        name: new Name('Test'),
        email: validEmail,
        phone: validPhone,
      });
      const snap = lead.toPersistence();
      expect(snap.id).toBe(lead.id);
      expect(snap.name).toBe('Test');
      expect(snap.email).toBe('test@example.com');
      expect(snap.phone).toBe('11999999999');
      expect(snap.status).toBe(LeadStatus.NEW);
    });
  });
});

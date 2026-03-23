import { LeadFactory } from './lead.factory.js';

describe('LeadFactory', () => {
  const factory = new LeadFactory();

  it('should create a lead from raw props', () => {
    const lead = factory.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '11987654321',
      source: 'LinkedIn',
      notes: 'Interested',
    });

    expect(lead.id).toBeDefined();
    expect(lead.name).toBe('Jane Doe');
    expect(lead.emailValue).toBe('jane@example.com');
    expect(lead.phoneValue).toBe('11987654321');
    expect(lead.sourceValue).toBe('LinkedIn');
    expect(lead.notes).toBe('Interested');
  });

  it('should throw on invalid email', () => {
    expect(() =>
      factory.create({
        name: 'Test',
        email: 'invalid-email',
      }),
    ).toThrow();
  });

  it('should throw on invalid phone', () => {
    expect(() =>
      factory.create({
        name: 'Test',
        email: 'test@x.com',
        phone: '123', // too short
      }),
    ).toThrow();
  });

  it('should allow null optional fields', () => {
    const lead = factory.create({
      name: 'Minimal',
      email: 'min@test.com',
    });
    expect(lead.phoneValue).toBeNull();
    expect(lead.sourceValue).toBeNull();
  });
});

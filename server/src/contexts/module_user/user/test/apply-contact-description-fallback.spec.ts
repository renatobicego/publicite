import { applyContactDescriptionFallback } from '../infrastructure/repository/apply-contact-description-fallback';

describe('applyContactDescriptionFallback', () => {
  it('no hace nada si user es null/undefined', () => {
    expect(() => applyContactDescriptionFallback(null)).not.toThrow();
    expect(() => applyContactDescriptionFallback(undefined)).not.toThrow();
  });

  it('si Contact.description.text existe, lo copia a user.description (compat top-level)', () => {
    const user: any = {
      description: 'algo viejo',
      contact: {
        description: { text: 'lo nuevo del contact', visibility: 'friends' },
      },
    };

    applyContactDescriptionFallback(user);

    expect(user.description).toBe('lo nuevo del contact');
    expect(user.contact.description).toEqual({
      text: 'lo nuevo del contact',
      visibility: 'friends',
    });
  });

  it('si Contact.description.text vacío y existe legacy User.description, lo mappea a {text, visibility:public}', () => {
    const user: any = {
      description: 'descripcion legacy',
      contact: { phone: '123' },
    };

    applyContactDescriptionFallback(user);

    expect(user.contact.description).toEqual({
      text: 'descripcion legacy',
      visibility: 'public',
    });
    expect(user.description).toBe('descripcion legacy');
  });

  it('si no existe ni legacy ni contact.description, no setea nada raro', () => {
    const user: any = {
      contact: { phone: '123' },
    };

    applyContactDescriptionFallback(user);

    expect(user.contact.description).toBeUndefined();
    expect(user.description).toBeUndefined();
  });

  it('si user no tiene contact, no rompe', () => {
    const user: any = { description: 'algo' };

    expect(() => applyContactDescriptionFallback(user)).not.toThrow();
    expect(user.description).toBe('algo');
  });

  it('si Contact.description existe pero text vacío string, usa fallback legacy', () => {
    const user: any = {
      description: 'legacy',
      contact: { description: { text: '', visibility: 'public' } },
    };

    applyContactDescriptionFallback(user);

    expect(user.contact.description).toEqual({
      text: 'legacy',
      visibility: 'public',
    });
  });
});

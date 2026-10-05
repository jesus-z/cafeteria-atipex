import { describe, expect, it } from 'vitest';
import { obtenerRol, ROLES, rutaPorRol } from '../auth/session';

describe('autenticación y control de acceso CAF-1', () => {
  it('asigna el rol cliente por defecto', () => {
    expect(obtenerRol({ user_metadata: {} })).toBe(ROLES.CLIENTE);
    expect(rutaPorRol({ user_metadata: {} })).toBe('/mi-cuenta');
  });

  it('reconoce un administrador desde metadata segura', () => {
    const user = { app_metadata: { role: 'admin' } };
    expect(obtenerRol(user)).toBe(ROLES.ADMIN);
    expect(rutaPorRol(user)).toBe('/admin');
  });

  it('no eleva roles desconocidos a administrador', () => {
    expect(obtenerRol({ user_metadata: { role: 'superadmin' } })).toBe(ROLES.CLIENTE);
  });
});

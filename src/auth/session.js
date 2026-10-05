export const ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
};

export function obtenerRol(user) {
  const rol = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return rol === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CLIENTE;
}

export function rutaPorRol(user) {
  return obtenerRol(user) === ROLES.ADMIN ? '/admin' : '/mi-cuenta';
}

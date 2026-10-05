import { Link } from 'react-router-dom';

export default function PanelUsuario({ sesion, administrador = false }) {
  return (
    <main className="auth-panel">
      <h2>{administrador ? 'Panel de administración' : 'Mi cuenta'}</h2>
      <p>Sesión iniciada como <strong>{sesion.email}</strong>.</p>
      <p>Rol activo: <strong>{sesion.rol}</strong>.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}

import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ sesion, rolRequerido, children }) {
  if (!sesion) return <Navigate to="/" replace />;
  if (rolRequerido && sesion.rol !== rolRequerido) {
    return <Navigate to="/mi-cuenta" replace />;
  }
  return children;
}

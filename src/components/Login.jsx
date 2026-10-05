import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: usuario.trim(),
        password: contrasena
      });

      if (authError) throw authError;

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>☕ Bienvenido a Café Salud</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={manejarLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <p className="slogan">Tu cuerpo merece un buen café y mejor atención.</p>
      </div>
    </div>
  );
}

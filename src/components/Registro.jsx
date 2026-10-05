// src/components/Registro.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Registro.css';

// ============================================================================
// 2. FUNCIONES AUXILIARES (lógica de negocio y utilidades)
// ============================================================================

/**
 * Valida que la contraseña cumpla con los requisitos mínimos.
 * @param {string} password - Contraseña a validar.
 * @returns {boolean} true si es válida, false en caso contrario.
 * @throws {Error} Si la contraseña es demasiado corta.
 */
const validarContrasena = (password) => {
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  return true;
};

/**
 * Registra un nuevo usuario en Supabase.
 * @param {string} email - Correo electrónico (usado como usuario).
 * @param {string} password - Contraseña.
 * @returns {Promise<Object>} Datos del usuario registrado.
 * @throws {Error} Si falla el registro o la validación.
 */
const registrarUsuario = async (email, password) => {
  // Validar contraseña antes de llamar a Supabase
  validarContrasena(password);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { role: 'cliente' } },
  });

  if (error) throw new Error(error.message || 'Error al registrar usuario.');
  return data;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente de registro de usuario.
 * Muestra un formulario con campos de usuario y contraseña, maneja el registro
 * con Supabase y notifica al componente padre mediante el callback `onRegistroExitoso`.
 * @param {Object} props
 * @param {Function} props.onRegistroExitoso - Callback que se ejecuta tras un registro exitoso.
 */
export default function Registro({ onRegistroExitoso }) {
  // Estado del formulario y mensajes
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Maneja el envío del formulario de registro.
   * Valida, registra en Supabase y maneja la respuesta (éxito o error).
   */
  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      // Llamar a la función de registro (incluye validación interna)
      await registrarUsuario(usuario, contrasena);

      // Éxito: mostrar mensaje, resetear campos y ejecutar callback
      setMensaje('✅ Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      onRegistroExitoso && onRegistroExitoso();
      setUsuario('');
      setContrasena('');
    } catch (err) {
      // Capturar cualquier error (de validación o de Supabase)
      setMensaje(`⚠️ ${err.message || 'Error al registrar usuario.'}`);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================================================
  // RENDERIZADO
  // ==========================================================================

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>📝 Registro de Usuario</h2>
        {mensaje && <p className="mensaje">{mensaje}</p>}
        <form onSubmit={manejarRegistro}>
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
            autoComplete="new-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="slogan">Forma parte de nuestra comunidad saludable ☕</p>
      </div>
    </div>
  );
}

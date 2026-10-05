// src/App.jsx
import { BrowserRouter, Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Carousel from './components/Carousel';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Productos from './components/Productos';
import PageLoader from './components/PageLoader';
import MenuAccordion from './components/MenuAccordion';
import MapSection from './components/MapSection';
import Carrito from './components/Carrito';
import ReservaMesas from './components/ReservaMesas';
import Login from './components/Login';
import Registro from './components/Registro';
import RutaProtegida from './components/RutaProtegida';
import PanelUsuario from './components/PanelUsuario';
import { supabase } from './lib/supabase';
import { obtenerRol, rutaPorRol } from './auth/session';

const normalizarSesion = (authSession) => authSession?.user
  ? {
      id: authSession.user.id,
      email: authSession.user.email,
      rol: obtenerRol(authSession.user),
    }
  : null;

// ============================================================================
// 1. CONSTANTES DE ESTILOS (Separación de Concerns)
// ============================================================================

/** Estilos para el overlay del modal (fondo oscuro y centrado) */
const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(4px)',
};

/** Estilos para el contenido del modal (tarjeta blanca) */
const MODAL_STYLES = {
  position: 'relative',
  width: '80%',
  maxWidth: '550px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(255, 0, 0, 0.3)',
  overflow: 'hidden',

  // Nuevas propiedades para la imagen de fondo:
  backgroundImage: 'url("fondo2.jpg")',
  backgroundSize: 'cover',        // Hace que la imagen cubra todo el modal
  backgroundPosition: 'center',  // Centra la imagen
  backgroundRepeat: 'no-repeat',
};
/** Estilos para el botón de cerrar (X) */
const CLOSE_BUTTON_STYLES = {
  position: 'absolute',
  top: '12px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#333',
  lineHeight: 1,
};

/** Estilos para el botón de alternar entre login y registro */
const TOGGLE_BUTTON_STYLES = {
  background: 'transparent',
  border: 'none',
  color: '#27ae60',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9rem',
};

// ============================================================================
// 2. COMPONENTE HOME (página principal)
// ============================================================================

/**
 * Componente que representa la página de inicio.
 * Agrupa todas las secciones principales (carrusel, menú, galería, testimonios, mapa, contacto).
 * @param {Object} props
 * @param {Function} props.agregarAlCarrito - Función para añadir productos al carrito.
 */
function Home({ agregarAlCarrito }) {
  return (
    <>
      <PageLoader />
      <main>
        <Carousel />
        <MenuAccordion agregarAlCarrito={agregarAlCarrito} />
        <Gallery />
        <Testimonials />
        <MapSection />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL APP
// ============================================================================

/**
 * Componente raíz de la aplicación.
 * Gestiona el estado global del carrito, la autenticación y el modal de login/registro.
 * Aplica SRP: cada función tiene una única responsabilidad.
 */
function AppContent() {
  const navigate = useNavigate();
  // ========== ESTADOS GLOBALES ==========
  const [carrito, setCarrito] = useState([]);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [sesion, setSesion] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // ========== FUNCIONES DEL CARRITO ==========

  /**
   * Agrega un producto al carrito.
   * Si el producto ya existe, incrementa la cantidad; si no, lo añade con cantidad 1.
   * @param {Object} producto - Producto a agregar (debe tener al menos nombre).
   */
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.nombre === producto.nombre);
      if (existente) {
        return prev.map((item) =>
          item.nombre === producto.nombre
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  /**
   * Elimina un producto del carrito por su índice.
   * @param {number} index - Índice del producto en el array del carrito.
   */
  const eliminarDelCarrito = (index) => {
    setCarrito((prev) => {
      const nuevo = [...prev];
      nuevo.splice(index, 1);
      return nuevo;
    });
  };

  // ========== AUTENTICACIÓN ==========

  /**
   * Maneja el inicio de sesión exitoso.
   * Actualiza los estados de autenticación y cierra el modal.
   * @param {string} usuario - Nombre del usuario.
   * @param {number} tipo - Tipo de usuario (0: normal, 1: admin).
   */
  const handleLogin = (user) => {
    const nuevaSesion = {
      id: user.id,
      email: user.email,
      rol: obtenerRol(user),
    };
    setSesion(nuevaSesion);
    cerrarModal();
    navigate(rutaPorRol(user));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSesion(null);
      navigate('/');
    }
  };

  // ========== CONTROL DEL MODAL ==========

  /** Abre el modal en modo login. */
  const abrirLogin = () => {
    setMostrarModal(true);
    setModoRegistro(false);
  };

  /** Cierra el modal y resetea el modo. */
  const cerrarModal = () => {
    setMostrarModal(false);
    setModoRegistro(false);
  };

  /** Alterna entre el formulario de login y el de registro. */
  const toggleModo = () => {
    setModoRegistro((prev) => !prev);
  };

  useEffect(() => {
    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (activo) {
        setSesion(normalizarSesion(data.session));
        setVerificandoSesion(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, authSession) => {
      if (activo) setSesion(normalizarSesion(authSession));
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ========== RENDERIZADO PRINCIPAL ==========

  return (
    <>
      {/* Encabezado con el botón de Login */}
      <Header onLoginClick={abrirLogin} sesion={sesion} onLogout={handleLogout} />

      {/* Menú desplegable del carrito */}
      <Carrito
        carrito={carrito}
        setCarrito={setCarrito}
        eliminarDelCarrito={eliminarDelCarrito}
        visible={carritoVisible}
        setVisible={setCarritoVisible}
      />

      {/* Definición de rutas */}
      <Routes>
        <Route
          path="/"
          element={<Home agregarAlCarrito={agregarAlCarrito} />}
        />
        <Route
          path="/mi-cuenta"
          element={
            <RutaProtegida sesion={sesion}>
              <PanelUsuario sesion={sesion} />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RutaProtegida sesion={sesion} rolRequerido="admin">
              <PanelUsuario sesion={sesion} administrador />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/productos"
          element={
            <>
              <Productos />
              <Footer />
            </>
          }
        />
        <Route
          path="/reservas"
          element={
            <>
              <ReservaMesas />
              <Footer />
            </>
          }
        />
      </Routes>

      {/* ===== MODAL DE LOGIN / REGISTRO (con Portal) ===== */}
      {!verificandoSesion && mostrarModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={cerrarModal}
            style={OVERLAY_STYLES}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={MODAL_STYLES}
            >
              {/* Botón de cierre */}
              <button
                onClick={cerrarModal}
                style={CLOSE_BUTTON_STYLES}
              >
                ×
              </button>

              {/* Contenido dinámico: Login o Registro */}
              {modoRegistro ? (
                <Registro onRegistroExitoso={cerrarModal} />
              ) : (
                <Login onLoginSuccess={handleLogin} />
              )}

              {/* Enlace para cambiar de modo */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={toggleModo}
                  style={TOGGLE_BUTTON_STYLES}
                >
                  {modoRegistro
                    ? '¿Ya tienes cuenta? Iniciar sesión'
                    : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

// CAF-2: Menú interactivo organizado por categorías (Dev 2)
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './MenuAccordion.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, imagen_url, categoria_id, categorias(nombre)')
    .eq('activo', true)
    .gt('stock', 0);

  if (error) throw new Error(error.message);
  return data || [];
};

const agruparPorCategoria = (productos) =>
  productos.reduce((grupos, producto) => {
    const categoria = producto.categorias?.nombre || 'Otros';
    if (!grupos[categoria]) grupos[categoria] = [];
    grupos[categoria].push(producto);
    return grupos;
  }, {});

function ProductItem({ producto, agregarAlCarrito }) {
  const imagen = producto.imagen_url
    ? producto.imagen_url + '?width=120&height=120&fit=crop'
    : '/default-product.png';

  return (
    <li className="menu-item">
      <img
        src={imagen}
        alt={producto.nombre}
        className="menu-img"
        loading="lazy"
        decoding="async"
        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
      />
      <div>
        <strong>{producto.nombre}</strong>
        {producto.descripcion && <p>{producto.descripcion}</p>}
        <p>Precio: Bs. {Number(producto.precio || 0).toFixed(2)}</p>
        <button
          className="btn-pedir"
          type="button"
          onClick={() => agregarAlCarrito?.({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio || 0),
          })}
          aria-label={'Pedir ' + producto.nombre}
        >
          Pedir
        </button>
      </div>
    </li>
  );
}

function ListaProductos({ productos, agregarAlCarrito, tamanoLote = 20 }) {
  const [cantidadVisible, setCantidadVisible] = useState(tamanoLote);

  useEffect(() => {
    setCantidadVisible(tamanoLote);
  }, [productos, tamanoLote]);

  const visibles = productos.slice(0, cantidadVisible);
  const hayMas = cantidadVisible < productos.length;

  return (
    <div>
      <ul className="menu-items" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {visibles.map((producto) => (
          <ProductItem
            key={producto.id}
            producto={producto}
            agregarAlCarrito={agregarAlCarrito}
          />
        ))}
      </ul>
      {hayMas && (
        <div style={{ textAlign: 'center', padding: '8px', color: '#666', fontSize: '0.9rem' }}>
          <p role="status">Mostrando {visibles.length} de {productos.length} productos</p>
          <button
            type="button"
            onClick={() => setCantidadVisible((actual) => Math.min(actual + tamanoLote, productos.length))}
            style={{ marginTop: '5px', padding: '5px 15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}

export default function MenuAccordion({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    const cargarProductos = async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await obtenerProductos();
        if (activo) setProductos(datos);
      } catch (err) {
        if (activo) setError('No se pudo cargar el menú. Intenta nuevamente.');
        console.error('Error al cargar productos:', err);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarProductos();
    return () => {
      activo = false;
    };
  }, [intento]);

  const productosPorCategoria = useMemo(
    () => agruparPorCategoria(productos),
    [productos]
  );
  const categorias = Object.entries(productosPorCategoria).sort(([a], [b]) => a.localeCompare(b, 'es'));

  return (
    <section className="menu-accordion" aria-busy={cargando}>
      <h2 className="menu-title">Nuestro Menú</h2>
      {cargando && <p role="status">Cargando menú…</p>}
      {!cargando && error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setIntento((actual) => actual + 1)}>Reintentar</button>
        </div>
      )}
      {!cargando && !error && productos.length === 0 && (
        <p>No hay productos disponibles por el momento.</p>
      )}

      {!cargando && !error && categorias.map(([categoria, items], indice) => {
        const abierto = categoriaActiva === categoria;
        const botonId = 'menu-toggle-' + indice;
        const panelId = 'menu-panel-' + indice;
        return (
          <div className="menu-section" key={categoria}>
            <button
              id={botonId}
              className="menu-toggle"
              type="button"
              aria-expanded={abierto}
              aria-controls={panelId}
              onClick={() => setCategoriaActiva(abierto ? null : categoria)}
            >
              {categoria} <span aria-hidden="true">{abierto ? '▲' : '▼'}</span>
            </button>
            {abierto && (
              <div id={panelId} role="region" aria-labelledby={botonId}>
                <ListaProductos
                  productos={items}
                  agregarAlCarrito={agregarAlCarrito}
                />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

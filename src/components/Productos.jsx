// CAF-2: Catálogo interactivo por categorías (Dev 2)
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const obtenerProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, imagen_url, categorias(nombre)')
    .eq('activo', true)
    .gt('stock', 0);

  if (error) throw new Error(error.message);
  return data || [];
};

const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
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
        if (activo) setError('No se pudo cargar el catálogo. Intenta nuevamente.');
        console.error('Error al obtener productos:', err);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarProductos();
    return () => {
      activo = false;
    };
  }, [intento]);

  const categorias = useMemo(() => {
    const nombres = productos.map((producto) => producto.categorias?.nombre || 'Otros');
    return ['Todas', ...new Set(nombres)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return productos.filter((producto) => {
      const categoria = producto.categorias?.nombre || 'Otros';
      const coincideCategoria = categoriaActiva === 'Todas' || categoria === categoriaActiva;
      const textoProducto = [producto.nombre, producto.descripcion || '', categoria].join(' ');
      const coincideBusqueda = !termino || normalizar(textoProducto).includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoriaActiva, busqueda]);

  return (
    <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Catálogo de productos</h2>
      <p>Explora nuestros productos y filtra por categoría.</p>

      <label htmlFor="busqueda-productos">Buscar productos</label>
      <input
        id="busqueda-productos"
        type="search"
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
        placeholder="Nombre o descripción"
        style={{ display: 'block', width: '100%', maxWidth: '420px', padding: '0.7rem', margin: '0.5rem 0 1rem' }}
      />

      <div role="group" aria-label="Filtrar productos por categoría" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            type="button"
            aria-pressed={categoriaActiva === categoria}
            onClick={() => setCategoriaActiva(categoria)}
            style={{ padding: '0.55rem 0.9rem', borderRadius: '999px', border: '1px solid #8b5e3c', background: categoriaActiva === categoria ? '#8b5e3c' : '#fff', color: categoriaActiva === categoria ? '#fff' : '#4a3325', cursor: 'pointer' }}
          >
            {categoria}
          </button>
        ))}
      </div>

      {cargando && <p role="status">Cargando productos…</p>}
      {!cargando && error && (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setIntento((actual) => actual + 1)}>Reintentar</button>
        </div>
      )}
      {!cargando && !error && productos.length === 0 && (
        <p>No hay productos disponibles por el momento.</p>
      )}
      {!cargando && !error && productos.length > 0 && productosFiltrados.length === 0 && (
        <p role="status">No hay productos que coincidan con los filtros seleccionados.</p>
      )}

      {!cargando && !error && productosFiltrados.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {productosFiltrados.map((producto) => {
            const categoria = producto.categorias?.nombre || 'Otros';
            return (
              <article key={producto.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1rem', background: '#fff' }}>
                <img
                  src={producto.imagen_url || '/default-product.png'}
                  alt={producto.nombre}
                  loading="lazy"
                  style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <p style={{ marginBottom: '0.25rem', color: '#6b4b37' }}>{categoria}</p>
                <h3 style={{ margin: '0.25rem 0' }}>{producto.nombre}</h3>
                {producto.descripcion && <p>{producto.descripcion}</p>}
                <p><strong>Bs. {Number(producto.precio || 0).toFixed(2)}</strong></p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

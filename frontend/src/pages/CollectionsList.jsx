import { useCallback, useEffect, useState } from 'react';
import CollectionCard from '../components/collections/CollectionCard';
import { fetchCollections } from '../api/collections';

function CollectionsList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const list = await fetchCollections();
      setCollections(list);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Не удалось загрузить коллекции');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="collections-page collections-page--loading">
        <h1 className="collections-page__heading">Коллекции</h1>
        <p>Загрузка…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="collections-page">
        <h1 className="collections-page__heading">Коллекции</h1>
        <p className="form-error">{error}</p>
        <button type="button" className="btn btn-primary" onClick={load}>
          Повторить
        </button>
      </section>
    );
  }

  return (
    <section className="collections-page">
      <h1 className="collections-page__heading">Коллекции</h1>
      <p className="collections-page__intro">
        Выберите коллекцию и нажмите «Начать», чтобы приступить к игре.
      </p>

      {collections.length === 0 ? (
        <p className="collections-page__empty">Пока нет доступных коллекций.</p>
      ) : (
        <div className="collections-page__grid">
          {collections.map((item) => (
            <CollectionCard key={item.id} collection={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CollectionsList;

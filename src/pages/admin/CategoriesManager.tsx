import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { get, post, del } from '@/lib/api';

type Category = { id: string; name: string };

const CategoriesManager = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<Category[]>('/categories');
      setItems(data);
    } catch (e: any) {
      setError('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await post<Category>('/categories', { name: name.trim() });
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
    } catch (e: any) {
      setError('Kategori eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await del(`/categories/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError('Kategori silinemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 m-6">
      <h2 className="text-xl font-semibold">Kategoriler</h2>

      <form onSubmit={onAdd} className="flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Yeni kategori adı" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="bg-blue-600 text-white rounded px-4" disabled={loading} type="submit">Ekle</button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Kategori</th>
              <th className="p-2 border w-32">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">
                  <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" disabled={loading} onClick={() => onDelete(c.id)}>Sil</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3" colSpan={2}>{loading ? 'Yükleniyor...' : 'Kategori yok.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesManager;

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useData } from '@/context/DataContext';
import type { AssetCategory } from '@/types/models';
import { get } from '@/lib/api';

const AdminAssign = () => {
  const { addAsset, addAssignment } = useData();
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    model: '',
    serial: '',
    category: '' as AssetCategory,
    userId: '',
    note: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await get<Array<{ id: string; name: string }>>('/categories');
        const names = data.map((c) => c.name).sort((a, b) => a.localeCompare(b));
        setCategories(names);
        setForm((f) => ({ ...f, category: (names[0] as AssetCategory) || '' }));
      } catch {
        setCategories([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await get<Array<{ id: string; name: string }>>('/users');
        setUsers(list.map(u => ({ id: u.id, name: u.name })));
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.category) return;
    // Create asset in DB and use the returned GUID id
    const asset = await addAsset({ name: form.name, model: form.model, serial: form.serial, category: form.category });
    // Then create assignment with valid GUIDs; note will be persisted via API
    await addAssignment({ userId: form.userId, assetId: asset.id, note: form.note });
    setForm({ name: '', model: '', serial: '', category: (categories[0] as AssetCategory) || '', userId: '', note: '' });
  };

  return (
    <div className="space-y-6 p-4 m-6">
      <h2 className="text-xl font-semibold">Zimmet Ekle</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border rounded p-2" placeholder="Ürün adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="border rounded p-2" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
        <input className="border rounded p-2" placeholder="Seri numarası" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} required />
        <select className="border rounded p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })} required>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="border rounded p-2" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
          <option value="">Kullanıcı seçin</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <input className="border rounded p-2 md:col-span-3" placeholder="Not (opsiyonel)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <button className="bg-blue-600 text-white rounded p-2 md:col-span-3" type="submit">Ekle</button>
      </form>
    </div>
  );
};

export default AdminAssign;

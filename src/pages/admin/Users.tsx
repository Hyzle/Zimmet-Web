import { FormEvent, useState } from 'react';
import { useData } from '@/context/DataContext';
import type { User } from '@/types/models';
import { post, put } from '@/lib/api';

const emptyForm = { name: '', email: '', department: '', password: '', role: 'user' as 'user' | 'admin' };

const AdminUsers = () => {
  const { store, updateUser, deleteUser, migrateFromLocal } = useData();
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      // Update on server (password optional)
      await put(`/users/${editing.id}`, {
        name: form.name,
        email: form.email,
        department: form.department || null,
        role: form.role,
        password: form.password ? form.password : undefined,
      });
      // Sync local store for UI
      await migrateFromLocal();
      setEditing(null);
    } else {
      // Create on server (password required)
      await post('/users', {
        name: form.name,
        email: form.email,
        department: form.department || null,
        role: form.role,
        password: form.password,
      });
      // Refresh from API so UI matches DB
      await migrateFromLocal();
    }
    setForm(emptyForm);
  };

  const onEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, department: u.department ?? '', password: '', role: 'user' });
  };

  return (
    <div className="space-y-6 p-4 m-6">
      <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="border rounded p-2" placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="border rounded p-2" placeholder="E-posta" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="border rounded p-2" placeholder="Departman" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <input className="border rounded p-2" placeholder={editing ? 'Şifre (değiştirmek için yazın)' : 'Şifre'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
        <select className="border rounded p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-blue-600 text-white rounded p-2" type="submit">{editing ? 'Güncelle' : 'Ekle'}</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Ad Soyad</th>
              <th className="p-2 border">E-posta</th>
              <th className="p-2 border">Departman</th>
              <th className="p-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {store.users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.department ?? '-'}</td>
                <td className="p-2 border space-x-2">
                  <button className="px-2 py-1 text-xs bg-yellow-500 text-white rounded" onClick={() => onEdit(u)}>Düzenle</button>
                  <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" onClick={async () => { await deleteUser(u.id); await migrateFromLocal(); }}>Sil</button>
                </td>
              </tr>
            ))}
            {store.users.length === 0 && (
              <tr><td className="p-3" colSpan={4}>Kullanıcı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

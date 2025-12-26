import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useState as useReactState } from 'react';
import { put } from '@/lib/api';
import { useData } from '@/context/DataContext';
import type { AssetCategory, ID } from '@/types/models';

const categories: AssetCategory[] = ['Bilgisayar', 'Telefon', 'Ekran', 'Aksesuar', 'Diğer'];

const AdminAssignments = () => {
  const { store, filterAssignments, deleteAssignment, migrateFromLocal } = useData();
  const [userId, setUserId] = useState<ID | ''>('');
  const [category, setCategory] = useState<AssetCategory | ''>('');
  const [transferFor, setTransferFor] = useReactState<string | null>(null);
  const [transferUserId, setTransferUserId] = useReactState<string>('');

  const rows = useMemo(() => filterAssignments({ userId: userId || undefined, category: category || undefined }), [userId, category, store]);

  return (
    <div className="space-y-6 p-4 m-6">
      <h2 className="text-xl font-semibold">Zimmet Listesi</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="border rounded p-2" value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Tüm kullanıcılar</option>
          {store.users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <select className="border rounded p-2" value={category} onChange={(e) => setCategory(e.target.value as AssetCategory | '')}>
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="border rounded p-2" onClick={() => migrateFromLocal()}>Yenile</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Kullanıcı</th>
              <th className="p-2 border">Ürün Adı</th>
              <th className="p-2 border">Model</th>
              <th className="p-2 border">Seri No</th>
              <th className="p-2 border">Kategori</th>
              <th className="p-2 border">Tarih</th>
              <th className="p-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 border">{r.user?.name}</td>
                <td className="p-2 border">{r.asset?.name}</td>
                <td className="p-2 border">{r.asset?.model}</td>
                <td className="p-2 border">{r.asset?.serial}</td>
                <td className="p-2 border">{r.asset?.category}</td>
                <td className="p-2 border">{new Date(r.assignedAt).toLocaleDateString()}</td>
                <td className="p-2 border space-x-2">
                  <Link className="px-2 py-1 text-xs bg-yellow-500 text-white rounded" to={`/admin/assignments/${r.id}/edit`}>Düzenle</Link>
                  {transferFor === r.id ? (
                    <span className="inline-flex items-center gap-2">
                      <select
                        className="border rounded p-1 text-xs"
                        value={transferUserId}
                        onChange={(e) => setTransferUserId(e.target.value)}
                      >
                        <option value="">Kullanıcı seçin</option>
                        {store.users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <button
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                        onClick={async () => {
                          if (!transferUserId) return;
                          await put(`/assignments/${r.id}`, { userId: transferUserId });
                          setTransferFor(null);
                          setTransferUserId('');
                          await migrateFromLocal();
                        }}
                      >Kaydet</button>
                      <button
                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded"
                        onClick={() => { setTransferFor(null); setTransferUserId(''); }}
                      >Vazgeç</button>
                    </span>
                  ) : (
                    <button
                      className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                      onClick={() => { setTransferFor(r.id); setTransferUserId(''); }}
                    >Devir</button>
                  )}
                  <button className="px-2 py-1 text-xs bg-red-600 text-white rounded" onClick={() => deleteAssignment(r.id)}>Sil</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-3" colSpan={7}>Kayıt yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAssignments;

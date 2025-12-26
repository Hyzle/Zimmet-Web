import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const MyAssets = () => {
  const { user } = useAuth();
  const { getUserAssignments } = useData();

  if (!user) return <div>Giriş gerekli.</div>;

  const rows = getUserAssignments(user.id);

  return (
    <div className="space-y-4 p-4 m-6">
      <h2 className="text-xl font-semibold">Üzerimdeki Zimmetler</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-2 border-b">Ürün Adı</th>
              <th className="p-2 border-b">Model</th>
              <th className="p-2 border-b">Seri No</th>
              <th className="p-2 border-b">Kategori</th>
              <th className="p-2 border-b">Tarih</th>
              <th className="p-2 border-b">Not</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.asset.name}</td>
                <td className="p-2">{r.asset.model}</td>
                <td className="p-2">{r.asset.serial}</td>
                <td className="p-2">{r.asset.category}</td>
                <td className="p-2">{new Date(r.assignedAt).toLocaleDateString()}</td>
                <td className="p-2">{r.note ?? '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3" colSpan={6}>Kayıt yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAssets;

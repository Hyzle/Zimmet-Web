import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get, put } from '@/lib/api';

type AssignmentDto = {
  id: string;
  userId: string;
  assetId: string;
  assignedAt: string;
  note: string | null;
  userName?: string;
  userEmail?: string;
  assetName?: string;
  assetModel?: string;
  assetSerial?: string;
  assetCategory?: string;
};

const AssignmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<{
    assignment: AssignmentDto | null;
    model: string;
    serial: string;
    note: string;
    assignedAt: string;
  }>({ assignment: null, model: '', serial: '', note: '', assignedAt: new Date().toISOString().slice(0, 16) });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const a = await get<AssignmentDto>(`/assignments/${id}`);
        setState({
          assignment: a,
          model: a.assetModel || '',
          serial: a.assetSerial || '',
          note: a.note || '',
          assignedAt: new Date(a.assignedAt).toISOString().slice(0, 16),
        });
      } catch (e) {
        setError('Kayıt yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.assignment) return;
    setLoading(true);
    setError(null);
    try {
      // 1) Asset model/serial güncelle
      await put(`/assets/${state.assignment.assetId}`, {
        name: state.assignment.assetName,
        model: state.model,
        serial: state.serial,
        category: state.assignment.assetCategory,
      });
      // 2) Assignment not ve tarih güncelle
      await put(`/assignments/${state.assignment.id}`, {
        note: state.note,
        assignedAt: new Date(state.assignedAt).toISOString(),
      });
      navigate('/admin/assignments');
    } catch (e) {
      setError('Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 m-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Zimmet Düzenle</h2>
        <Link to="/admin/assignments" className="text-sm text-blue-600">Listeye dön</Link>
      </div>

      {state.assignment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded">
            <div className="text-xs text-gray-500">Kullanıcı</div>
            <div className="font-medium">{state.assignment.userName} ({state.assignment.userEmail})</div>
          </div>
          <div className="p-3 border rounded md:col-span-2">
            <div className="text-xs text-gray-500">Varlık</div>
            <div className="font-medium">{state.assignment.assetName} • {state.assignment.assetCategory}</div>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm font-medium">Tarih
          <input
            type="datetime-local"
            className="border rounded p-2 w-full mt-1"
            value={state.assignedAt}
            onChange={(e) => setState({ ...state, assignedAt: e.target.value })}
            required
          />
        </label>

        <label className="text-sm font-medium">Not
          <input
            className="border rounded p-2 w-full mt-1"
            placeholder="Not"
            value={state.note}
            onChange={(e) => setState({ ...state, note: e.target.value })}
          />
        </label>

        <label className="text-sm font-medium">Model
          <input
            className="border rounded p-2 w-full mt-1"
            placeholder="Model"
            value={state.model}
            onChange={(e) => setState({ ...state, model: e.target.value })}
          />
        </label>

        <label className="text-sm font-medium">Seri No
          <input
            className="border rounded p-2 w-full mt-1"
            placeholder="Seri No"
            value={state.serial}
            onChange={(e) => setState({ ...state, serial: e.target.value })}
          />
        </label>

        <div className="md:col-span-2">
          <button className="bg-blue-600 text-white rounded px-4 py-2" type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentEdit;

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Store, User, Asset, Assignment, ID, AssetCategory } from '@/types/models';
import { get, post, put, del } from '@/lib/api';

const LS_KEY = 'zimmet_store_v1';

const defaultStore: Store = {
  users: [],
  assets: [],
  assignments: [],
};

type DataContextType = {
  store: Store;
  // users
  addUser: (u: Omit<User, 'id'>) => User;
  updateUser: (id: ID, u: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: ID) => void;
  // assets
  addAsset: (a: Omit<Asset, 'id'>) => Promise<Asset>;
  updateAsset: (id: ID, a: Partial<Omit<Asset, 'id'>>) => Promise<void> | void;
  deleteAsset: (id: ID) => Promise<void> | void;
  // assignments
  addAssignment: (payload: { userId: ID; assetId: ID; note?: string; assignedAt?: string }) => Promise<Assignment>;
  deleteAssignment: (id: ID) => Promise<void> | void;
  // helpers
  getUserAssignments: (userId: ID) => (Assignment & { asset: Asset })[];
  filterAssignments: (filter: { userId?: ID; category?: AssetCategory }) => (Assignment & { asset: Asset; user: User })[];
  migrateFromLocal: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store>(defaultStore);
  const [loading, setLoading] = useState<boolean>(false);

  const migrateFromLocal = async () => {
    const [users, assets, assignments] = await Promise.all([
      get<User[]>('/users'),
      get<Asset[]>('/assets'),
      get<(Assignment & { user?: User; asset?: Asset })[]>('/assignments'),
    ]);

    const lsRaw = localStorage.getItem(LS_KEY);
    if (lsRaw) {
      const ls: Store = JSON.parse(lsRaw);
      const userMap = new Map<string, string>();
      const assetMap = new Map<string, string>();

      const usersByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));
      const assetsByKey = new Map(assets.map((a) => [`${(a.serial||'').toLowerCase()}|${a.name.toLowerCase()}`, a]));
      const assignmentsKeySet = new Set(assignments.map((a) => `${a.userId}|${a.assetId}`));

      for (const u of ls.users) {
        const existing = usersByEmail.get(u.email.toLowerCase());
        if (existing) {
          userMap.set((u as any).id, existing.id as any);
        } else {
          const created = await post<User>('/users', {
            name: u.name,
            email: u.email,
            department: (u as any).department ?? null,
            password: 'Temp123!',
            role: (u as any).role ?? 'user',
          });
          userMap.set((u as any).id, created.id as any);
          usersByEmail.set(created.email.toLowerCase(), created);
        }
      }

      for (const a of ls.assets) {
        const key = `${(a.serial||'').toLowerCase()}|${a.name.toLowerCase()}`;
        const existing = assetsByKey.get(key);
        if (existing) {
          assetMap.set((a as any).id, existing.id as any);
        } else {
          const created = await post<Asset>('/assets', {
            name: a.name,
            model: a.model,
            serial: a.serial,
            category: a.category,
          });
          assetMap.set((a as any).id, created.id as any);
          assetsByKey.set(`${(created.serial||'').toLowerCase()}|${created.name.toLowerCase()}`, created);
        }
      }

      for (const asg of ls.assignments) {
        const newUserId = userMap.get((asg as any).userId);
        const newAssetId = assetMap.get((asg as any).assetId);
        if (newUserId && newAssetId) {
          const akey = `${newUserId}|${newAssetId}`;
          if (!assignmentsKeySet.has(akey)) {
            await post('/assignments', {
              userId: newUserId,
              assetId: newAssetId,
              note: (asg as any).note ?? null,
              assignedAt: (asg as any).assignedAt ?? undefined,
            });
            assignmentsKeySet.add(akey);
          }
        }
      }
      localStorage.removeItem(LS_KEY);
    }

    const [users2, assets2, assignments2] = await Promise.all([
      get<User[]>('/users'),
      get<Asset[]>('/assets'),
      get<(Assignment & { user?: User; asset?: Asset })[]>('/assignments'),
    ]);
    setStore({ users: users2, assets: assets2, assignments: assignments2.map(a => ({ id: a.id, userId: a.userId, assetId: a.assetId, assignedAt: a.assignedAt, note: a.note })) });
  };

  // Initial load + one-time migration from localStorage to DB if needed
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await migrateFromLocal();
      } catch (e) {
        // fallback: keep defaultStore
        // eslint-disable-next-line no-console
        console.error('Data init failed', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // users
  const addUser: DataContextType['addUser'] = (u) => {
    // API-backed create
    // password cannot be provided via DataContext addUser; callers should use Admin Users page
    // Here we create a basic user with a default password
    const payload: any = { name: u.name, email: u.email, department: (u as any).department ?? null, password: 'Temp123!', role: (u as any).role ?? 'user' };
    post<User>('/users', payload).then((created) => {
      setStore((s: Store) => ({ ...s, users: [...s.users, created] }));
    });
    return { id: 'creating', ...u } as unknown as User;
  };
  const updateUser: DataContextType['updateUser'] = (id, u) => {
    put<User>(`/users/${id}`, { name: u.name, email: u.email, department: (u as any).department ?? null, role: (u as any).role }).then((updated) => {
      setStore((s: Store) => ({ ...s, users: s.users.map((x: User) => (x.id === id ? { ...x, ...updated } : x)) }));
    });
  };
  const deleteUser: DataContextType['deleteUser'] = (id) => {
    del(`/users/${id}`).then(() => {
      setStore((s: Store) => ({
        ...s,
        users: s.users.filter((x: User) => x.id !== id),
        assignments: s.assignments.filter((a: Assignment) => a.userId !== id),
      }));
    });
  };

  // assets
  const addAsset: DataContextType['addAsset'] = async (a) => {
    const payload = { name: a.name, model: a.model, serial: a.serial, category: a.category };
    const created = await post<Asset>('/assets', payload);
    setStore((s: Store) => ({ ...s, assets: [...s.assets, created] }));
    return created;
  };
  const updateAsset: DataContextType['updateAsset'] = async (id, a) => {
    const updated = await put<Asset>(`/assets/${id}`, a);
    setStore((s: Store) => ({ ...s, assets: s.assets.map((x: Asset) => (x.id === id ? { ...x, ...updated } : x)) }));
  };
  const deleteAsset: DataContextType['deleteAsset'] = async (id) => {
    await del(`/assets/${id}`);
    setStore((s: Store) => ({
      ...s,
      assets: s.assets.filter((x: Asset) => x.id !== id),
      assignments: s.assignments.filter((as: Assignment) => as.assetId !== id),
    }));
  };

  // assignments
  const addAssignment: DataContextType['addAssignment'] = async ({ userId, assetId, note, assignedAt }) => {
    const payload = { userId, assetId, note: note ?? null, assignedAt };
    const created = await post<Assignment>('/assignments', payload);
    setStore((s: Store) => ({ ...s, assignments: [...s.assignments, created] }));
    return created;
  };
  const deleteAssignment: DataContextType['deleteAssignment'] = async (id) => {
    await del(`/assignments/${id}`);
    setStore((s: Store) => ({ ...s, assignments: s.assignments.filter((x: Assignment) => x.id !== id) }));
  };

  // helpers
  const getUserAssignments: DataContextType['getUserAssignments'] = (userId) => {
    return store.assignments
      .filter((a: Assignment) => a.userId === userId)
      .map((a: Assignment) => ({ ...a, asset: store.assets.find((x: Asset) => x.id === a.assetId)! }))
      .filter((x) => !!x.asset);
  };

  const filterAssignments: DataContextType['filterAssignments'] = (filter) => {
    return store.assignments
      .filter((a: Assignment) => (filter.userId ? a.userId === filter.userId : true))
      .map((a: Assignment) => ({
        ...a,
        asset: store.assets.find((x: Asset) => x.id === a.assetId)!,
        user: store.users.find((u: User) => u.id === a.userId)!,
      }))
      .filter((row) => (filter.category ? row.asset?.category === filter.category : true));
  };

  const value = useMemo<DataContextType>(
    () => ({
      store,
      addUser,
      updateUser,
      deleteUser,
      addAsset,
      updateAsset,
      deleteAsset,
      addAssignment,
      deleteAssignment,
      getUserAssignments,
      filterAssignments,
      migrateFromLocal,
    }),
    [store]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export type ID = string;

export type User = {
  id: ID;
  name: string;
  email: string;
  department?: string;
};

export type AssetCategory = 'Bilgisayar' | 'Telefon' | 'Ekran' | 'Aksesuar' | 'Diğer';

export type Asset = {
  id: ID;
  name: string; // Ürün adı
  model: string; // Modeli
  serial: string; // Seri numarası
  category: AssetCategory; // Kategori
};

export type Assignment = {
  id: ID;
  assetId: ID;
  userId: ID;
  assignedAt: string; // ISO tarih
  note?: string;
};

export type Store = {
  users: User[];
  assets: Asset[];
  assignments: Assignment[];
};

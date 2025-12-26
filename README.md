# Zimmet Web

Bu repo iki parçadan oluşur:
- Server (Node.js/Express + MSSQL): `zimmet-web/server`
- Frontend (React + Vite + Tailwind): `zimmet-web`

Aşağıdaki adımlar, geliştirme ortamını kurmak ve projeyi çalıştırmak için gereklidir.

## Önkoşullar
- Node.js 18+
- MSSQL Server (LocalDB, Express veya tam sürüm)
- `sqlcmd` CLI (SSMS ile gelebilir)
- Windows Firewall ve SQL Server TCP/IP ayarları yapılandırılmış olmalı (aşağıya bakın)

---

# 1) Server (API)
Konum: `zimmet-app/server`

## 1.1. Bağlantı Ayarları
- Varsayılan ayar: `localhost:1433`, DB: `Zimmet_Web`
- Kullanıcı adı/parola: örnek olarak `deneme/deneme` kullanabilirsiniz (güvenlik için üretimde değiştirin).
- Gerekirse `server/db.js` içinde bağlantı bilgilerinizi düzenleyin (instance adı/port, kullanıcı, parola, veritabanı).
- Named Instance (ör. SQLEXPRESS) kullanıyorsanız ya TCP/IP ile 1433 portunu aktif edin ya da instance adıyla bağlanacak şekilde konfigüre edin.

## 1.2. Veritabanı Kurulumu
Aşağıdaki komut, tablo/şemayı oluşturur ve günceller:
```powershell
# Çalışma klasörü: zimmet-app/server
sqlcmd -S localhost -d master -Q "IF DB_ID('Zimmet_App') IS NULL CREATE DATABASE Zimmet_App;"
sqlcmd -S localhost -d Zimmet_App -U deneme -P deneme -i ".\schema.sql"
```
Notlar:
- Eğer Windows Auth kullanıyorsanız, `-U`/`-P` olmadan çalıştırın ve sunucunuzda yetkiniz olduğundan emin olun.
- TCP/IP etkin olmalıdır: SQL Server Configuration Manager → Protocols → TCP/IP = Enabled → IPAll → TCP Port = 1433 → SQL servisini restart edin.

## 1.3. Kurulum ve Çalıştırma
```powershell
# Çalışma klasörü: zimmet-web/server
npm install
npm run dev
```
Server varsayılan olarak `http://localhost:4000` adresinde çalışır.

## 1.4. Temel API Uçları
- Sağlık kontrol: `GET /health`
- Kimlik: `POST /auth/login` (email/parola)
- Kullanıcılar: `GET/POST/PUT/DELETE /users`
- Varlıklar: `GET/POST/PUT/DELETE /assets`
- Kategoriler: `GET/POST/DELETE /categories`
- Zimmetler: `GET/POST/PUT/DELETE /assignments`

Notlar:
- `POST /users` parolayı zorunlu tutar ve bcrypt ile hashler.
- `POST /assignments` için `userId` ve `assetId` geçerli GUID olmalıdır.

---

# 2) Frontend (React)
Konum: `zimmet-web`

## 2.1. Ortam Değişkeni
- `VITE_API_URL` varsayılanı: `http://localhost:4000`
- Gerekirse `.env` dosyası oluşturun:
```env
VITE_API_URL=http://localhost:4000
```

## 2.2. Kurulum ve Geliştirme
```powershell
# Çalışma klasörü: zimmet-web
npm install
npm run dev
```
Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışır.

## 2.3. İlk Veri ve Migrasyon
- Uygulama, açılışta DB’den verileri çeker.
- Migrasyon kullanıcıları için geçici parola: `Temp123!` (güvenlik için değiştirin).

## 2.4. Üretim (Build)
```powershell
# Çalışma klasörü: zimmet-web
npm run build
```
- Çıktı: `zimmet-app/dist` klasörü
- IIS/NGINX gibi bir sunucuda `dist` klasörünü static olarak servis edin (SPA rewrite kuralını eklemeyi unutmayın).
- DOCX gibi statik dosyalar için MIME tiplerini yapılandırın.

### IIS İçin Örnek web.config (SPA + DOCX MIME)
`dist/web.config` içine koyabilirsiniz:
```xml
<configuration>
  <system.webServer>
    <staticContent>
      <mimeMap fileExtension=".docx" mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
    </staticContent>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

# 3) Kullanım Özet
- Admin → Kullanıcılar: kullanıcı ekle/düzenle/sil
- Admin → Zimmet Ekle: varlık oluşturur ve zimmet atar (kategori, not ile)
- Admin → Bütün Zimmetler: listele, filtrele, düzenle, devret, sil
- Admin → Kategoriler: kategori ekle/sil
- Ayarlar → LocalStorage → DB taşıma butonu

Giriş/Kimlik:
- İlk admin’i oluşturmak için `POST /users` ile bir admin kullanıcı ekleyebilirsiniz veya UI’dan kullanıcı oluşturup DB’de rolünü admin’e çekebilirsiniz. Alternatif olarak migrasyon sonrasında kullanıcıların parolası `Temp123!` olur.

---

# 4) Sık Karşılaşılan Sorunlar
- `GET /assignments` 500: Parametre bind düzeltildi. Server’ı yeniden başlatın.
- `Invalid GUID`: Zimmet eklemede userId/assetId GUID olmalı; UI bunu artık API’den yüklüyor.
- MSSQL bağlantı hataları (`ETIMEOUT`): TCP/IP etkin, 1433 açık, firewall ve kimlik doğrulama modları doğru olmalı. `sqlcmd` ile test edin.
- DOCX indirilemiyor/bozuk: Dosya `zimmet-app/public/templates/...` altında olmalı. Dev sunucuyu yeniden başlatın. Prod’da dist altında dosyanın varlığını ve MIME tipini doğrulayın.

---

# 5) Geliştirme Notları
- Kod stilleri: TypeScript + React 18 + Vite
- Styling: TailwindCSS
- İkonlar: react-icons
- State: Basit global store (DataContext) + DB senkronizasyonu
- API erişimi: `src/lib/api.ts` üzerinden (axios)

---

Herhangi bir sorunda server loglarını ve tarayıcı Network çıktılarını paylaşmanız, hızlı teşhis için yardımcı olur.


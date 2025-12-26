# Bot WhatsApp

Bot WhatsApp yang dibangun dengan struktur kode yang bersih, modular, dan mudah dipelihara.  
Proyek ini dirancang agar mudah dikembangkan serta mendukung penggunaan multi-bot dalam satu codebase.

---

## Deskripsi

Bot WhatsApp ini dibuat untuk menangani pesan secara otomatis dengan pendekatan berbasis class dan handler.  
Struktur proyek difokuskan pada maintainability dan scalability sehingga penambahan fitur baru dapat dilakukan tanpa mengubah kode yang sudah ada secara signifikan.

---

## Fitur

-  Membalas pesan secara otomatis
-  Mendukung multi-bot dalam satu codebase
-  Struktur kode modular dan mudah dikembangkan
-  Mudah menambahkan conversation dan feature baru

---

## Teknologi

-  **Socket:** Baileys
-  **Database:** MySQL
-  **Runtime:** Node.js

---

## Instalasi

Clone repository dan install dependencies:

```bash
git clone https://github.com/Riii28/bot-wa.git
cd bot-wa
npm install
```

---

## Menjalankan Bot

```bash
npm start
```

Bot akan berjalan dan siap menerima pesan setelah koneksi WhatsApp berhasil.

---

## Menambahkan Pesan Otomatis

Untuk menambahkan pesan otomatis baru, ikuti langkah berikut:

1. Masuk ke folder:

   ```
   src/message
   ```

2. Pilih atau buat folder sesuai kebutuhan:

   -  `conversation` untuk alur percakapan
   -  `features` untuk fitur tertentu

3. Buat class baru dengan mewarisi `MessageHandler`:

   ```ts
   class SomethingHandler extends MessageHandler {}
   ```

4. Class handler wajib memiliki properti dan method berikut:

   ### Key

   Digunakan untuk menentukan kata kunci pemicu pesan.

   ```ts
   key: string[];
   ```

   ### Type

   Digunakan untuk menentukan tipe handler.

   ```ts
   type: HandlerType[];
   ```

   ### Response

   Method yang berisi logika untuk memproses pesan dan mengirim balasan.

   ```ts
   async response(sock: WASocket, msg: WAMessage, info: MsgInfo): Promise<void>
   ```

5. Daftarkan `SomethingHandler` di `src/main.ts`

   ```ts
   const handler = new BotHandler();S

   handler.addMessage(new SomethingHandler());
   ```

---

## Kontribusi

Kontribusi sangat terbuka.
Silakan fork repository ini, buat branch baru, dan ajukan pull request.

---

## Lisensi

Proyek ini menggunakan lisensi `Apache-2.0`

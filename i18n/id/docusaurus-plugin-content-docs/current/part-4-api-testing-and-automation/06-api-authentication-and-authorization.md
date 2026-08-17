# Chapter 4.6 — API Authentication and Authorization

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)


|                           |                                                                              |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Part**                  | IV — API Testing and Automation                                              |
| **Estimated time**        | 1 session (90 min) + 5 hours independent work                                |
| **Prerequisite chapters** | [4.5 Write Operations](05-playwright-api-write-operations.md)                |
| **Next chapter**          | [4.7 Reusable API Clients and Models](07-reusable-api-clients-and-models.md) |


---

> Authentication asks **who are you?** Authorization asks **what may you do?**
>
> Almost every team tests the first. Almost none test the second properly. The most valuable API bug of your career is often a *valid* token for user A returning user B's order.

---



## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu akan bisa:

1. **Membedakan** authentication dan authorization, serta **menjelaskan** kenapa bug di bagian kedua biasanya jauh lebih bernilai untuk ditemukan.
2. **Melakukan authentication** pada API request menggunakan token, header, dan session berbasis cookie.
3. **Mendapatkan** token secara programmatic dan **menggunakannya kembali** di dalam suite tanpa membocorkannya.
4. **Mendesain** dan **mengimplementasikan** negative test untuk authentication: tanpa token, token malformed, token expired, dan scheme yang salah.
5. **Mengimplementasikan** cross-user authorization test untuk membuktikan bahwa user A tidak bisa membaca atau mengubah data milik user B.
6. **Menguji** batas akses berdasarkan role antara customer, seller, dan admin.
7. **Menjelaskan** trade-off antara memakai satu user ter-authenticate untuk beberapa test versus membuat user baru untuk setiap test.

---



## B. Pengetahuan Prasyarat


| Required                                   | From                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Headers, cookies, status codes 401 and 403 | [Chapter 4.1](01-http-fundamentals.md)                                                    |
| Write operations and cleanup               | [Chapter 4.5](05-playwright-api-write-operations.md)                                      |
| Negative test design                       | [Chapter 4.3](03-designing-api-test-cases.md)                                             |
| Isolation and shared-state risks           | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Environment variables                      | [Chapter 2.3](../part-2-programming-fundamentals/03-variables-and-constants.md)           |


---



## C. Penjelasan Konsep



### C.1 Dua pertanyaan yang berbeda


|                       | Authentication                         | Authorization                                                                                            |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Pertanyaan            | Kamu siapa?                            | Kamu boleh melakukan apa?                                                                                |
| Failure               | **401** — identity kamu tidak diterima | **403** atau **404** — kita tahu siapa kamu, tapi object ini bukan milikmu / role kamu tidak punya akses |
| Contoh test           | Tidak ada token, token salah           | Token A + `orderId` milik B                                                                              |
| Kalau cuma test login | Green                                  | **Masih ada celah**                                                                                      |


IDOR (*insecure direct object reference*) adalah nama dari celah ini: misalnya `/api/orders/ORD-8842` diakses menggunakan token user lain. Demo 7: kalau hasilnya 200, kamu baru saja menemukan vulnerability yang nyata.

**404 vs 403:** 403 mengonfirmasi bahwa resource tersebut memang ada. Sementara 404 ("not found" padahal sebenarnya ada) membocorkan informasi lebih sedikit. Tentukan behavior yang *seharusnya* dimiliki API, test behavior tersebut, lalu buat finding kalau implementasinya tidak sesuai.

### C.2 Scheme yang akan sering kamu temui


| Scheme         | Cara dikirim                                       | Catatan                                                                                              |
| -------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Bearer token   | `Authorization: Bearer <jwt-or-opaque>`            | Default di course ini                                                                                |
| JWT            | Header yang sama; terdiri dari tiga segment base64 | Di sini kamu tidak perlu memverifikasi signature; anggap saja sebagai string yang dikeluarkan server |
| API key        | `X-API-Key` atau query (query lebih mudah bocor)   |                                                                                                      |
| Basic          | `Authorization: Basic base64(user:pass)`           | Jarang dipakai di JSON API modern                                                                    |
| Session cookie | `Cookie: sid=...` setelah `Set-Cookie`             | Browser melakukan ini otomatis; `request` **tidak**, kecuali kamu menyalin cookie-nya                |


Format yang salah (`Bearer` typo, spasi hilang, `bearer` vs `Token`) dianggap sebagai **defect di test/client** sampai request dari client yang benar juga terbukti gagal. Bandingkan request-nya byte-for-byte dengan request yang sudah terbukti bekerja di REST client (instructor notes §7).

### C.3 Login secara programmatic

```ts
async function login(request: APIRequestContext, email: string, password: string): Promise<string> {
  const response = await request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.status(), "login should succeed").toBe(200);
  const body = (await response.json()) as { token?: string };
  if (typeof body.token !== "string" || body.token.length === 0) {
    throw new Error("login response missing token");
  }
  return body.token;
}
```

`expect` di sini ada di **login helper yang dipakai oleh test yang sebenarnya bukan tentang login**. Dedicated login test (wrong password → 401, missing field → 400) seharusnya ada di `auth.spec.ts`, bukan cuma tersembunyi di dalam helper. Helper yang melakukan assertion akan menyulitkan kita membuat negative login test — ini sedikit preview dari [Chapter 4.7](07-reusable-api-clients-and-models.md). Untuk sekarang, simpan juga `loginRaw` yang tidak melakukan assertion untuk negative test.

**Jangan pernah commit password.** Gunakan `process.env.ADMIN_PASSWORD`. [Chapter 4.8](08-api-test-data-and-environments.md) nantinya akan merapikan ini ke dalam sebuah module. Token yang ter-commit bukan sekadar masalah style coding — ini sudah masuk incident yang serius.

### C.4 Menambahkan credential ke request

```ts
// Per request
await request.get("/api/orders", {
  headers: { Authorization: `Bearer ${token}` },
});

// Dedicated context (good for a whole test)
const asBuyer = await playwright.request.newContext({
  baseURL: process.env.BASE_URL,
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});
await asBuyer.get("/api/orders");
await asBuyer.dispose();
```

`extraHTTPHeaders` di `playwright.config.ts` dengan satu token global memang praktis, tapi **berbahaya** kalau test melakukan perubahan terhadap user tersebut. Lebih aman pakai context per-test atau per-describe.

### C.5 Negative test untuk authentication


| Case         | Send                                                                       | Expect |
| ------------ | -------------------------------------------------------------------------- | ------ |
| Absent       | no `Authorization`                                                         | 401    |
| Malformed    | `Bearer` only, or random bytes                                             | 401    |
| Wrong scheme | `Basic ...` when Bearer required                                           | 401    |
| Expired      | token from a helper that issues short-lived, or a captured expired fixture | 401    |
| Revoked      | logout/revoke then reuse                                                   | 401    |


Jangan menunggu satu jam hanya untuk mengetes token expired. Gunakan API yang bisa mengeluarkan token dengan lifetime 1 detik di test environment, atau gunakan test token yang memang didokumentasikan. Kalau token tidak bisa dibuat expired, tandai test sebagai pending dan jelaskan alasannya — jangan menghilangkan *ide test*-nya.

### C.6 Cross-user (inti dari assignment)

```ts
const tokenA = await login(request, userA.email, userA.password);
const tokenB = await login(request, userB.email, userB.password);
const orderB = await createOrder(request, tokenB);

const read = await request.get(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
});
expect(read.status(), "A must not read B's order").toBe(403); // or 404 — match contract

const patch = await request.patch(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
  data: { status: "cancelled" },
});
expect([403, 404]).toContain(patch.status());

const del = await request.delete(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenA}` },
});
expect([403, 404]).toContain(del.status());

const still = await request.get(`/api/orders/${orderB.id}`, {
  headers: { Authorization: `Bearer ${tokenB}` },
});
expect(still.status()).toBe(200); // integrity: B's order untouched
```

Buat **kedua** user lewat API. Setelah selesai, cleanup keduanya. Menerima response 200 hanya karena "datanya kelihatan benar" adalah cara paling gampang untuk melewatkan IDOR.

### C.7 Role


| Actor    | Boleh                           | Tidak boleh                                                                                                   |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Customer | Cart dan order miliknya sendiri | Order customer lain; admin list                                                                               |
| Seller   | Product di catalogue miliknya   | Product seller lain; PII customer                                                                             |
| Admin    | Biasanya punya akses lebih luas | Tetap bukan berarti "nggak perlu dites" — endpoint khusus admin harus 403 kalau diakses dengan token customer |


Matrix role × endpoint gampang sekali kurang ter-cover. Prioritaskan dulu endpoint yang berhubungan dengan uang dan PII ([Chapter 4.3](03-designing-api-test-cases.md) C.10).

### C.8 Shared user vs user per test


| Strategy                                     | Kapan                                              | Risiko                                           |
| -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| Shared read-only user + token di `beforeAll` | File hanya berisi GET dan user tidak pernah diubah | Aman kalau benar-benar read-only                 |
| User per test                                | Test yang melakukan write ke cart, profile, order  | Lebih lambat; tapi isolated                      |
| Shared user yang diubah oleh banyak test     | "Lebih cepat"                                      | Collision di cart, flaky 409 — **melanggar 3.1** |


Catatan penting: jangan sekadar mengharamkan shared token; **pahami kapan boleh dan kapan tidak**. Rule sederhananya: *kalau dua test bisa mengubah record yang sama, kedua test tersebut tidak boleh memakai user yang sama.*

Login di setiap test vs memakai ulang token untuk user yang memang dimiliki test tersebut: reuse itu tidak masalah. Yang jadi jebakan adalah memakai **satu** token yang sama untuk seluruh suite.

### C.9 Lifetime token

Token yang di-hardcode mungkin masih bekerja hari ini, lalu expired minggu depan dan suite tiba-tiba "randomly" gagal. Dapatkan token saat test dijalankan. Kalau API membutuhkan refresh token, handle itu di client — pembahasannya ada di 4.7. Jangan membuat test sleep sampai token expired.

---



## D. Konteks QA



### D.1 IDOR adalah bug yang bisa merusak reputasi

Project 3 C6 membutuhkan empat cross-user test. Pertanyaan sederhananya: *test mana yang akan menangkap kalau developer tidak sengaja membuat order user A bisa dilihat oleh user B?*

### D.2 Token ini nantinya bisa menjadi UI `storageState`

[Chapter 6.3](../part-6-framework-engineering/03-authentication-strategies.md): login lewat API, inject cookie/token, lalu lewati halaman login di UI. Aturan soal credential hygiene tetap sama.

### D.3 Secrets

`.env` harus di-gitignore. `.env.example` cukup berisi nama variable-nya saja. Kalau secret sudah terlanjur di-commit: **rotate** secret tersebut; menghapus file dari Git saja tidak cukup karena secret masih ada di history. Biasakan bertanya: *password itu sekarang ada di mana?*

---



## E. Contoh Kode



### E.1 Sangat sederhana — env token, lalu login

```ts
// learning only — still not committed
const token = process.env.SMOKE_TOKEN;
test.skip(!token, "SMOKE_TOKEN not set");
await request.get("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
```

Setelah memahami contoh ini, ganti dengan `login()` dari C.3 dan gunakan password dari `process.env` untuk user yang dibuat oleh **factory**, bukan shared staging admin.

### E.2 Praktis — login + use

Create user → login → GET order milik sendiri dan dapat 200.

### E.3 QA-oriented — lima authn negative

Implementasikan table C.5. Setiap case harus punya status yang spesifik dan tidak membocorkan data lewat response body (opsional: body tidak boleh mengandung email user lain).

### E.4 Automation-oriented — dua user, tiga verb

Implementasikan C.6 dalam sebuah `test.describe`. Setelah selesai, cleanup kedua user dan order milik B.

---



## F. Kesalahan yang Sering Terjadi



### F.1 Token / `.env` ter-commit



### F.2 Cuma mengetes 401 lalu menganggap "authz selesai"



### F.3 Menganggap valid token berarti pasti boleh akses



### F.4 Shared user yang datanya diubah banyak test



### F.5 Login 40 kali padahal satu token per test user sudah cukup



### F.6 Token di-hardcode lalu expired



### F.7 Typo `Bearer` malah dianggap salah API



### F.8 User kedua tidak pernah di-cleanup



### F.9 Response 200 dari cross-user dianggap normal



### F.10 Assertion ditaruh di satu-satunya login helper sehingga negative test tidak bisa memakainya

---



## G. Exercise

Estimasi total waktu: 110 menit.

### G.1 Easy — Env atau login + 200 (20 menit)

Lakukan protected GET yang menghasilkan 200 menggunakan token yang tidak kamu paste langsung ke file spec.

### G.2 Medium — Lima authn negative (35 menit)

Absent, malformed, wrong scheme, expired (atau documented skip), dan revoked kalau API mendukungnya.

### G.3 Challenge — Cross-user CRUD (55 menit)

Gunakan dua user dan uji isolation untuk read/update/delete pada order (atau cart). Jelaskan pilihan 403 vs 404 dalam tiga kalimat. Kalau hasilnya 200, buat finding.

---



## H. Coding Assignment



### Assignment 4.6 — Authenticated Suite dengan Authorization Boundary

Lanjutkan hasil dari 4.5:


| #   | Requirement                                                                           |
| --- | ------------------------------------------------------------------------------------- |
| 1   | Token didapat dari login; tidak ada secret di repository                              |
| 2   | Authn negative test (minimal empat)                                                   |
| 3   | User kedua; cross-user isolation untuk **read, update, delete** pada **dua** resource |
| 4   | `NOTES.md`: keputusan shared vs per-test user beserta trade-off-nya                   |
| 5   | Cleanup kedua user                                                                    |
| 6   | Tetap green saat dijalankan dengan `--workers=4`                                      |


**Cara penilaiannya.**


| Aspek          | Bobot | Full marks                                  |
| -------------- | ----- | ------------------------------------------- |
| Authz          | 35%   | Dua resource × tiga verb; bukan 200         |
| Authn negative | 20%   | 401 yang spesifik                           |
| Secrets        | 20%   | Bersih saat di-grep; `.env` di-ignore       |
| Isolation      | 15%   | Tidak ada shared user yang datanya dimutasi |
| Notes          | 10%   | Trade-off dijelaskan dengan jujur           |


> **AI usage: restricted.**

---



## I. Quiz

Sepuluh pertanyaan. Kunci jawaban: `[answer-keys/part-4/06-api-authentication-and-authorization.answers.md](../answer-keys/part-4/06-api-authentication-and-authorization.answers.md)`.

**1.** User A memakai token yang valid, lalu `GET /orders/{id milik B}` menghasilkan 200. Ini berarti:

- A) Tidak masalah selama body-nya kosong
- B) Authorization defect (IDOR)
- C) Authentication defect
- D) 415

**2.** 401 vs 403:

- A) Sama saja dan bisa saling menggantikan
- B) 401 identity ditolak; 403 identity sudah dikenal, tapi permission ditolak
- C) 403 berarti belum login
- D) Keduanya berarti 404

**3.** Hanya mengetes "no token → 401" berarti kita baru meng-cover:

- A) Authorization
- B) Authentication (satu case), bukan cross-user authorization
- C) Schema
- D) Pagination

**4.** Alasan yang masuk akal untuk mengembalikan 404, bukan 403, saat mengakses order user lain:

- A) Karena lebih cepat
- B) 403 mengonfirmasi bahwa ID tersebut memang ada (information disclosure)
- C) 404 berarti server crash
- D) REST melarang 403

**5.** Memakai satu token di `beforeAll` untuk test-test yang masing-masing menambahkan item ke cart:

- A) Recommended
- B) Mengembalikan shared mutable state — ada risiko isolation
- C) Wajib karena JWT
- D) Mencegah 401

**6.** True atau false: Menyimpan password staging di `.env` lalu meng-commit-nya ke repository itu acceptable.

**7.** `Authorization: Bearer` (tanpa token) biasanya menghasilkan:

- A) 201
- B) 401
- C) 200
- D) 301

**8.** Bug pada format header (`Bearr`, spasi hilang) sebaiknya pertama-tama dianggap sebagai:

- A) Bukti bahwa API sedang down
- B) Defect di client/test sampai request yang sudah terbukti benar juga gagal
- C) Alasan untuk menambahkan `waitForTimeout`
- D) Authorization

**9.** Role test: customer token digunakan untuk `GET /api/admin/users`, hasilnya seharusnya:

- A) 200
- B) 403 (atau 401 kalau route menolak request sebelum pengecekan role)
- C) 201
- D) 204

**10.** Hal pertama yang dilakukan kalau token tiba-tiba "randomly" gagal pada hari Senin:

- A) Tambahkan retry
- B) Cek expiry / dapatkan token baru saat runtime
- C) Hardcode token baru ke Git
- D) Hapus auth test

---



## J. Review



### Competency Check

> **Bisa nggak kamu membuktikan lewat test bahwa satu user tidak bisa membaca data user lain — dan apakah masih ada credential yang tersimpan di repository?**

Keduanya harus terpenuhi sebelum lanjut ke 4.7.

---

[← 4.5 Write Operations](05-playwright-api-write-operations.md) · [Next: 4.7 Reusable API Clients and Models →](07-reusable-api-clients-and-models.md)

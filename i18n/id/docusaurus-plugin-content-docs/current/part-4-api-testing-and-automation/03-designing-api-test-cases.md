# Chapter 4.3 — Mendesain Test Case API

🟡 **Intermediate** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)


|                        |                                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| **Part**               | IV — API Testing dan Automation                                          |
| **Estimasi waktu**     | 1 sesi (90 menit) + 5 jam belajar mandiri                                |
| **Chapter prasyarat**  | [4.1](01-http-fundamentals.md), [4.2](02-rest-api-and-crud.md)           |
| **Chapter berikutnya** | [4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md) |


---

> **Ini chapter paling penting di Part IV, dan di sini kita belum menulis automation code.** Menulis request itu gampang. Yang lebih penting adalah menentukan *apa yang harus diverifikasi*. Di situlah bedanya tester dengan orang yang sekadar menulis script.
>
> Banyak API test pemula cuma mengecek status code lalu selesai. Test seperti ini tetap bisa pass meskipun API mengembalikan 200 dengan body kosong, data salah, field hilang, atau malah data milik user lain.

---



## A. Tujuan Belajar

Setelah menyelesaikan chapter ini, kamu diharapkan bisa:

1. **Mendesain** test set untuk sebuah endpoint yang mencakup status code, response body, header, schema, authentication, authorization, negative case, boundary, data integrity, dan response time.
2. **Menulis** assertion yang benar-benar akan fail kalau behavior yang dites rusak, dan **menolak** assertion yang sebenarnya tidak mungkin fail.
3. **Mendesain** negative test yang mengecek failure yang memang didokumentasikan *dan* memastikan tidak ada side effect.
4. **Menerapkan** boundary analysis dan equivalence class pada input API.
5. **Membedakan** schema validation dengan spot-check field, serta tahu kapan masing-masing cocok digunakan.
6. **Memprioritaskan** banyak kandidat test menjadi test set yang realistis sesuai waktu yang tersedia, dan bisa menjelaskan kenapa test tertentu dipotong.
7. **Menentukan** check untuk data integrity yang benar-benar memastikan state sistem, bukan cuma response-nya.

---



## B. Pengetahuan Prasyarat


| Dibutuhkan                                    | Dari                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| HTTP method, header, status code              | [Chapter 4.1](01-http-fundamentals.md)                                                       |
| Resource, CRUD, dan convention endpoint       | [Chapter 4.2](02-rest-api-and-crud.md)                                                       |
| Falsifiability, independence, dan determinism | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md)    |
| Kriteria kualitas test case                   | [Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) |


---



## C. Penjelasan Konsep



### C.1 Sepuluh dimensi

Untuk **satu** endpoint, test yang lengkap bisa dilihat dari sepuluh dimensi. Bukan berarti semua cell harus langsung diimplementasikan. Isi dulu matrix-nya, lalu pilih berdasarkan risk.


| #   | Dimensi            | Pertanyaan yang dijawab test                                                                                          |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **Status**         | The specific success code, and the specific code for each documented failure                                          |
| 2   | **Body**           | Field yang memang sedang dites, beserta nilainya yang benar                                                           |
| 3   | **Headers**        | `Content-Type`; `Location` setelah create; `WWW-Authenticate` untuk auth jika ada                                     |
| 4   | **Schema**         | Dibutuhkan fields present, types correct, no unexpected nulls on requireds                                            |
| 5   | **Authentication** | Tanpa token, token expired, token malformed, atau scheme salah                                                        |
| 6   | **Authorization**  | Token **valid**, tapi dipakai untuk mengakses resource **user lain** — ini salah satu test dengan value paling tinggi |
| 7   | **Negative test**  | Satu rule dilanggar setiap kali: field hilang, tipe salah, JSON malformed, method salah                               |
| 8   | **Boundary**       | Min, max, satu di bawah, satu di atas, kosong, terlalu besar                                                          |
| 9   | **Integrity**      | **GET** lanjutan (atau list) memastikan state berubah — atau memastikan state *tidak* berubah saat request ditolak    |
| 10  | **Time**           | Batas waktu yang cukup longgar (misalnya 2 detik) sebagai smoke alarm, bukan benchmark                                |


Kalau cuma cek status, kamu baru meng-cover dimensi nomor 1.

### C.2 Assertion yang kuat

Dari [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md): *this test fails if ___.*


| Weak                                      | Stong                                                          |
| ----------------------------------------- | -------------------------------------------------------------- |
| `expect(response.ok()).toBeTruthy()`      | `expect(response.status()).toBe(201)`                          |
| `expect(body).toBeTruthy()`               | `expect(body.id).toMatch(/^ORD-\d{6}$/)`                       |
| `expect(body).toEqual(entireFixture)`     | `expect(body).toMatchObject({ sku, qty })` plus a schema check |
| `expect(status).not.toBe(500)`            | The documented 400/401/403/409                                 |
| `expect(items.length).toBeGreaterThan(0)` | `expect(items.map(i => i.id)).toContain(seededId)`             |


**Patokan sederhana:** dari assertion saja, reviewer seharusnya sudah bisa tahu test ini sebenarnya dibuat untuk ngecek apa.

Mengecek **seluruh** body secara verbatim akan bikin test fail hanya karena API menambahkan field seperti `taxRate`. Itu bukan failure yang berguna. Assert field yang memang menjadi fokus test, lalu tambahkan schema check untuk required field. 

### C.3 Negative test test punya tiga bagian

1. **Status yang spesifik** (400, 409, 422 — bukan sekadar "bukan 200").
2. **Error contract** (code, field, dan bentuk message).
3. **Tidak ada side effect** — GET collection atau id yang seharusnya dibuat; pastikan tidak ada data baru.

Kalau API mengembalikan 400 **tapi** tetap menyimpan sebagian order, itu defect serius. Hanya bagian ketiga yang bisa menangkap kasus ini. Jadi, negative testing bukan sekadar "kirim data ngaco". Kalau kita tidak tahu response seperti apa yang diharapkan, test-nya juga nggak banyak membantu.

Satu test sebaiknya melanggar satu rule. Kalau body sekaligus malformed JSON *dan* `Authorization` hilang, kita jadi nggak tahu 401 muncul karena auth atau karena payload.

### C.4 Boundary dan equivalence class

Misalnya `qty` pada `POST /api/cart/items` didokumentasikan boleh 1–99:


| Class                            | Nilai                | Expected              |
| -------------------------------- | -------------------- | --------------------- |
| Valid — nilai normal             | 1, 2, 50             | 200/201, line created |
| Valid — boundary                 | 1, 99                | Accept                |
| Invalid — tepat di luar boundary | 0, 100               | 400, no line          |
| Invalid — tipe salah             | `"1"`, `1.5`, `null` | 400/422, no line      |
| Missing — field tidak dikirim    | omit `qty`           | 400, no line          |


Kamu nggak perlu test angka 2 sampai 98 satu-satu. Secara equivalence, nilai-nilai itu ada di class yang sama. Yang perlu dites justru kedua ujungnya dan nilai tepat di luar ujung tersebut. Kalau cuma mengetes maximum, kamu bisa saja melewatkan `0` atau empty string.

Konsep yang sama berlaku untuk panjang string (`title` 5–120), nominal uang (threshold free shipping `$100.00` — REQ-114), dan `limit` pada pagination.

### C.5 Schema vs spot-check


|                      | Spot-check                                       | Schema / contract                                      |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Yang dicek           | Apakah `id` ini benar-benar id yang tadi dibuat? | Apakah semua required field ada dan tipenya benar?     |
| Yang bisa ditangkap  | Id salah, qty salah                              | `durationMs` berupa string, `status` hilang, `id` null |
| Biasanya fail ketika | Makna field yang dicek berubah                   | Dibutuhkan contract changes                            |
| Cost                 | Murah                                            | Lebih mahal — hand-rolled atau Zod                     |


Spot-check adalah fokus dari test-nya. Schema adalah *alarm* untuk contract. Seperti dijelaskan di [Chapter 2.13](../part-2-programming-fundamentals/13-json.md), `as Order` bukan schema validation. Runtime validation-lah yang benar-benar melakukan pengecekan. Kalau field check makin banyak, hand-rolled validation akan cepat bikin capek; validator seperti Zod lebih masuk akal. Project 3 T3 juga meminta runtime validation, bukan sekadar cast.

### C.6 Authn vs authz di dalam matrix


| Test                                      | Token                                               | Expected                       |
| ----------------------------------------- | --------------------------------------------------- | ------------------------------ |
| Belum authenticated                       | none                                                | **401**                        |
| Malformed / scheme salah                  | `Bearer` typo, `Basic` when Bearer required         | **401**                        |
| Expired / revoked                         | token yang sebelumnya valid                         | **401**                        |
| Authenticated, tapi akses order user lain | token valid milik A, tapi memakai `orderId` milik B | **403 or 404** — never **200** |


Baris terakhir adalah salah satu API test paling bernilai yang sering dilewatkan. Authentication berhasil bukan berarti user otomatis boleh mengakses semua resource. [Chapter 4.6](06-api-authentication-and-authorization.md) akan mengimplementasikannya; di sini tugas kita adalah **menentukan test-nya**.

### C.7 Integrity — percaya GET, bukan cuma POST

```text
POST /api/orders  →  201 { id: "ORD-1", status: "confirmed" }
GET  /api/orders/ORD-1  →  must exist, same sku/qty/status
```

API bisa saja "bohong": mengembalikan 201 padahal data tidak tersimpan. Atau kamu kirim `qty: 3`, tapi yang tersimpan `qty: 1`. Bisa juga request ditolak dengan 400, tapi ternyata row tetap masuk database.

Integrity berarti melakukan **request kedua**, bukan sekadar melihat body response pertama sekali lagi.

### C.8 Response time sebagai smoke alarm

Misalnya endpoint create biasanya selesai sekitar 80ms, kamu bisa pakai `expect(durationMs).toBeLessThan(2000)`. Jangan pasang threshold terlalu ketat seperti 50ms karena bisa flaky di CI. Tapi jangan juga pakai beberapa menit karena tidak ada gunanya. Ini bukan load test; tujuannya cuma menangkap kondisi seperti "endpoint sekarang nge-hang sampai 30 detik."

### C.9 Idempotency dan retry

Kalau API mendokumentasikan `Idempotency-Key`, dua POST dengan key yang sama seharusnya menghasilkan satu order. Kalau API memang tidak punya behavior tersebut, dua POST bisa menghasilkan dua order — dan test kamu tidak boleh menganggap itu bug. Pastikan dari awal kamu tahu contract yang berlaku.

### C.10 Prioritas — pelajaran sebenarnya

Sepuluh dimensi dikali belasan endpoint bisa menghasilkan ratusan kandidat test. Jelas kamu tidak akan menulis semuanya.

**Potong berdasarkan:**

1. **Risk** — dahulukan uang/transaksi, authz, data loss, dan integrity.
2. **Frekuensi perubahan** — checkout biasanya lebih sering berubah daripada footer.
3. **Cost** — test API 200ms lebih masuk akal daripada UI test 8 detik untuk rule yang sama.
4. **Budget** — bedakan kebutuhan smoke dan regression ([Chapter 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md)); perhatikan juga waktu CI di [Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md).)

Matrix berisi 10 test lengkap dengan alasan jauh lebih bagus daripada daftar 40 test tanpa prioritas. Yang dinilai adalah **alasan kamu memotong test**, bukan seberapa banyak test yang bisa kamu tulis.

### C.11 Dari matrix to files

```text
POST /api/orders
  orders.create.returns-201-and-ord-id.spec.ts     (or one file, many tests)
  orders.create.rejects-qty-zero.spec.ts
  orders.get.forbidden-for-other-user.spec.ts
```

Nama test sebaiknya langsung menyebut behavior yang diharapkan ([Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.8). Idealnya, orang bisa membaca report CI dan langsung paham behavior apa yang sedang diverifikasi.

---



## D. Konteks QA



### D.1 Dokumen ini adalah blueprint sebelum coding

Chapter 4.4–4.6 akan mengubah test yang kamu pilih menjadi automation. [Project 3](../projects/project-3-api-automation.md) C10 memang meminta design dibuat **sebelum** coding. Assignment 4.3 adalah latihan membuat dokumen tersebut untuk dua endpoint.

### D.2 Cross-user adalah test yang paling penting untuk security boundary

Contohnya: `/orders/{id}` dipanggil menggunakan id milik user lain. Kalau response-nya 200 dan data bisa dibaca, kamu baru saja menemukan vulnerability. Project 3 C6 memang fokus pada bagian ini. Ini juga salah satu test yang paling sering dilewatkan.

### D.3 Sengaja bikin test-nya fail

[Assessment §7](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders) step 7: change a label or a handler; the relevant tests go red. A matrix row that cannot be broken is not a test. Dari 4.4 onward, red output is a submission artifact.

---



## E. Contoh Code



### E.1 Sederhana — assertion lemah vs kuat

```ts
expect(response.ok()).toBeTruthy();
// membuktikan: ada response 2xx

expect(response.status(), "order should be created").toBe(201);
expect(body.id, "created order should have an ORD- id").toMatch(/^ORD-\d{6}$/);
// fail kalau: resource tidak dibuat, atau dibuat tanpa id yang sesuai dengan contract
```



### E.2 Praktikal — lima dimensi dari satu response

```ts
expect(response.status()).toBe(201);                          // status
expect(body.sku).toBe(seeded.sku);                            // body
expect(response.headers()["content-type"]).toMatch(/json/);   // headers
expect(typeof body.id).toBe("string");                        // schema (one field)
expect(Date.now() - started).toBeLessThan(2000);              // time
// integrity is a second GET — not this response
```



### E.3 Dari sudut pandang QA — potongan matrix untuk `POST /api/orders`


| ID  | Dimensi       | Case                                               | Expected                                    |
| --- | ------------- | -------------------------------------------------- | ------------------------------------------- |
| O1  | Status/body   | Valid cart, valid card                             | 201, `id` ~ `ORD-`, `status: confirmed`     |
| O2  | Headers       | Same                                               | `Location` contains `id`                    |
| O3  | Schema        | Same                                               | required fields typed; `id` not null        |
| O4  | Authn         | No token                                           | 401, no order                               |
| O5  | Authn         | Bad token                                          | 401, no order                               |
| O6  | Authz         | Token A, cart/body for B                           | 403/404, B's orders unchanged               |
| O7  | Negative test | `qty: 0`                                           | 400, no order                               |
| O8  | Negative test | Malformed JSON                                     | 400, no order                               |
| O9  | Boundary      | Subtotal $99.99 vs $100.00 shipping (REQ-114)      | shipping field differs                      |
| O10 | Integrity     | After O1                                           | GET by `id` matches; GET list contains `id` |
| O11 | Integrity     | After O7                                           | GET list does not contain a new id          |
| O12 | Time          | O1                                                 | < 2s                                        |
| …   | …             | stock = 0, expired card, duplicate idempotency key | …                                           |


Isi dulu 25+ kandidat, lalu lakukan prioritas.

### E.4 Untuk automation — potong menjadi delapan test

Pertahankan O1, O4, O6, O7, O9, O10, O11, plus expired-card. Potong O2 kalau `Location` tidak ada di contract; potong O12 kalau CI terlalu noisy dan sudah ada smoke health check; untuk variasi authn, satu representative 401 biasanya cukup. **Tulis alasan di samping setiap test yang dipotong.** Reviewer mungkin akan tidak setuju dengan salah satunya — justru diskusi itu bagian dari proses belajar.

---



## F. Kesalahan yang Sering Terjadi



### F.1 Cuma cek status

### F.2 Menjadikan `ok()` sebagai assertion utama

### F.3 Membandingkan seluruh body secara verbatim

### F.4 Negative test test = "pokoknya bukan 200"

### F.5 Tidak mengecek side effect saat request ditolak

### F.6 Authn dites, authz dilupakan

### F.7 Dua field lalu disebut "schema validation"

### F.8 Cuma mengetes maximum boundary

### F.9 Threshold response time 50ms atau 50 menit

### F.10 Enam puluh test, tidak ada prioritas, waktu habis

---

## G. Latihan

Estimasi total waktu: 110 menit.

### G.1 Easy — Sepuluh assertion (20 menit)

Untuk masing-masing assertion, jelaskan apa yang dibuktikan. Lalu rewrite enam assertion yang paling lemah.

```ts
expect(response.ok()).toBeTruthy();
expect(response.status()).toBe(201);
expect(body).toBeTruthy();
expect(body.id).toMatch(/^ORD-\d{6}$/);
expect(body).toEqual(savedSnapshot);
expect(status).not.toBe(500);
expect(items.length).toBeGreaterThan(0);
expect(items.map(i => i.sku)).toContain("LAMP");
expect(body.error.field).toBe("qty");
expect(true).toBe(true);
```



### G.2 Medium — Full matrix untuk `POST /api/cart/items` (45 menit)

Gunakan semua sepuluh dimensi, dengan minimal 20 kandidat test. Wajib mencakup boundary `qty`, SKU yang hilang, cart milik user lain, serta integrity check saat request diterima maupun ditolak.

### G.3 Challenge — Potong 30 menjadi 8 (45 menit)

Gunakan matrix 30-row yang disediakan atau matrix G.2 yang kamu kembangkan. Pilih delapan test. Tulis satu paragraf untuk setiap test yang dipotong. Setelah itu, tulis tiga kalimat untuk mempertahankan keputusan yang kemungkinan akan dipertanyakan reviewer (biasanya karena menghapus variasi 401 kedua atau menghapus check `Location`).

---

## H. Coding Assignment



### Assignment 4.3 — Spesifikasi desain test endpoint

**Objective.** Untuk **dua** endpoint demo shop — satu read (`GET /api/products` atau item GET) dan satu write (`POST /api/orders` atau `POST /api/cart/items`) — buat spesifikasi test yang nantinya akan kamu implementasikan di 4.4–4.6.

**Deliverable.** `assignment-4-3/DESIGN.md`.

Untuk setiap endpoint:

1. 1. Matrix sepuluh dimensi (kandidat diberi nomor).
2. 2. Urutan implementasi berdasarkan prioritas (apa yang kamu code duluan, dengan budget 8 + 8 test).
3. 3. Untuk setiap test yang dipertahankan: nama test (behavior), daftar assertion, data yang dibuat/dibersihkan, dan satu kalimat falsifiability.
4. 4. Untuk setiap negative test yang dipertahankan: expected status, error shape, dan **side-effect check**.
5. 5. Test yang dipotong harus ditulis jelas beserta alasannya.

Jangan pakai Playwright. Matrix tanpa proses pemotongan/prioritas dianggap belum memenuhi bagian prioritization.

**Cara assessment.**


| Dimensi                  | Weight | Full marks                                                                    |
| ------------------------ | ------ | ----------------------------------------------------------------------------- |
| Coverage sepuluh dimensi | 25%    | Kedua endpoint punya kandidat untuk semua sepuluh dimensi                     |
| Prioritization           | 30%    | Setiap cut punya alasan; authz dan integrity tetap dipertahankan              |
| Kualitas assertion       | 25%    | Kuat, falsifiable, not verbatim-body                                          |
| Data/cleanup jelas       | 20%    | Data unik; path yang reject juga menjelaskan bahwa tidak ada data yang dibuat |


> **AI usage: restricted.** A 40-row dump with no cuts scores near zero on the 30%.

---



## I. Quiz

Sepuluh pertanyaan. Answer key: `[answer-keys/part-4/03-designing-api-test-cases.answers.md](../answer-keys/part-4/03-designing-api-test-cases.answers.md)`.

**1.** `expect(response.ok()).toBeTruthy()` sebagai satu-satunya assertion membuktikan:

- A) Resource berhasil dibuat dengan benar
- B) Ada response 2xx
- C) Schema valid
- D) Authorization berhasil

**2.** Negative test test untuk `qty: 0` seharusnya mengecek:

- A) Status bukan 200
- B) 4xx yang didokumentasikan, error shape, dan tidak ada cart line / order baru
- C) 500
- D) Cuma durasi request

**3.** Authorization test dengan value paling tinggi biasanya:

- A) Missing — field tidak dikirim token → 401
- B) Token valid milik user A digunakan untuk resource user B → bukan 200
- C) `Content-Type` salah
- D) `limit=20`

**4.** Schema validation berarti:

- A) Mengecek dua field yang kebetulan kamu peduli
- B) Dibutuhkan fields present, types correct, requireds not unexpectedly null
- C) `as Order` setelah `json()`
- D) Membandingkan seluruh body dengan snapshot

**5.** `qty` boleh 1–99. Boundary set minimal yang perlu dites:

- A) 50 saja
- B) 1, 99, 0, 100
- C) 2 sampai 98
- D) 99 saja

**6.** Integrity setelah POST yang sukses dicek dengan:

- A) Membaca body POST sekali lagi
- B) GET lanjutan (atau list) menggunakan id yang dibuat
- C) Mengecek `ok()`
- D) Menunggu 5 detik

**7.** True atau false: matrix 40 row tanpa prioritas lebih bagus daripada matrix 10 row yang punya alasan jelas.

**8.** `toEqual(entireResponseFixture)` berisiko karena:

- A) Playwright melarangnya
- B) Field tambahan yang sebenarnya harmless bisa membuat test fail; failure-nya tidak berkaitan dengan behavior yang sedang kamu test
- C) Terlalu cepat
- D) Melewati status code

**9.** Assertion response time 50ms di CI biasanya:

- A) Merupakan load test yang bagus
- B) Flaky; gunakan ceiling yang cukup longgar sebagai smoke alarm
- C) Menggantikan integrity check
- D) Membuktikan pagination

**10.** Kamu cuma punya satu jam. Test mana yang dipertahankan?

- A) Lima variasi 401 tambahan hanya karena typo header
- B) Cross-user GET, `qty=0` dengan no-side-effect check, create+GET integrity, dan boundary REQ-114
- C) Snapshot seluruh body untuk setiap endpoint
- D) Cuma `ok()` untuk happy path

---



## J. Review



### Konsep penting


| Konsep          | Versi satu kalimat                                                              |
| --------------- | ------------------------------------------------------------------------------- |
| Sepuluh dimensi | Status, body, header, schema, authn, authz, negative, boundary, integrity, time |
| Kuat assert     | Fail kalau behavior *ini* rusak                                                 |
| Negative test   | Failure yang tepat + tidak ada side effect                                      |
| Schema          | Contract, bukan dua field dan bukan sekadar cast                                |
| Authz           | Token valid, tapi object/resource milik user lain                               |
| Integrity       | Request kedua                                                                   |
| Prioritas       | Risk, lalu budget                                                               |


### Competency check

> **Untuk endpoint apa pun, apakah kamu bisa menyebutkan delapan test pertama yang akan kamu tulis dan menjelaskan risk apa yang ditangani masing-masing test?**

Kalau delapan test tersebut semuanya cuma happy-path field check, ulangi E.4.

---

[← 4.2 REST APIs and CRUD](02-rest-api-and-crud.md) · [Next: 4.4 Playwright API Testing Basics →](04-playwright-api-testing-basics.md)

# Chapter 4.2 — REST API dan CRUD

🟢 **Pemula** · [Overview Part IV](00-module-overview.md) · [Daftar Isi](../README.md)


|                        |                                                                |
| ---------------------- | -------------------------------------------------------------- |
| **Part**               | IV — API Testing dan Automation                                |
| **Estimasi waktu**     | 1 sesi (90 menit) + 3,5 jam belajar mandiri                    |
| **Chapter prasyarat**  | [4.1 HTTP Fundamentals](01-http-fundamentals.md)               |
| **Chapter berikutnya** | [4.3 Designing API Test Cases](03-designing-api-test-cases.md) |


---

> REST mengorganisir API berdasarkan **resource** — biasanya berupa kata benda yang ada di sistem — bukan berdasarkan action. Kalau kamu sudah tahu resource-nya, biasanya kamu bisa menebak endpoint-nya. Dari convention method-nya, kamu juga bisa memperkirakan status code dan failure case bahkan sebelum buka dokumentasi.

---



## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu diharapkan bisa:

1. **Menjelaskan** prinsip utama REST: resource, uniform interface, statelessness, dan representation.
2. **Mengidentifikasi** resource dalam sebuah aplikasi dan **memetakan** operasi CRUD ke endpoint dan method.
3. **Menebak** endpoint API berdasarkan gambaran domain aplikasinya.
4. **Menilai** desain endpoint dan **mengusulkan** alternatif yang lebih RESTful.
5. **Menjelaskan** perbedaan collection dan item endpoint, termasuk convention untuk nested resource.
6. **Membaca** dokumentasi API (atau definisi OpenAPI/Swagger) dengan cukup baik untuk menyusun test plan.

---



## B. Prerequisite Knowledge


| Yang dibutuhkan                         | Dari                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------- |
| HTTP methods, URL, status code, headers | [Chapter 4.1](01-http-fundamentals.md)                                      |
| Struktur JSON                           | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md)               |
| Object dan array of objects             | [Chapter 2.8–2.9](../part-2-programming-fundamentals/00-module-overview.md) |


---



## C. Penjelasan Konsep



### C.1 Sebenarnya REST itu apa?

**REST** (*Representational State Transfer*) adalah sekumpulan convention, bukan protocol dan bukan berarti "JSON lewat HTTP". Banyak API yang memang pakai JSON di atas HTTP, tapi sebenarnya lebih mirip RPC yang kebetulan dibungkus seperti REST.

Buat QA, ada beberapa prinsip yang paling penting:


| Prinsip               | Maksudnya                                                                                                      | Kenapa penting buat kita                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Resources**         | Pakai kata benda (`/orders`, `/products/LAMP`), bukan verb di path. Beberapa sumber juga bilang ini "endpoint" | Kita bisa memperkirakan URL dari domain                                                                           |
| **Uniform interface** | Bentuk URL konsisten; **method** yang menunjukkan action                                                       | Beberapa method dan pola URL sudah cukup untuk menangani CRUD                                                     |
| **Statelessness**     | Setiap request membawa context yang dibutuhkan                                                                 | Auth harus ikut di setiap call ([Chapter 4.1](01-http-fundamentals.md) C.1)                                       |
| **Representations**   | JSON yang dikirim/diterima adalah representasi state resource, bukan isi database mentah                       | Response 201 boleh saja tidak mengembalikan semua field yang tersimpan; GET juga bisa punya field hasil kalkulasi |


Dalam praktiknya, API "RESTful" biasanya tetap punya beberapa endpoint yang sifatnya RPC, misalnya `POST /orders/8842/cancel`. Kita tetap harus mengetes API seperti apa adanya. Yang penting, kita tahu convention-nya supaya tahu risiko apa yang perlu dicari.

### C.2 Resource, collection, dan item

**Collection** adalah kumpulan resource, misalnya `/api/products`. **Item** adalah satu resource di dalam collection tersebut, misalnya `/api/products/LAMP` (atau `/api/products/8842` kalau id-nya berupa angka).

```text
Collection                         Item
GET    /api/products               GET    /api/products/{id}
POST   /api/products               PUT    /api/products/{id}
                                    PATCH  /api/products/{id}
                                    DELETE /api/products/{id}
```

Ini sebenarnya sudah mencakup pola CRUD untuk satu resource. Kita nggak perlu membuat endpoint seperti `POST /api/createProduct` atau `GET /api/getProductById`.

**Representation** adalah bentuk JSON resource pada saat itu. Dua kali GET ke resource yang sama bisa menghasilkan data berbeda karena state-nya berubah, misalnya stock berkurang. Jadi jangan menganggap data katalog selalu sama kecuali product tersebut memang dibuat oleh test kita sendiri.

### C.3 CRUD dan mapping ke method + status code


| Operasi             | Method               | Success yang umum    | Body yang umum                           |
| ------------------- | -------------------- | -------------------- | ---------------------------------------- |
| **C**reate          | `POST` ke collection | **201**              | Resource yang dibuat + `Location` header |
| **R**ead satu       | `GET` ke item        | **200**              | Item                                     |
| **R**ead banyak     | `GET` ke collection  | **200**              | Array atau `{ items, page, total }`      |
| **U**pdate/replace  | `PUT` ke item        | **200** atau **204** | Full resource, atau kosong               |
| **U**pdate sebagian | `PATCH` ke item      | **200**              | Resource setelah di-merge                |
| **D**elete          | `DELETE` ke item     | **204** (atau 200)   | Kosong, atau receipt                     |


Mengharapkan semua operasi sukses menghasilkan 200 adalah kesalahan umum saat baru belajar API. Kalau create mengembalikan 200 tanpa `Location` dan tanpa id, itu tetap harus kita test sesuai contract — walaupun dari sisi desain, 201 biasanya lebih jelas.

**404 vs 403 pada GET item.** 404 bisa berarti id memang tidak ada, atau server sengaja tidak mau mengungkap bahwa resource tersebut ada karena alasan authorization. 403 berarti kita sudah authenticated dan server secara eksplisit mengatakan resource-nya ada, tapi kita tidak boleh melihatnya. [Chapter 4.6](06-api-authentication-and-authorization.md) membahas ini sebagai pilihan desain terkait information disclosure. Jangan menebak behavior API; lihat dan dokumentasikan apa yang benar-benar dilakukan API.

### C.4 Collection endpoint: filter, sort, dan pagination

```text
GET /api/products?q=lamp&sort=-price&page=2&limit=20
```


| Yang dites | Contoh query                        | Bug kalau cuma test page 1                               |
| ---------- | ----------------------------------- | -------------------------------------------------------- |
| Filter     | `status=shipped`, `q=lamp`          | Filter diabaikan dan API selalu mengembalikan semua data |
| Sort       | `sort=price` atau `sort=-createdAt` | Urutan data tidak konsisten dan bergantung pada database |
| Pagination | `page`, `limit`, `cursor`           | Page 2 kosong, atau page 1 diam-diam memotong data       |


**Default pagination sering banget lolos dari testing.** Misalnya endpoint mengembalikan 50 dari 10.000 product tanpa `total` dan tanpa link ke page berikutnya. Kalau assertion kita cuma `items.length > 0`, response tersebut kelihatan baik-baik saja.

Karena itu, matrix di [Chapter 4.3](03-designing-api-test-cases.md) harus mencakup setidaknya: apa yang terjadi di halaman terakhir, serta apa yang terjadi saat `limit` bernilai 0, 1, nilai maksimum, dan lebih besar dari maksimum.

### C.5 Nested resource

```text
GET  /api/users/5/orders
POST /api/users/5/orders
GET  /api/users/5/orders/ORD-8842
```

Nested resource berguna kalau child memang memiliki "hubungan" dengan parent-nya, misalnya order line yang hanya punya arti di dalam sebuah order.

Tapi nested mulai menyulitkan kalau terlalu dalam:

```text
/users/5/orders/9/items/2/tax-lines/1
```

Hal yang sama berlaku kalau order yang sama juga bisa diakses lewat `/api/orders/ORD-8842`, tapi kedua endpoint tersebut punya aturan authorization yang berbeda.

Nested route juga otomatis menjadi **authorization boundary**. Order milik user 5 tidak boleh muncul saat kita memanggil `GET /api/users/7/orders`. Ini akan menjadi salah satu probe di [Chapter 4.6](06-api-authentication-and-authorization.md). Jadi, saat melihat nested endpoint, langsung tandai sebagai area yang perlu dites dari sisi authorization.

### C.6 PUT vs PATCH — bug field yang tiba-tiba hilang

Misalnya product yang tersimpan seperti ini:

```text
Stored product:
{ "sku": "LAMP", "title": "Aeron Lamp", "price": 49.5, "active": true }

PUT /api/products/LAMP
{ "title": "Aeron Desk Lamp" }
```

Kalau server mengimplementasikan PUT sebagai **replace**, hasil akhirnya bisa menjadi:

```text
Stored now:
{ "sku": "LAMP", "title": "Aeron Desk Lamp" }

price hilang, active hilang — atau di-reset ke default
```

Sedangkan kalau memakai PATCH:

```text
PATCH /api/products/LAMP
{ "title": "Aeron Desk Lamp" }
```

Hasil yang diharapkan:

```text
Stored now:
{ "sku": "LAMP", "title": "Aeron Desk Lamp", "price": 49.5, "active": true }
```

Ini bukan sekadar perbedaan istilah. Ini bug yang benar-benar bisa ditemukan lewat testing. Client, termasuk mobile app, sering mengirim partial body ke endpoint "update" yang disebut di dokumentasi. Kalau endpoint tersebut ternyata PUT, field yang tidak dikirim bisa ikut hilang.

[Chapter 4.5](05-playwright-api-write-operations.md) akan menjadikan kasus ini sebagai required test. Jadi jangan menganggap PUT dan PATCH bisa dipakai bergantian.

### C.7 Idempotency dalam praktik


| Call                                | Pertama kali             | Langsung di-retry                                                       |
| ----------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `DELETE /api/products/LAMP`         | 204, data hilang         | **204 atau 404** — keduanya bisa benar; pilih sesuai contract lalu test |
| `PUT` dengan body lengkap yang sama | 200, resource di-replace | 200, state tetap sama                                                   |
| `POST /api/orders`                  | 201, `ORD-1`             | **201,** `ORD-2` kecuali API menggunakan `Idempotency-Key`              |


Kalau test melakukan retry POST tanpa menyadari bahwa order kedua dibuat, test bisa flaky saat mengecek "harus ada tepat satu order". Kelihatannya seperti masalah isolation, padahal sumbernya adalah semantics HTTP ([Chapter 4.1](01-http-fundamentals.md) C.4).

### C.8 Bentuk error response

API yang enak dites sebaiknya punya **satu bentuk error yang konsisten**:

```json
{ "error": { "code": "VALIDATION", "field": "qty", "message": "qty must be >= 1" } }
```

Kalau error-nya berubah-ubah seperti `"bad qty"`, `"Qty invalid"`, atau `"quantity_error"`, negative test jadi gampang brittle.

Saat menilai sebuah API, error contract yang konsisten adalah feature. Kita cukup membuat satu reusable assertion untuk banyak negative test, bukan membuat assertion berbeda untuk setiap variasi string. [Chapter 4.7](07-reusable-api-clients-and-models.md) nanti akan membuat type untuk bentuk error seperti ini.

### C.9 Versioning

Contoh versioning:

```text
/api/v1/products
```

atau:

```text
/api/products
Accept-Version: v1
```

Saat version API berubah, anggap itu sebagai **contract baru**. Test suite biasanya punya dua pilihan:

- tetap menjalankan test v1 sampai v1 benar-benar retired, atau
- pindah mengikuti v2 dan menerima bahwa client lama menjadi concern di tempat lain.

Jangan diam-diam mengarahkan test yang sama ke v2 lalu menyebut perbedaan behavior sebagai "flaky test".

### C.10 Membaca OpenAPI / Swagger

Dokumen OpenAPI biasanya berisi path, method, parameter, request body, dan response schema. Gunakan dokumentasi ini untuk **menyusun test**, bukan untuk langsung percaya bahwa implementasinya pasti benar.


| Yang tertulis di spec      | Yang tetap harus kita lakukan                                                 |
| -------------------------- | ----------------------------------------------------------------------------- |
| `POST /orders` → 201       | Kirim request dan pastikan benar-benar mendapat 201 **serta** body yang benar |
| `qty: integer, minimum: 1` | Coba `0`, `1`, dan string `"1"`                                               |
| Security: bearer           | Coba tanpa token, token salah, dan token milik user lain                      |


Dokumentasi bisa saja ketinggalan dari implementasi. Saat ada perbedaan, DevTools dan API yang sedang berjalan menjadi sumber fakta. **Laporkan mismatch tersebut.** Itu finding, bukan alasan untuk mengikuti dokumentasi yang sudah salah.

### C.11 Five design smell


| Smell                          | Contoh                                      | Risiko                                                                           | Alternatif yang lebih RESTful             |
| ------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Verb di path                   | `POST /api/getUserById`                     | Read dilakukan lewat POST yang tidak idempotent; cache dan retry bisa bermasalah | `GET /api/users/{id}`                     |
| GET yang destructive           | `GET /api/deleteProduct/5`                  | Prefetch, crawler, atau retry bisa menghapus data                                | `DELETE /api/products/5`                  |
| RPC untuk update               | `POST /api/v1/users/5/update-email-address` | Setiap field bisa berujung jadi endpoint sendiri                                 | `PATCH /api/users/5` `{ "email": "..." }` |
| Action sebagai GET dengan body | `GET /api/search` + JSON body               | Body pada GET tidak portable                                                     | `GET /api/products?q=`                    |
| Collection sebagai verb        | `POST /api/doCheckout`                      | Kita tidak bisa memperlakukan order sebagai resource                             | `POST /api/orders`                        |


Demo 3 di [instructor notes](instructor-notes.md) menggunakan tabel ini. Tapi kalau API yang kamu test memang punya desain seperti di atas, tetap test API tersebut. Yang penting, tulis risikonya di test plan.

---



## D. Konteks QA

### D.1 Resource map → test plan → struktur folder

```text
src/api/products-client.ts     # satu resource
tests/api/products.spec.ts     # test untuk resource tersebut
tests/api/orders.spec.ts
```

[Project 3](../projects/project-3-api-automation.md) nantinya mengimplementasikan mapping ini. Assignment 4.2 sebenarnya adalah proses membuat mapping tersebut.

### D.2 Convention CRUD menjadi lifecycle test

[Chapter 4.5](05-playwright-api-write-operations.md) akan melakukan create → read → update → delete menggunakan data yang dibuat dan dimiliki oleh test itu sendiri. Status code di C.3 adalah expected value untuk lifecycle tersebut.

### D.3 Nesting adalah peta authorization

```text
/users/{id}/orders
```

Endpoint seperti ini adalah tempat yang bagus untuk mencari cross-user bug. [Chapter 4.6](06-api-authentication-and-authorization.md) akan membahas cara melakukan probe-nya.

### D.4 Reuse error contract

Satu assertion seperti:

```text
expectError(body, { code, field })
```

jauh lebih enak daripada membuat puluhan assertion seperti:

```text
toContain("invalid")
```

Error yang tidak konsisten bukan cuma masalah product; itu juga menambah maintenance cost di automation.

---



## E. Code Examples



### E.1 Sangat sederhana — lima request CRUD

```text
POST   /api/products          { "sku": "LAMP-a1", "title": "Aeron Lamp", "price": 49.5 }
GET    /api/products/LAMP-a1
PUT    /api/products/LAMP-a1  { "sku": "LAMP-a1", "title": "Aeron Desk Lamp", "price": 49.5, "active": true }
PATCH  /api/products/LAMP-a1  { "price": 45 }
DELETE /api/products/LAMP-a1
```

Sebelum menjalankan request tersebut, tulis dulu expected success status untuk masing-masing.

### E.2 Praktikal — collection dengan query

```text
GET /api/products?q=lamp&sort=price&limit=2&page=1
```

Assertion yang masuk akal:

- setiap item harus sesuai filter;
- urutan harga harus non-decreasing;
- `items.length <= 2`;
- kalau `total > 2`, page 2 harus punya data atau response menyediakan `next`.



### E.3 QA-oriented — resource map demo shop


| Resource | Collection                           | Item                    | Nested                   |
| -------- | ------------------------------------ | ----------------------- | ------------------------ |
| Users    | `/api/users`                         | `/api/users/{id}`       | —                        |
| Products | `/api/products`                      | `/api/products/{sku}`   | —                        |
| Cart     | `/api/cart`                          | `/api/cart/items/{sku}` | items di dalam cart      |
| Orders   | `/api/orders`                        | `/api/orders/{id}`      | `/api/orders/{id}/items` |
| Auth     | `/api/auth/login` (RPC — acceptable) | —                       | —                        |


Login boleh saja berbentuk action. Kalau mau sangat RESTful, session bisa dianggap sebagai resource dengan `POST /api/sessions`. Tapi untuk QA, kita tidak perlu memaksakan teori ke API nyata. Kritik path yang benar-benar kita temukan di DevTools, terutama kalau berbeda dari tabel di atas.

### E.4 Automation-oriented — test PUT yang menghapus field

```text
# Arrange: buat product lengkap
POST /api/products
{ "sku": "LAMP-e1", "title": "Lamp", "price": 49.5, "active": true }

# Act: PUT dengan body partial
PUT /api/products/LAMP-e1
{ "title": "Renamed" }

# Assert via GET
# Defect: price hilang atau null, active hilang
# PUT yang benar: 400 "incomplete representation"
# Untuk partial update: gunakan PATCH; price dan active harus tetap sama
```

---



## F. Common Mistakes



### F.1 Menganggap semua API pasti RESTful

`POST /getUserById` benar-benar bisa ditemukan di dunia nyata. Test apa yang tersedia, lalu sebutkan risikonya.

### F.2 Menganggap PUT = PATCH

Bisa menyebabkan field terhapus. Lihat C.6.

### F.3 Selalu mengharapkan 200 untuk create atau delete

201 dan 204 juga success. Assertion harus mengikuti contract API.

### F.4 Mengabaikan `Location` setelah create

`Location` adalah bagian dari contract create. Ikuti header tersebut atau pastikan nilainya sesuai dengan `body.id`.

### F.5 Cuma test page 1

Bug pagination sering muncul di page 2 atau saat `limit` berada di boundary.

### F.6 Menganggap DELETE aman untuk dilakukan berulang-ulang

Yang idempotent adalah **efek akhirnya**, bukan berarti status code-nya selalu sama. Jangan sembarang DELETE data katalog yang dipakai bersama.

### F.7 Membuat test plan hanya dari UI

UI mungkin tidak pernah memanggil `DELETE /products`. Bukan berarti endpoint tersebut tidak ada atau tidak perlu dites.

### F.8 Lebih percaya dokumentasi daripada request yang benar-benar terjadi

Kalau spec dan actual API berbeda, laporkan mismatch-nya. Jangan diam-diam mengikuti dokumentasi yang salah.

---



## G. Exercise

Total waktu yang disarankan: 85 menit.

### G.1 Easy — CRUD tables (20 menit)

Untuk setiap resource berikut — `User`, `Product`, `CartItem`, `Order`, `Review`, `DiscountCode` — tuliskan lima endpoint CRUD-nya atau tandai N/A jika memang tidak relevan. Tambahkan expected success status untuk masing-masing.

### G.2 Medium — Delapan design critique (30 menit)

Untuk setiap endpoint di bawah, buat alternatif yang lebih RESTful dan sebutkan **risiko** dari desain awalnya: retry, cache, authorization, terlalu banyak endpoint, atau data terhapus karena prefetch.

```text
1. POST /api/getUserById
2. GET  /api/deleteProduct/5
3. POST /api/v1/users/5/update-email-address
4. GET  /api/search          (JSON body)
5. POST /api/doCheckout
6. PUT  /api/products        (no id — "update whatever")
7. GET  /api/orders/latest   (no user context in URL or token)
8. POST /api/products/LAMP/setActiveTrue
```



### G.3 Challenge — Tebak dulu, lalu verifikasi (35 menit)

Mulai dari **UI demo shop saja**. Dari sana, buat daftar resource dan endpoint yang menurutmu kemungkinan ada.

Setelah itu buka DevTools dan dokumentasikan semua perbedaannya.

Perbedaan antara tebakan dan API sebenarnya justru bagian paling berharga dari exercise ini — bukan tanda bahwa tebakanmu gagal.

---



## H. Coding Assignment



### Assignment 4.2 — Resource map dan endpoint critique

**Objective.** Buat mapping antara resource dan endpoint yang nantinya akan diimplementasikan oleh [Project 3](../projects/project-3-api-automation.md), lalu critique minimal tiga keputusan desain API.

**Deliverable:** `assignment-4-2/RESOURCE-MAP.md`.

Untuk **setiap** resource yang akan kamu automate (minimal: products, cart, orders, auth/users):


| Field                    | Required                                             |
| ------------------------ | ---------------------------------------------------- |
| Collection dan item path |                                                      |
| Method yang didukung     | Berdasarkan hasil observasi atau dokumentasi         |
| Path dan query parameter |                                                      |
| Success status           | Per method                                           |
| Request / response shape | Daftar field, bukan penjelasan panjang               |
| Nesting                  | Parent/child dan implikasinya terhadap authorization |


Setelah itu buat **tiga critique**. Untuk masing-masing, jelaskan:

1. API saat ini melakukan apa.
2. Risiko untuk client atau tester.
3. Alternatif yang lebih RESTful, **atau** alasan kenapa exception tersebut masih masuk akal.

Contohnya, login sebagai `POST` adalah exception yang valid.

Kalau tersedia OpenAPI, tambahkan satu bagian **"spec vs wire"** untuk dua endpoint.

**Cara assessment dilakukan:**


| Dimension       | Weight | Full marks                                                         |
| --------------- | ------ | ------------------------------------------------------------------ |
| Completeness    | 30%    | Empat resource, method, status, dan shape lengkap                  |
| Observation     | 25%    | Path sesuai DevTools atau gap spec/wire dicatat                    |
| Critique        | 30%    | Risiko disebutkan secara spesifik, bukan sekadar "desainnya jelek" |
| Authz awareness | 15%    | Minimal satu nested atau cross-user boundary diidentifikasi        |


> **Penggunaan AI: terbatas.** Endpoint yang dibuat-buat dan ternyata tidak ada di demo API akan dianggap gagal dari sisi observation.

---



## I. Quiz

Sembilan pertanyaan. Answer key: `[answer-keys/part-4/02-rest-api-and-crud.answers.md](../answer-keys/part-4/02-rest-api-and-crud.answers.md)`.

**1.** REST mengorganisir API berdasarkan:

- A) URL baru untuk setiap action (`/create`, `/update`)
- B) Resource (kata benda); method menunjukkan action
- C) SOAP envelope
- D) Hanya GET

**2.** Success status yang umum untuk `POST /api/orders` yang berhasil membuat record:

- A) Hanya 200
- B) 201 (biasanya dengan `Location`)
- C) 204
- D) 301

**3.** `GET /api/deleteProduct/5` dianggap design smell karena:

- A) GET tidak boleh punya path parameter
- B) GET bersifat safe — cache, prefetch, dan retry bisa malah menghapus data
- C) Delete harus menggunakan PATCH
- D) Angka 5 tidak valid

**4.** Client mengirim `{ "title": "New" }` ke `PUT /products/LAMP`, dan endpoint tersebut menerapkan semantics replace. Kemungkinan hasilnya:

- A) Hanya title yang berubah; field lain tetap
- B) Field yang tidak dikirim bisa terhapus atau di-reset
- C) Server mengabaikan PUT
- D) Selalu 415

**5.** True atau false: Semua API yang menggunakan JSON melalui HTTP berarti RESTful.

**6.** Kamu hanya assert `GET /products?limit=20` menghasilkan `length > 0`. Risiko apa yang terlewat?

- A) Tidak ada
- B) Pagination dan total — page 2, last page, dan boundary `limit`
- C) HTTPS
- D) Cookies

**7.** Kamu melakukan `DELETE` pada item yang sama dua kali. Contract yang masih bisa dianggap benar adalah:

- A) 201 lalu 201
- B) 204 lalu 204 atau 404 — keduanya bisa valid; ikuti contract yang didokumentasikan
- C) 500 lalu 200
- D) GET lalu POST

**8.** `GET /api/users/5/orders` terutama menambah concern testing apa?

- A) CSS
- B) Authorization — order user 5 tidak boleh bocor ke user 7
- C) File upload
- D) WebSocket

**9.** OpenAPI mengatakan `qty` memiliki minimum 1. Kamu tetap harus:

- A) Percaya spec dan tidak perlu mencoba 0
- B) Coba 0, 1, dan wrong type, lalu laporkan kalau spec dan actual API berbeda
- C) Hanya test `qty=999999`
- D) Menggunakan GET untuk membuat order

---



## J. Review



### Key concepts


| Konsep            | Versi singkat                                                               |
| ----------------- | --------------------------------------------------------------------------- |
| Resource          | Kata benda yang bisa kita representasikan lewat URL                         |
| Collection / item | Kumpulan resource vs satu resource                                          |
| Uniform interface | Method menjadi "kata kerja"-nya                                             |
| PUT vs PATCH      | Replace vs partial update — field yang hilang adalah bug nyata              |
| Pagination        | Page 1 bukan berarti seluruh collection                                     |
| Nesting           | Menunjukkan hubungan parent/child sekaligus boundary authorization          |
| Error shape       | Satu contract bisa dipakai untuk banyak test                                |
| Spec vs wire      | Gunakan docs untuk planning; percaya behavior API yang benar-benar berjalan |




### Competency check

> **Kalau dikasih gambaran sebuah domain, apakah kamu bisa memperkirakan endpoint yang dibutuhkan dan menyebutkan dua design defect yang paling mungkin perlu dites?**

Dua kandidat yang sering muncul: **PUT yang menghapus field**, dan **nested/cross-user data leak**.

Kalau dua hal ini belum terpikir saat melihat desain API, coba ulangi bagian C.5–C.6.

---

[← 4.1 HTTP Fundamentals](01-http-fundamentals.md) · [Next: 4.3 Designing API Test Cases →](03-designing-api-test-cases.md)

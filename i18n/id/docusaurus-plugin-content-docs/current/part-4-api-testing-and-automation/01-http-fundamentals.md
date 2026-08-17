# Chapter 4.1 — Fundamental HTTP

🟢 **Pemula** · [Overview Part IV](00-module-overview.md) · [Daftar Isi](../README.md)


|                        |                                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| **Part**               | IV — API Testing dan Automation                                             |
| **Estimasi waktu**     | 1 sesi (90 menit) + 4 jam belajar mandiri                                   |
| **Chapter prasyarat**  | [Part III](../part-3-automation-fundamentals/00-module-overview.md) selesai |
| **Chapter berikutnya** | [4.2 REST APIs dan CRUD](02-rest-api-and-crud.md)                           |


---

> Setiap web application yang akan kamu test sebenarnya adalah sebuah percakapan. Client mengirim **request**; server mengirim **response**. Kalau kamu sudah lancar membaca kedua sisi ini, API testing nggak lagi terasa membingungkan — kamu cuma harus mengecek apakah server memberikan respons yang benar.

---

## A. Learning Objectives

Di akhir chapter ini kamu diharapkan bisa:

1. **Menjelaskan** model client/server request-response.
2. **Membedah** sebuah URL menjadi scheme, host, port, path, path parameters, query parameters, dan fragment.
3. **Memilih** HTTP method yang tepat untuk sebuah operasi dan **menjelaskan** safety serta idempotency.
4. **Mengidentifikasi** fungsi request dan response header yang umum, termasuk `Content-Type` dan `Authorization`.
5. **Menginterpretasikan** status code berdasarkan class-nya, serta **membedakan** client error dan server error.
6. **Menjelaskan** bagaimana cookie mempertahankan session state, dan **membandingkan** session berbasis cookie dengan authentication berbasis token.
7. **Mengambil** dan **memberi anotasi** pada pasangan request/response nyata menggunakan Browser DevTools.

---

## B. Pengetahuan Prasyarat


| Yang dibutuhkan                                | Dari                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| Struktur dan parsing JSON                      | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md)       |
| Object dan nested data                         | [Chapter 2.9](../part-2-programming-fundamentals/09-objects.md)     |
| Istilah test design dan reliability properties | [Part III](../part-3-automation-fundamentals/00-module-overview.md) |


Tidak perlu punya background networking sebelumnya.

---

## C. Penjelasan Konsep

### C.1 Satu percakapan adalah satu request

**Client** (browser, mobile app, Playwright `request`, `curl`) "menginginkan" sesuatu. **Server** yang memutuskan apa yang diinginkan lalu memberikan respons. HTTP bersifat **stateless** yang artinya setiap request berdiri sendiri. Server tidak dapat mengingat request sebelumnya kecuali client mengirimkan sesuatu yang bisa digunakan sebagai pengingat, misalnya cookie, token, atau session id, melalui header pada request *ini*.

Itulah kenapa "gue sudah login di test sebelumnya" bukan sesuatu yang diketahui server. Call berikutnya tetap harus membawa credential lagi. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) tentang independence dan [Chapter 4.6](06-api-authentication-and-authorization.md) sebenarnya membahas ide yang sama, hanya pada skala yang berbeda.

UI yang kamu klik juga sebenarnya adalah client dari API yang sama. Buka DevTools → Network, filter ke Fetch/XHR untuk melihat list dari API yang digunakan untuk berkomunikasi antara client dan server. 
Setiap tombol yang kamu klik adalah request yang nantinya bisa kamu jadikan test.

### C.2 Anatomi sebuah request

Ada empat bagian penting:


| Bagian      | Fungsi                                 | Contoh                                        |
| ----------- | -------------------------------------- | --------------------------------------------- |
| **Method**  | Intent / tujuan                        | `POST`                                        |
| **URL**     | Resource mana yang dituju, plus filter | `https://shop.test/api/orders?status=shipped` |
| **Headers** | Metadata tentang message               | `Content-Type: application/json`              |
| **Body**    | Payload (untuk create/modify)          | `{"sku":"LAMP","qty":1}`                      |


Sebuah **response** punya bentuk yang mirip: **status code**, **headers**, **body**.

```text
POST /api/orders HTTP/1.1
Host: shop.test
Content-Type: application/json
Authorization: Bearer eyJhbG...
Accept: application/json

{"sku":"LAMP","qty":1}
```

```text
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/ORD-000884

{"id":"ORD-000884","status":"confirmed","sku":"LAMP","qty":1}
```

### C.3 Anatomi URL — bagian mana yang merupakan data

```text
https://shop.test:443/api/orders/ORD-8842?status=shipped&limit=20#receipt
│      │         │    │            │         │                    │
│      │         │    │            │         query string         fragment
│      │         │    │            path parameter (order mana)
│      │         │    path
│      │         port (443 adalah default untuk https; sering tidak ditulis)
│      host
scheme
```


| Bagian           | Apa itu                      | Membawa data?                                   |
| ---------------- | ---------------------------- | ----------------------------------------------- |
| scheme           | `http` atau `https`          | Cara berkomunikasi, bukan *record* mana         |
| host             | `shop.test`                  | Nama server/DNS                                 |
| port             | `443`, `3000`                | Alamat virtual dimana process dilakukan         |
| path             | `/api/orders/ORD-8842`       | Ya — resource-nya                               |
| path parameter   | `ORD-8842`                   | Ya — *resource yang mana*                       |
| query parameters | `status=shipped`, `limit=20` | Ya — *cara filter atau paging*                  |
| fragment         | `#receipt`                   | Hanya untuk client; **tidak dikirim ke server** |


Pemula sering mencampuradukkan path dan query. Rule of thumb: **path mengidentifikasi resource; query mengatur hasilnya.** `/api/orders/ORD-8842` adalah satu order. `/api/orders?status=shipped` adalah sebuah list. Menaruh filter di path (`/api/orders/status/shipped`) atau id di query (`/api/orders?id=ORD-8842`) adalah keputusan desain yang akan kamu kritik di [Chapter 4.2](02-rest-api-and-crud.md). Untuk sekarang, fokus dulu bisa membedakan keduanya saat membaca URL.

### C.4 Method, safety, dan idempotency


| Method    | Tujuan umum                             | Safe? | Idempotent?                                |
| --------- | --------------------------------------- | ----- | ------------------------------------------ |
| `GET`     | Read                                    | Ya    | Ya                                         |
| `HEAD`    | Header saja, tanpa body                 | Ya    | Ya                                         |
| `OPTIONS` | Mengetahui method/header yang diizinkan | Ya    | Ya                                         |
| `POST`    | Create, atau menjalankan proses         | Tidak | **Tidak** (biasanya)                       |
| `PUT`     | Replace seluruh resource                | Tidak | Ya                                         |
| `PATCH`   | Mengubah sebagian resource              | Tidak | Seharusnya ya, dan seringnya memang begitu |
| `DELETE`  | Menghapus                               | Tidak | Ya (hapus dua kali → tetap sudah terhapus) |


**Safe** artinya "tidak mengubah state di server." Test runner, crawler, atau retry boleh melakukan `GET` dengan bebas. Kalau sebuah `GET` malah menghapus record, itu melanggar contract yang berlaku.

**Idempotent** artinya "melakukannya N kali menghasilkan efek yang sama seperti melakukannya sekali." `PUT` dengan body yang sama dua kali: resource tetap sama. `DELETE` dua kali: request kedua bisa menghasilkan 404, tapi resource tetap sudah hilang. `POST` dua kali: bisa membuat dua order — kecuali API punya idempotency key.

Ini penting karena Playwright dan CI melakukan **retry**. Retry `GET` itu nggak masalah. Retry `POST /orders` tanpa mekanisme idempotency **bisa membuat order kedua**. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) sudah membahas bahwa retry bukan strategi reliability. HTTP semantics menjelaskan kenapa.

`PUT` vs `PATCH` sama - sama mengubah data, tapi penggunaannya berbeda. `PUT` dengan partial body bisa **menghapus field yang tidak dikirim client**. Sedangkan `PATCH` akan mengubah data sesuai dengan request body yang dikirimkan saat melakukan request.

Metode `GET` request akan mengabaikan body request jika dikirimkan. Kita perlu menggunakan query string untuk dapat mengirimkan data melalui `GET` request.

### C.5 Header adalah bagian dari contract

Header bukan sekadar hiasan. Demo 2: kirim `POST` yang sama tiga kali — dengan `Content-Type` yang benar, tanpa `Content-Type`, dan dengan `Content-Type` yang salah — lalu catat statusnya. `Content-Type: application/json` yang hilang sering menghasilkan **415 Unsupported Media Type**. Beberapa orang sering menganggap ini sebagai "API-nya rusak." Padahal API menolak message yang tidak bisa dia parse. Itu adalah client error.

**Request header yang perlu diketahui**


| Header                                     | Fungsi                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `Content-Type`                             | Menjelaskan isi **body** (`application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`) |
| `Accept`                                   | Menjelaskan format yang bersedia diterima client                                                          |
| `Authorization`                            | Siapa yang melakukan request (`Bearer <token>`, `Basic ...`)                                              |
| `User-Agent`                               | Client apa yang digunakan; kadang dipakai untuk logging atau blocking                                     |
| `Cookie`                                   | Session cookie yang disimpan dan dikirim ulang oleh browser                                               |
| Custom (`X-Request-Id`, `Idempotency-Key`) | Correlation dan retry yang aman                                                                           |


**Response header yang perlu diketahui**


| Header                             | Fungsi                                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Type`                     | Menjelaskan isi **response body** — parse sebagai JSON hanya jika header ini menunjukkan JSON (atau kamu sudah melakukan validasi) |
| `Location`                         | Menunjukkan lokasi resource yang baru dibuat (sering muncul bersama 201)                                                           |
| `Set-Cookie`                       | Server meminta client menyimpan cookie                                                                                             |
| `Cache-Control` / `ETag`           | Caching — hasil GET yang stale bisa jadi jebakan dalam test design                                                                 |
| `Retry-After` / rate-limit headers | Menjelaskan kenapa parallel suite kamu baru saja mendapat 429                                                                      |


Nama **header** tidak case-sensitive (`Content-Type` = `content-type`). Nilai header berbeda: `Bearer` vs `bearer` biasanya masih ditoleransi, tetapi string token tidak boleh sembarangan diubah casing-nya.

### C.6 Body


| Jenis        | Kapan                                          | Catatan                                          |
| ------------ | ---------------------------------------------- | ------------------------------------------------ |
| JSON         | Hampir semua API di course ini                 | `Content-Type: application/json`                 |
| Form-encoded | HTML form tradisional, beberapa endpoint login | `application/x-www-form-urlencoded`              |
| Multipart    | File upload                                    | Menggunakan boundary; bukan JSON                 |
| Empty        | `GET`, `DELETE`, beberapa action `POST`        | Kalau tidak ada body, `Content-Type` tidak wajib |


[Chapter 2.13](../part-2-programming-fundamentals/13-json.md): body adalah **text** saat dikirim melalui wire. `response.json()` melakukan parsing terhadapnya. Halaman HTML 500 bukan JSON. Response 200 dengan `{"error":"insufficient stock"}` terlihat sukses dari sisi HTTP, tetapi operasi bisnisnya gagal.

### C.7 Status code berdasarkan class

Status code dapat dibagi menjadi 4 class untuk memudahkan memepelajarinya. Setelah dapat memahami status code pada setiap kelas, hafalkan lima belas code penting di bawah4.


| Class   | Arti                                                                | Implikasi untuk testing                                         |
| ------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| **2xx** | Success                                                             | Tetap baca body                                                 |
| **3xx** | Redirect                                                            | Follow atau assert `Location`; jangan diabaikan                 |
| **4xx** | **Client** error — *kamu* mengirim sesuatu yang tidak bisa diterima | Dalam **negative test**, ini bisa menjadi hasil yang diharapkan |
| **5xx** | **Server** error                                                    | Hampir selalu defect (atau environment sedang overload)         |


**Lima belas code yang perlu diketahui**


| Code      | Nama                      | Arti umum di course ini                                                                         |
| --------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| 200       | OK                        | Read atau action sukses dengan body                                                             |
| 201       | Created                   | `POST` membuat resource; cari `Location` dan id                                                 |
| 204       | No Content                | Sukses, body kosong — umum untuk `DELETE`                                                       |
| 301 / 302 | Redirect                  | URL berpindah; test bisa saja mengikuti atau tidak                                              |
| 400       | Bad Request               | Request malformed atau gagal validasi                                                           |
| 401       | Unauthorized              | **Belum authenticated** — credential hilang/salah                                               |
| 403       | Forbidden                 | Sudah authenticated, tetapi **tidak diizinkan**                                                 |
| 404       | Not Found                 | Resource tidak ditemukan (atau server tidak mau mengakui resource tersebut ada)                 |
| 409       | Conflict                  | Duplicate email, stale version, atau state conflict                                             |
| 415       | Unsupported Media Type    | `Content-Type` salah atau hilang                                                                |
| 422       | Unprocessable Entity      | JSON valid secara format, tapi invalid secara semantic (beberapa API memakai ini alih-alih 400) |
| 429       | Too Many Requests         | Rate limit — `--workers=4` kamu baru saja menyapa server                                        |
| 500       | Internal Server Error     | Crash yang tidak ditangani — bukan expected result yang valid untuk negative test               |
| 502 / 503 | Bad gateway / unavailable | Masalah environment, bukan assertion logic kamu                                                 |


**400 pada negative test adalah pass** kalau kamu memang mengirim input invalid dan API menolaknya dengan benar. **500 pada test yang sama adalah defect** — server crash dan tidak dapat melakukan validation.

**200 tidak otomatis berarti sukses.** bisa jadi statude code 200 membawa response gagal seperti `{"ok":false,"error":"insufficient stock"}`. Assertion yang hanya mengecek status bisa melewatkan hal ini. Ini adalah misconception utama module dan bentuk HTTP dari [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.2.

**401 vs 403** adalah pemisahan auth/authz. 401: server tidak tahu siapa kamu. 403: server tahu siapa kamu, tetapi kamu tidak punya izin. Hal ini akan dibahas lebih jauh pada [Chapter 4.6](06-api-authentication-and-authorization.md).

### C.8 Membaca DevTools Network

1. Buka DevTools → **Network**.
2. Filter **Fetch/XHR** (sembunyikan image dan CSS).
3. Lakukan satu action (login, add to cart).
4. Klik row request tersebut. Baca secara berurutan: **method**, **status**, **request URL**, **request headers**, **request payload**, **response headers**, **response**, **timing**.

Simpan request dalam bentuk **cURL** (klik kanan → Copy as cURL) untuk assignment. Nanti kamu akan replay request tersebut menggunakan REST client.

### C.11 REST client untuk eksplorasi

Postman, Insomnia, dan `curl` digunakan untuk **mempelajari** sebuah endpoint. Mereka bukan regression suite: sulit direview, sulit di-version, dan sulit dijalankan di CI. Semua hal yang harus dijalankan berulang kali akan menjadi TypeScript di [Chapter 4.4](04-playwright-api-testing-basics.md).

```bash
curl -sS -D - \
  -X POST "https://shop.test/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sku":"LAMP","qty":1}'
```


| Flag      | Arti                                                       |
| --------- | ---------------------------------------------------------- |
| `-X POST` | Method                                                     |
| URL       | Scheme, host, path                                         |
| `-H`      | Header                                                     |
| `-d`      | Body                                                       |
| `-D -`    | Menulis response headers ke stdout                         |
| `-sS`     | Tidak menampilkan progress, tetapi tetap menampilkan error |


---

## D. Konteks QA

### D.1 UI adalah client

Tombol checkout di shop men-trigger `POST /api/orders`. Mengetes endpoint tersebut berarti mengetes contract yang sama yang digunakan UI — lebih cepat, dan tidak perlu rendering. [Chapter 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md) menjadikan observasi ini sebagai strategi.

### D.2 Assertion pertama adalah method dan status — lalu body

Menulis `expect(response.status()).toBe(201)` pada automation test itu perlu, tapi belum cukup. Response Body juga harus di-validasi, dan Header juga harus sesuai. Assertion yang hanya mengecek status adalah salah satu failure mode.

### D.3 Error status code 415 bisa terlihat seperti product bug

`Content-Type` yang hilang adalah **defect di test** sampai kamu membuktikan bahwa API memang salah menangani client yang benar. Cek header dulu sebelum membuat ticket.

### D.4 Header membawa auth

`Authorization` dan `Cookie` adalah cara [Chapter 4.6](06-api-authentication-and-authorization.md) melakukan authentication. Kalau kamu tidak bisa menemukan keduanya di DevTools, kamu belum bisa mengautomasi login.

---

## E. Kesalahan yang Sering Terjadi

### E.1 Path vs query

`/orders/ORD-1` vs `/orders?id=ORD-1`. Keduanya tidak interchangeable ketika kamu menulis assertion untuk URL atau mendesain client.

### E.2 Menganggap semua 4xx sebagai product bug

Negative test memang **mengharapkan 4xx**. Yang mengejutkan adalah 5xx.

### E.3 Menganggap 200 berarti operasi berhasil

Baca body. Lihat C.7.

### E.4 Tidak mengirim `Content-Type` pada POST

415 lalu salah didiagnosis sebagai application defect. Lihat C.5.

### E.5 Mengirim body dengan GET

Request dengan method GET mengabaikan request body, namun dapat diganti dengan menggunakan query string.

### E.6 Menganggap nama header case-sensitive

Nama header tidak case-sensitive.

### E.7 Hanya membaca status

Ada banyak hal yang bisa di-assert di header dan body. Status hanya salah satunya.

### F.8 Menganggap HTTPS = security sudah lengkap

Encryption ≠ authorization.

### F.9 Menganggap PUT dan PATCH sama

Partial PUT bisa menghapus field.

### F.10 Menggunakan Postman sebagai test suite

Postman untuk eksplorasi, bukan CI.

---

## F. Exercise

Total waktu yang disarankan: 100 menit.

### F.1 Easy — Bedah sepuluh URL (20 menit)

Untuk masing-masing URL, tuliskan scheme, host, port (atau default), path, path params, query params, dan fragment. Beri tanda bintang pada setiap bagian yang membawa **data**.

```text
1. https://shop.test/api/products
2. https://shop.test/api/products/LAMP
3. https://shop.test/api/products?q=lamp&limit=10
4. http://localhost:3000/api/orders/ORD-8842
5. https://shop.test/api/orders?status=shipped&limit=20
6. https://shop.test/checkout#payment
7. https://shop.test/api/users/ada%40shop.test
8. https://staging.shop.test:8443/api/cart/items
9. https://shop.test/api/orders/ORD-8842/items/2
10. https://shop.test/api/products?q=lamp#results
```

### F.2 Medium — Method dan status (30 menit)

Untuk dua belas operasi, tentukan: method, expected **success** status, dan **satu status yang akan menjadi bug** (bukan "semua 4xx").

Sertakan: list products; get missing SKU; create order; create order tanpa authentication; create order dengan empty body; delete cart; replace user profile; hanya mengubah email; login dengan password salah; mengambil order milik user lain; search dengan `q=`; cancel order yang sudah dibatalkan.

### F.3 Challenge — Lima annotated capture (50 menit)

Gunakan demo web app, lalu capture di DevTools:

1. Login
2. Product search atau product GET
3. Add to cart
4. Checkout / create order
5. Satu request yang gagal atau menghasilkan 4xx (buat kondisi tersebut terjadi)

Untuk masing-masing: delapan field Network dari C.10, intent client, apa yang **dibuktikan** oleh response, apa yang **tidak dibuktikan**, dan satu hal yang bisa salah beserta bagaimana hal tersebut akan terlihat dari response.

---

## G. Quiz

Sepuluh pertanyaan. Answer key: `[answer-keys/part-4/01-http-fundamentals.answers.md](../answer-keys/part-4/01-http-fundamentals.answers.md)`.

**1.** HTTP bersifat stateless. Artinya:

- A) Server tidak pernah menyimpan data
- B) Setiap request harus membawa hal-hal yang dibutuhkan server (termasuk auth); request sebelumnya tidak dianggap otomatis
- C) Cookie dilarang
- D) Test tidak bisa membuat data

**2.** Dalam `https://shop.test/api/orders/ORD-9?status=open`, `ORD-9` adalah:

- A) Query parameter
- B) Path parameter
- C) Fragment
- D) Header

**3.** Method mana yang safe dan idempotent?

- A) `POST`
- B) `GET`
- C) `PATCH`
- D) `PUT`

**4.** Kenapa retry `POST /api/orders` membuat tester waspada?

- A) POST tidak bisa menggunakan JSON
- B) POST biasanya tidak idempotent — retry bisa membuat order kedua
- C) POST selalu menghasilkan 500
- D) Playwright melarang POST

**5.** Negative test mengirim invalid JSON dan API mengembalikan 400. Hasil tersebut adalah:

- A) Product bug
- B) Expected pass jika API memang menolak input dengan benar
- C) 2xx yang menyamar
- D) Bukti bahwa test bergantung pada urutan

**6.** Invalid JSON yang sama menghasilkan 500. Hasil tersebut adalah:

- A) Tetap pass
- B) Server defect — server crash alih-alih melakukan validation
- C) Redirect
- D) Bukti bahwa HTTPS mati

**7.** `expect(response.status()).toBe(200)` sebagai satu-satunya assertion:

- A) Membuktikan business operation berhasil
- B) Hanya membuktikan statusnya 200; body seperti `{"error":"..."}` tetap akan pass
- C) Dilarang oleh HTTP
- D) Mengecek `Content-Type`

**8.** `Content-Type` yang hilang pada JSON POST sering menghasilkan:

- A) 201
- B) 415
- C) 301
- D) 204

**9.** 401 vs 403:

- A) Keduanya interchangeable
- B) 401 = belum authenticated; 403 = sudah authenticated tetapi tidak diizinkan
- C) 403 = belum authenticated; 401 = tidak diizinkan
- D) Keduanya berarti resource tidak ditemukan

**10.** True atau false: HTTPS pada admin endpoint yang tidak memiliki authentication membuat endpoint tersebut aman.

---

## H. Review

### Konsep penting


| Konsep             | Versi satu kalimat                                      |
| ------------------ | ------------------------------------------------------- |
| Request / response | Method + URL + headers + body → status + headers + body |
| Stateless          | Bawa auth dan context setiap kali                       |
| Path vs query      | Resource yang mana vs bagaimana list-nya dibentuk       |
| Safe / idempotent  | Tidak mengubah state / N kali = sekali                  |
| Headers            | Contract, bukan hiasan                                  |
| 4xx vs 5xx         | Kesalahan kamu vs kesalahan server                      |
| 200                | Sebuah class, bukan verdict                             |
| 401 vs 403         | Siapa kamu vs apa yang boleh kamu lakukan               |
| Cookie vs Bearer   | Dua gaya header untuk pekerjaan yang sama               |
| DevTools           | UI adalah client; baca traffic-nya                      |


### Recap kesalahan

Path/query tertukar · 4xx selalu dianggap bug · 200 dianggap sukses · `Content-Type` hilang · GET body · mitos soal case header · hanya assert status · HTTPS dianggap authorization · PUT=PATCH · Postman dianggap test suite.

### Competency check

> **Diberi pasangan request/response apa pun, apakah kamu bisa menyebutkan setiap bagiannya dan menjelaskan apa yang dibuktikan dan tidak dibuktikan oleh response tersebut?**

Kalau belum, ulangi G.3 dengan dua capture tambahan sebelum lanjut ke [Chapter 4.2](02-rest-api-and-crud.md).

---

[← Part IV Overview](00-module-overview.md) · [Next: 4.2 REST APIs and CRUD →](02-rest-api-and-crud.md)

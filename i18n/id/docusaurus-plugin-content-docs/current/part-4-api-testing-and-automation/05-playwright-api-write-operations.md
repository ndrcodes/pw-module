# Chapter 4.5 — Write Operations: POST, PUT, PATCH, DELETE

🟡 **Intermediate** · [Overview Part IV](00-module-overview.md) · [Table of Contents](../README.md)


|                        |                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Part**               | IV — API Testing dan Automation                                                        |
| **Estimasi waktu**     | 1 sesi (90 menit) + 5 jam belajar mandiri                                              |
| **Chapter prasyarat**  | [4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md)               |
| **Chapter berikutnya** | [4.6 API Authentication and Authorization](06-api-authentication-and-authorization.md) |


---

> Reading is safe. Writing changes the world. This chapter is where [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) stops being a slogan: unique data, cleanup that runs on failure, integrity via a follow-up read.

---



## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu akan bisa:

1. **Mengirim** request POST, PUT, PATCH, dan DELETE dengan JSON body dan header menggunakan `APIRequestContext`.
2. **Melakukan assertion** pada hasil create: status, response body, header `Location`, dan state resource setelah dibuat.
3. **Memverifikasi** integritas data dengan melakukan read setelah setiap write.
4. **Menguji** perbedaan behavior PUT dan PATCH, termasuk kasus field yang hilang karena partial body.
5. **Membuat** negative write test yang mengecek failure sesuai dokumentasi sekaligus memastikan tidak ada side effect.
6. **Membuat** data yang unik untuk setiap test dan **melakukan cleanup** dengan reliable, termasuk saat test gagal.
7. **Menulis** test CRUD lifecycle lengkap yang membuat dan mengelola datanya sendiri.

---



## B. Pengetahuan Prasyarat


| Yang dibutuhkan                                   | Dari                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Fixture `request`, assertion, menjalankan test    | [Chapter 4.4](04-playwright-api-testing-basics.md)                                        |
| Behavior PUT vs PATCH; expected status            | [Chapter 4.2](02-rest-api-and-crud.md)                                                    |
| Design negative test dan integrity test           | [Chapter 4.3](03-designing-api-test-cases.md)                                             |
| Independence, isolation, dan cleanup saat failure | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| `async`/`await`, `Promise.all`                    | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md)         |


---



## C. Penjelasan Konsep



### C.1 Method untuk write

```ts
await request.post("/api/products", { data: body, headers });
await request.put(`/api/products/${sku}`, { data: full });
await request.patch(`/api/products/${sku}`, { data: partial });
await request.delete(`/api/products/${sku}`);
```

`data` akan di-serialize sebagai JSON dan Playwright akan mengatur `Content-Type: application/json`. Gunakan `form` atau `multipart` hanya untuk endpoint form/upload ([Chapter 4.1](01-http-fundamentals.md) C.6). Jangan mengirim `data` pada GET.

Kalau kamu mengatur `Content-Type` sendiri dan nilainya tidak sesuai dengan `data`, kamu bisa mendapatkan lagi error 415 seperti di Demo 2. Lebih baik gunakan `data` dan biarkan Playwright mengatur header-nya, kecuali memang sedang *testing* 415.

### C.2 Create itu bukan cuma satu check

```ts
const sku = `LAMP-${crypto.randomUUID()}`;
const create = await request.post("/api/products", {
  data: { sku, title: "Aeron Lamp", price: 49.5, active: true },
});
expect(create.status(), "product should be created").toBe(201);

const created: unknown = await create.json();
const body = created as { id?: string; sku?: string };
expect(body.sku).toBe(sku);

const location = create.headers()["location"];
if (location) {
  expect(location).toContain(sku);
}

const read = await request.get(`/api/products/${sku}`);
expect(read.status(), "created product should be readable").toBe(200);
const stored = (await read.json()) as { title: string; price: number };
expect(stored.title).toBe("Aeron Lamp");
expect(stored.price).toBe(49.5);
```

Response 201 yang ternyata tidak menyimpan apa-apa, atau menyimpan harga yang berbeda, berarti API-nya terlihat sukses padahal sebenarnya bermasalah. Hanya follow-up GET yang bisa menemukan masalah ini ([Chapter 4.3](03-designing-api-test-cases.md) C.7).

### C.3 PUT vs PATCH dalam test

```ts
// Arrange: full product exists (you created it)
await request.put(`/api/products/${sku}`, { data: { title: "Renamed" } });
const afterPut = await request.get(`/api/products/${sku}`);
const putBody = (await afterPut.json()) as Record<string, unknown>;
// If price is missing/null — field-erasure defect (Chapter 4.2 C.6)

await request.patch(`/api/products/${sku}`, { data: { title: "Renamed again" } });
const afterPatch = (await (await request.get(`/api/products/${sku}`)).json()) as {
  title: string;
  price: number;
};
expect(afterPatch.title).toBe("Renamed again");
expect(afterPatch.price).toBe(49.5);
```

Kalau PUT memang *seharusnya* menolak partial body dengan 400, itu justru pass — assert 400 dan pastikan hasil GET tidak berubah. Tugas test adalah **membuktikan behavior yang benar**, bukan memaksa PUT berperilaku seperti PATCH.

### C.4 Delete

```ts
const del = await request.delete(`/api/products/${sku}`);
expect([200, 204]).toContain(del.status()); // match *your* contract; prefer exact
const gone = await request.get(`/api/products/${sku}`);
expect(gone.status()).toBe(404);

const delAgain = await request.delete(`/api/products/${sku}`);
expect([204, 404]).toContain(delAgain.status()); // documented one
```

Setelah contract-nya sudah jelas, lebih baik gunakan `expect(del.status()).toBe(204)`. Bentuk array hanya boleh jadi solusi sementara karena bisa menyembunyikan perubahan behavior API — nanti harus diperketat.

### C.5 Negative write + tidak ada side effect

```ts
const before = await listSkus(request);
const reject = await request.post("/api/products", {
  data: { sku: `BAD-${id()}`, title: "x", price: -1 },
});
expect(reject.status()).toBe(400);
const after = await listSkus(request);
expect(after).toEqual(before);
```

Alternatifnya, GET SKU yang seharusnya dibuat lalu expect 404. API yang mengembalikan 400 tapi tetap melakukan insert adalah defect yang sering terlewat oleh pemula.

Untuk malformed JSON, kirim `text` / raw body jika memang perlu, atau string yang bukan object. Satu test sebaiknya hanya melanggar satu rule.

### C.6 Data harus unik


| Strategy  | Contoh                         | Catatan                                                        |
| --------- | ------------------------------ | -------------------------------------------------------------- |
| UUID      | `LAMP-${crypto.randomUUID()}`  | Pilihan default terbaik; kemungkinan collision ~0              |
| Timestamp | `user-${Date.now()}@shop.test` | Bisa collision kalau dua worker memakai millisecond yang sama  |
| Counter   | `++n`                          | Bisa collision antar-worker karena berjalan di process berbeda |
| Hardcoded | `"Test Product"`               | **Pasti** berpotensi collision — Demo 3 dari 3.1               |


Saat failure, log ID yang dibuat (`console.log` atau masukkan ke message `expect`) supaya flaky test bisa direproduce. Factory di [Chapter 4.8](08-api-test-data-and-environments.md) nantinya akan merapikan pola ini.

### C.7 Cleanup yang selalu jalan

```ts
test("create then …", async ({ request }) => {
  const sku = `LAMP-${crypto.randomUUID()}`;
  const created: string[] = [];

  try {
    await request.post("/api/products", { data: { sku, title: "T", price: 1, active: true } });
    created.push(sku);
    expect(true, "forced mid-test failure demo").toBe(false);
  } finally {
    await Promise.all(
      created.map((id) => request.delete(`/api/products/${id}`).catch(() => {})),
    );
  }
});
```

Lebih baik: simpan ID yang dibuat dan lakukan cleanup lewat `test.afterEach` dengan helper kecil. Rules-nya:

1. Teardown tetap jalan saat failure (`finally` / `afterEach` / nantinya fixtures).
2. Delete terhadap record yang sudah tidak ada **tidak boleh membuat test gagal** (204/404 sama-sama boleh; network error hanya boleh di-ignore khusus saat cleanup).
3. Cleanup harus idempotent — aman kalau dijalankan dua kali.

Cleanup yang ditaruh di **bagian paling bawah test body** akan terlewat kalau `expect` melempar error. Itu yang ditunjukkan di Demo 6.

Jangan DELETE product yang bukan dibuat oleh test tersebut. Jangan juga memakai satu record yang sama untuk test create/update/delete — itu membuat test bergantung pada urutan eksekusi.

### C.8 CRUD lifecycle: satu test vs beberapa test

Test **lifecycle** (create → read → put/patch → delete → gone) membuktikan semua operasi tersebut bisa bekerja bersama. Karena ada banyak titik yang bisa gagal, gunakan test ini sebagai smoke test. Tetap buat test yang **focused** untuk kasus seperti PUT erasure, negative quantity, dan sebagainya. ([Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.6).

Setiap focused test tetap harus membuat product **sendiri**. Memakai sisa data dari lifecycle test berarti membuat coupling antar-test.

### C.9 `Promise.all` untuk write

Create yang independent bisa pakai `Promise.all([createA, createB])`. Kalau dependent, misalnya create user lalu create order yang membutuhkan `user.id`, jalankan secara **sequential** ([Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) C.8). Write secara paralel ke **cart yang sama** justru menjadi race condition, bukan optimasi.

---



## D. Konteks QA



### D.1 Parallelism

Jalankan dengan `--workers=4` bersamaan dengan suite milik colleague: `"Test Product"` yang hardcoded akan mulai bermasalah. SKU yang unik + teardown adalah cara supaya [Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) tetap boring dan predictable.

### D.2 Helper hari ini akan jadi factory besok

`createProduct(request, overrides)` nantinya akan berkembang menjadi [Chapter 6.4](../part-6-framework-engineering/04-test-data-management.md). Dari sekarang, buat sebagai function yang **me-return** entity yang dibuat, bukan sekadar `console.log`. Buat function yang general dan bisa digunakan dalam hal-hal yang berbeda tapi masih dalam satu konteks.

### D.3 UI test nantinya akan memakai ini

Di Part V, sebaiknya seed cart lewat API daripada harus klik-klik catalogue lewat UI. Record yang tertinggal di shared staging adalah masalah serius: environment jadi makin berat dan datanya bisa bentrok dengan orang lain.

---



## E. Contoh Kode



### E.1 Sangat sederhana — POST + status

```ts
const sku = `LAMP-${crypto.randomUUID()}`;
const res = await request.post("/api/products", {
  data: { sku, title: "Lamp", price: 10, active: true },
});
expect(res.status()).toBe(201);
```

Ini belum lengkap — tambahkan GET dan teardown sebelum menganggap test-nya selesai.

### E.2 Praktis — Location + read-back

Lihat C.2. Sertakan delete di dalam `finally`.

### E.3 QA-oriented — erasure + negative

Satu test: PUT partial, GET, lalu dokumentasikan behavior yang benar-benar terjadi.
Satu test: POST dengan price tidak valid, lalu GET dan pastikan list tidak berubah.

### E.4 Automation-oriented — lifecycle + teardown

```ts
test("product CRUD lifecycle owns its sku", async ({ request }) => {
  const sku = `LAMP-${crypto.randomUUID()}`;
  try {
    expect((await request.post("/api/products", { data: { sku, title: "A", price: 10, active: true } })).status()).toBe(201);
    expect((await request.get(`/api/products/${sku}`)).status()).toBe(200);
    expect((await request.patch(`/api/products/${sku}`, { data: { title: "B" } })).status()).toBe(200);
    expect(((await (await request.get(`/api/products/${sku}`)).json()) as { title: string }).title).toBe("B");
    expect((await request.delete(`/api/products/${sku}`)).status()).toBe(204);
    expect((await request.get(`/api/products/${sku}`)).status()).toBe(404);
  } finally {
    await request.delete(`/api/products/${sku}`).catch(() => {});
  }
});
```

Sengaja buat failure setelah POST (misalnya expect title yang salah), lalu buktikan bahwa `finally` tetap melakukan delete (GET 404 setelahnya lewat scratch script atau log dari afterEach).

---



## F. Kesalahan yang Sering Terjadi



### F.1 Menganggap create cukup dengan 201



### F.2 Tidak melakukan follow-up GET



### F.3 `"Test Product"` / `user1@test.com` yang hardcoded



### F.4 Cleanup ditaruh di bagian paling bawah test body



### F.5 Cleanup gagal karena 404 dan membuat test yang seharusnya green jadi gagal



### F.6 Test 2 meng-update data yang dibuat test 1



### F.7 Negative test tanpa mengecek list/GET tetap tidak berubah



### F.8 Partial PUT tidak terdeteksi



### F.9 Memakai `Promise.all` untuk user-then-order



### F.10 Satu record dipakai bersama untuk seluruh CRUD file

---



## G. Exercise

Estimasi total waktu: 110 menit.

### G.1 Easy — Create + GET (20 menit)

SKU unik, 201, body, read-back, dan `finally` delete.

### G.2 Medium — PUT, PATCH, DELETE (40 menit)

Buktikan perbedaan behavior. Delete + cek bahwa resource sudah tidak ada. Uji repeat-delete sesuai contract.

### G.3 Challenge — Enam negative + cleanup saat failure (50 menit)

Enam reject case, masing-masing dengan side-effect check. Setelah itu, sengaja buat failure setelah create dan buktikan data sisa benar-benar hilang (lewat run kedua atau GET langsung).

---



## H. Coding Assignment



### Assignment 4.5 — CRUD Lifecycle Suite

**Objective.** Tulis setengah bagian write dari specification 4.3 untuk **satu** resource (products atau cart items).


| #   | Requirement                                                                                   |
| --- | --------------------------------------------------------------------------------------------- |
| 1   | Create, read-back, PUT, PATCH, delete, lalu verifikasi resource sudah tidak ada               |
| 2   | Minimal lima negative test dengan side-effect check                                           |
| 3   | Data unik di setiap test                                                                      |
| 4   | Teardown selalu jalan; cleanup aman terhadap 404                                              |
| 5   | Lulus dengan `--workers=4` dan saat dijalankan terbalik / satu test dengan `--grep`           |
| 6   | `PROOF.md`: failure di tengah test tetap melakukan cleanup; sertakan satu observasi PUT/PATCH |
| 7   | Tidak ada ID hardcoded yang diambil dari database                                             |


**Cara penilaiannya.**


| Aspek     | Bobot | Full marks                                   |
| --------- | ----- | -------------------------------------------- |
| Integrity | 25%   | GET setelah setiap write; reject path bersih |
| Isolation | 25%   | Workers + data unik                          |
| Semantics | 20%   | PUT vs PATCH terbukti                        |
| Cleanup   | 20%   | Failure path punya bukti                     |
| Negatives | 10%   | Lima test dengan status yang spesifik        |


> **Penggunaan AI: terbatas.**

---



## I. Quiz

Sepuluh pertanyaan. Kunci jawaban: `[answer-keys/part-4/05-playwright-api-write-operations.answers.md](../answer-keys/part-4/05-playwright-api-write-operations.answers.md)`.

**1.** Response 201 tanpa follow-up GET tidak bisa mendeteksi:

- A) `Content-Type` request yang salah
- B) API yang mengaku berhasil create tapi tidak menyimpan apa-apa (atau menyimpan field yang salah)
- C) `await` yang hilang
- D) Pagination

**2.** Cleanup yang ditaruh di baris terakhir test body akan terlewat ketika:

- A) Test berhasil
- B) `expect` sebelumnya melempar error
- C) Worker berjumlah 1
- D) Kamu menggunakan `data`

**3.** Dua test melakukan POST `{ title: "Test Product" }` dengan `--workers=4`. Kemungkinan hasilnya:

- A) Selalu aman
- B) Collision (409 atau row tertimpa) — tidak isolated
- C) Playwright menolak POST
- D) 415

**4.** Partial body pada PUT yang menerapkan semantics replace biasanya:

- A) Merge
- B) Bisa menghapus field yang tidak dikirim
- C) Menjadi GET
- D) Selalu 201

**5.** Setelah create menghasilkan 400, kamu juga harus:

- A) Retry sampai 201
- B) Buktikan tidak ada resource baru yang dibuat
- C) Assert `ok()`
- D) Sleep 5 detik

**6.** Cleanup `delete` menghasilkan 404 karena resource sudah di-delete oleh test. Cleanup seharusnya:

- A) Membuat test gagal
- B) Anggap 404 sebagai success / ignore
- C) Buat ulang resource
- D) Panggil `waitForTimeout`

**7.** `Promise.all([createUser(), createOrder(userId)])` ketika `userId` berasal dari proses create user adalah:

- A) Concurrency yang benar
- B) Salah — urutannya bergantung pada user ID
- C) Wajib dalam REST
- D) Sebuah DELETE

**8.** True atau false: Satu product yang dibuat di `beforeAll` lalu dipakai ulang untuk test create, update, dan delete adalah optimasi yang bagus untuk mempercepat test.

**9.** Header `Location` setelah POST berguna karena:

- A) Menggantikan body
- B) Itu bagian dari contract create — URL tersebut bisa di-GET
- C) Itu token
- D) Wajib untuk GET list

**10.** Lakukan `DELETE` lagi pada ID yang sama. Kamu seharusnya:

- A) Asumsikan 500
- B) Assert status untuk call kedua sesuai dokumentasi (seringnya 204 atau 404)
- C) Skip call kedua
- D) Gunakan GET untuk delete

---



## J. Review



### Competency Check

> **Kalau suite kamu berjalan lalu gagal di tengah jalan, apakah environment masih sebersih sebelum test dimulai?**

Kalau tidak, berarti teardown kamu belum benar.

---

[← 4.4 Playwright API Testing Basics](04-playwright-api-testing-basics.md) · [Next: 4.6 API Authentication and Authorization →](06-api-authentication-and-authorization.md)

# Chapter 4.4 — Dasar-Dasar API Testing dengan Playwright

🟡 **Intermediate** · [Overview Part IV](00-module-overview.md) · [Table of Contents](../README.md)


|                        |                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Part**               | IV — API Testing dan Automation                                                                                                                 |
| **Estimasi waktu**     | 1 sesi (90 menit) + 5 jam belajar mandiri                                                                                                       |
| **Chapter prasyarat**  | [4.3 Designing API Test Cases](03-designing-api-test-cases.md), [2.12 Async](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| **Chapter berikutnya** | [4.5 Write Operations](05-playwright-api-write-operations.md)                                                                                   |


---

> **Chapter automation pertama di course ini.** Di sini kita akan install Playwright dan mulai menulis test yang benar-benar berkomunikasi dengan API.
>
> Kalau bug hunt di [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md)masih terasa belum nyaman, ulangi dulu sebelum mulai menulis kode di sini. Setiap call mengembalikan Promise.

---



## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu akan bisa:

1. **Setup** project Playwright Test dan **menjelaskan** fungsi setiap file yang dibuat.
2. **Menulis** API test menggunakan fixture `request`, dan **menjelaskan** apa yang disediakan oleh `APIRequestContext`.
3. **Mengirim** request GET dengan query parameter dan header, lalu **membaca** status, header, dan body yang sudah di-parse.
4. **Melakukan assertion** terhadap status code, field pada body, header, dan isi array menggunakan `expect`.
5. **Menjalankan** test tertentu, secara paralel, dan dengan reporter, baik dari CLI maupun VS Code.
6. **Mendiagnosis** gejala ketika `await` terlewat dalam API test.
7. **Menyusun** file spec menggunakan `test.describe`, hooks, dan nama test yang menjelaskan behavior yang diharapkan.

---



## B. Preconditions


| Yang dibutuhkan                          | Dari                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `async`**/**`await` **dan Promise**      | [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| Object, nested access, optional chaining | [Chapter 2.9](../part-2-programming-fundamentals/09-objects.md)                   |
| Type dan interface                       | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md)  |
| Parsing JSON dan batas penggunaan `any`  | [Chapter 2.13](../part-2-programming-fundamentals/13-json.md)                     |
| HTTP method, header, status code         | [Chapter 4.1](01-http-fundamentals.md)                                            |
| Test matrix untuk endpoint yang nyata    | [Chapter 4.3](03-designing-api-test-cases.md)                                     |


---



## C. Penjelasan Konsep



### C.1 Apa yang disediakan Playwright Test

Playwright Test adalah test runner yang sudah menyediakan banyak hal: mencari file `*.spec.ts`, menjalankan test di **workers**, menyediakan `expect`, membuat **HTML report**, dan — yang kita butuhkan di sini — memberikan setiap test sebuah `APIRequestContext` lewat built-in `request` **fixture**. Kita tidak perlu install Axios. API test juga tetap berada di project, bahasa pemrograman, dan CI job yang sama dengan browser test di Part V.

```ts
import { test, expect } from "@playwright/test";

test("GET /api/products returns a JSON array", async ({ request }) => {
  const response = await request.get("/api/products");

  expect(response.status(), "catalogue should be readable").toBe(200);
  const products: unknown = await response.json();
  expect(Array.isArray(products)).toBe(true);
});
```

Ada tiga hal penting dari snippet tersebut:

1. `{ request }` adalah fixture destructuring. Kita cukup mendeklarasikan apa yang dibutuhkan test, lalu Playwright yang menyediakannya. Nanti kamu akan membuat fixture sendiri di [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md).
2. **Setiap call harus di-**`await`**.** Kalau `await` pada `get` dihilangkan, `response` masih berupa Promise — dan Promise itu truthy. Akibatnya test bisa saja pass padahal sebenarnya tidak memverifikasi apa-apa.
3. **Assertion mengikuti matrix dari 4.3.** Hanya mengecek status itu belum cukup; kita juga perlu mengecek body.



### C.2 `npm init playwright@latest`

Generator akan menanyakan TypeScript, folder test, GitHub Actions, dan browser. Untuk chapter ini, kita cukup butuh TypeScript dan test folder. Kalau fokusnya hanya API, browser tambahan bisa di-skip karena `request` tidak membutuhkan Chromium. Kamu tetap boleh menyimpan satu browser project untuk kebutuhan selanjutnya.


| File                    | Fungsi                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| `playwright.config.ts`  | `baseURL`, timeout, reporter, worker, project                            |
| `tests/example.spec.ts` | Hapus file ini; jangan menganggap sample UI test sebagai contoh API test |
| `package.json`          | Script untuk `npx playwright test`                                       |
| `.gitignore`            | Harus meng-ignore `test-results/`, `playwright-report/`, `.env`          |




### C.3 Config penting untuk API testing

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // prefer 0 while learning; never hide races
  workers: 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "on-first-retry",
  },
});
```

`baseURL` berarti kita bisa memakai `request.get("/api/products")` tanpa menulis host secara hardcode. Hardcoded URL akan bermasalah di [Chapter 4.8](08-api-test-data-and-environments.md) and Project 3 T4.

Timeout: API test idealnya selesai dalam hitungan detik. Default 30 detik sudah cukup; jangan menaikkan timeout hanya untuk menutupi request yang hang.

### C.4 Spec, `describe`, dan penamaan

```ts
test.describe("GET /api/products", () => {
  test("returns a JSON array of products with sku and title", async ({ request }) => {
    // ...
  });

  test("returns 404 for an unknown sku", async ({ request }) => {
    // ...
  });
});
```

Nama test harus menjelaskan **behavior yang diharapkan**, bukan sekadar `"test GET products"`. HTML report pada akhirnya juga berfungsi seperti specification.

### C.5 `request.get` — query dan header

```ts
const response = await request.get("/api/products", {
  params: { q: "lamp", limit: 10 },
  headers: { "X-Request-Id": "t-0044" },
});
```

`params` akan menjadi query string. `headers` yang didefinisikan per request akan digabung dengan `extraHTTPHeaders`.

### C.6 Response object


| Method      | Return                   | Penggunaan                                           |
| ----------- | ------------------------ | ---------------------------------------------------- |
| `status()`  | `number`                 | **Selalu** assert status code yang spesifik          |
| `ok()`      | `boolean` (2xx)          | Kurang kuat kalau dipakai sebagai satu-satunya check |
| `headers()` | `Record<string, string>` | `content-type`, `location`                           |
| `json()`    | `Promise<any>`           | Parse JSON; assign hasilnya lewat `unknown`          |
| `text()`    | `Promise<string>`        | Untuk response non-JSON atau debugging               |
| `body()`    | `Promise<Buffer>`        | Data binary                                          |


```ts
const raw: unknown = await response.json();
```

`as Product[]` adalah sebuah klaim ([Chapter 2.13](../part-2-programming-fundamentals/13-json.md)). Untuk sekarang, lakukan spot-check pada field yang memang penting. Runtime schema akan dibahas di Project 3 / 4.7.

### C.7 Matcher `expect` yang akan sering kamu pakai

```ts
expect(response.status()).toBe(200);
expect(response.headers()["content-type"]).toMatch(/application\/json/);
expect(body).toMatchObject({ sku: "LAMP", price: 49.5 });
expect(skus).toContain("LAMP");
expect(items).toHaveLength(10);
expect(body.id).toMatch(/^ORD-\d{6}$/);
```

Gunakan message yang jelas, misalnya `expect(response.status(), "catalogue should be readable").toBe(200)`. Saat gagal, kita bisa langsung tahu masalahnya tanpa harus membuka spec ([Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.6).

### C.8 Menjalankan test

```bash
npx playwright test
npx playwright test tests/api/products.spec.ts
npx playwright test --grep "unknown sku"
npx playwright test --workers=4
npx playwright test --reporter=html
npx playwright show-report
```

Playwright extension di VS Code memungkinkan kita menjalankan satu test, melakukan debug, dan melihat error langsung di editor. Biasakan loop: **write → run → baca failure → fix**. Kemampuan mengikuti loop ini lebih penting daripada menghafal satu matcher tertentu.

### C.9 `await` yang hilang

```ts
test("get products — cannot fail", async ({ request }) => {
  const response = request.get("/api/products"); // no await
  expect(response).toBeTruthy();                 // Promise is truthy
});
```


| Yang terlewat                             | Gejala                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `await` pada `get`                        | Yang kamu punya masih Promise; `.status` bukan HTTP status                                      |
| `await` pada `json()`                     | Kamu melakukan assertion terhadap Promise; pengecekan field jadi tidak masuk akal atau terlewat |
| `await` pada async expect berikutnya (UI) | Preview untuk Part V; hasilnya bisa false-green yang sama                                       |


Ini adalah versi production dari konsep di [Chapter 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) C.5 in production form.

### C.10 Hooks — trade-off-nya masih sama seperti 3.1

```ts
test.beforeEach(async ({ request }) => {
  // cheap, no shared mutable record
});

test.beforeAll(async ({ request }) => {
  // only immutable reference data you will not edit
});
```

Jangan menyimpan `let productId` di level file hanya supaya test 2 bisa menggunakannya. [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) C.3–C.7 masih berlaku. Variable di level module adalah shared state.

### C.11 Sengaja bikin test gagal

Ubah expected status menjadi `201` pada GET, atau arahkan `baseURL` ke path yang menghasilkan 404. Lihat sampai test menjadi **red**. Setelah itu kembalikan seperti semula. Kalau kamu belum pernah melihat test gagal, berarti kamu belum benar-benar memahami test tersebut. Ini wajib dibuktikan di assignment.

Jangan membungkus `request.get` dengan `try/catch` hanya supaya "aman". Error 500 yang tertelan justru bisa membuat test terlihat green ([Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md)).

---



## D. Konteks QA



### D.1 Matrix → spec file

Row read-endpoint dari 4.3 akan menjadi test di `products.spec.ts`. Nama test sebaiknya mengikuti ID di matrix supaya reviewer bisa menelusurinya dengan mudah.

### D.2 Satu runner untuk API dan UI

Same `expect`, same report, same CI job. [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md) will share fixtures across both. You are not building a second framework.

### D.3 Kecepatan mengubah ritme kerja

Satu API call bisa sekitar 200ms, dibanding browser flow yang bisa 8 detik. Test API akan kamu jalankan ratusan kali. Itu alasan Part IV dipelajari lebih dulu ([module overview](00-module-overview.md)).

### D.4 Bukti red mulai dari sini

Di setiap assignment, sertakan output saat kamu sengaja merusak behavior dan test benar-benar gagal. Ini yang pertama kali akan dicek oleh grader.

---



## E. Contoh Kode



### E.1 Sangat sederhana — CLI green

```ts
test("catalogue is reachable", async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
});
```

```bash
npx playwright test tests/api/products.spec.ts
```



### E.2 Praktis — query, header, body

```ts
test("search q=lamp returns only matching skus or titles", async ({ request }) => {
  const response = await request.get("/api/products", {
    params: { q: "lamp", limit: 20 },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/json/);

  const products = (await response.json()) as unknown;
  expect(Array.isArray(products)).toBe(true);
  const list = products as { sku: string; title: string }[];
  for (const p of list) {
    const hay = `${p.sku} ${p.title}`.toLowerCase();
    expect(hay, `unexpected product ${p.sku}`).toContain("lamp");
  }
});
```

If the API returns `{ items: [] }`, assert on `items` — **the wire wins**.

### E.3 QA-oriented — empat row dari matrix

1. 200 + array (or `items`)
2. `content-type` JSON
3. Filter/query
4. Unknown sku → 404

Setiap test harus independent. Jangan menggunakan `let` yang dibagi antar-test.

### E.4 Automation-oriented — false green

```ts
// broken
const response = request.get("/api/products");
expect(response).toBeTruthy();

// fixed
const response = await request.get("/api/products");
expect(response.status()).toBe(200);
```

Jalankan keduanya. Screenshot hasil green yang menipu dan hasil assertion yang benar.

---



## F. Kesalahan yang Sering Terjadi

### F.1 Lupa `await` pada get, json, atau expect

### F.2 Hanya menggunakan `ok()`

### F.3 Melakukan assertion pada Response object seolah-olah itu body (`expect(response).toEqual({...})`)

### F.4 Hardcoded `http://localhost:3000/api/...`

### F.5 Nama seperti `"test GET"`

### F.6 `let id` di level module

### F.7 `try/catch` di sekitar request

### F.8 Tidak pernah melihat test menjadi red

### F.9 Menggunakan `as Product[]` tanpa mengecek field

### F.10 Meng-commit `playwright-report/` atau `.env`

---

## G. Exercise

Estimasi total waktu: 100 menit.

### G.1 Easy — Setup + satu GET (25 menit)

Init Playwright. Buat satu test dengan **tiga** assertion yang meaningful (status, content-type, body shape). Hapus example spec.

### G.2 Medium — Enam read test (40 menit)

Status, field pada body, header, isi array, query filter, dan not-found. Ambil dari read matrix di 4.3.

### G.3 Challenge — Dua test yang tidak bisa gagal (35 menit)

Buat lima test yang semuanya pass; dua di antaranya sengaja dibuat tidak bisa gagal (missing await dan/atau hanya `ok()`). Buktikan dengan merusak API (path salah, atau mock kalau kamu punya). Perbaiki kembali. Lampirkan output saat test red.

---



## H. Coding Assignment



### Assignment 4.4 — API Test Suite Pertama

**Objective.** Implement bagian **read** dari specification 4.3 kamu: minimal **delapan** test.

**Deliverable.** Spec di `tests/api/`, `playwright.config.ts` dengan `baseURL`, dan `PROOF.md` berisi bukti test red.


| #   | Requirement                                                                                       |
| --- | ------------------------------------------------------------------------------------------------- |
| 1   | Delapan test: status, body, header, filter, pagination atau list shape, not-found                 |
| 2   | Nama yang menjelaskan behavior; `test.describe`                                                   |
| 3   | Tidak ada shared mutable state                                                                    |
| 4   | Tidak ada host yang di-hardcode                                                                   |
| 5   | Gunakan `unknown` (atau field yang sudah divalidasi) setelah `json()` — jangan gunakan bare `any` |
| 6   | `PROOF.md`: untuk setiap test, jelaskan apa yang sengaja dirusak dan sertakan snippet saat red    |
| 7   | Lulus saat dijalankan dengan `--workers=4`                                                        |
| 8   | Tidak menggunakan `waitForTimeout`, dan tidak ada `try/catch` yang menelan error                  |


**Cara penilaiannya.**


| Aspek          | Bobot | Full marks                                          |
| -------------- | ----- | --------------------------------------------------- |
| Assertions     | 30%   | Kuat dan sesuai matrix                              |
| Independence   | 20%   | Bisa dijalankan dengan workers + `--grep` satu test |
| Break-it proof | 30%   | Ada bukti red untuk setiap test                     |
| Craft          | 20%   | Config, penamaan, tanpa `any`                       |


> **Penggunaan AI: terbatas.** AI boleh membantu menjelaskan error Playwright. AI tidak boleh menulis delapan test tersebut.

---



## I. Quiz

Sepuluh pertanyaan. Kunci jawaban: `[answer-keys/part-4/04-playwright-api-testing-basics.answers.md](../answer-keys/part-4/04-playwright-api-testing-basics.answers.md)`.

**1.** `{ request }` di test callback adalah:

- A) Global variable
- B) Fixture destructuring — Playwright meng-inject `APIRequestContext`
- C) Module `http` milik Node
- D) Page object

**2.** `const response = request.get("/api/products"); expect(response).toBeTruthy();` biasanya:

- A) Melakukan assertion HTTP 200
- B) Pass karena Promise itu truthy — bisa jadi tidak memverifikasi apa-apa
- C) Selalu gagal
- D) Mengirim POST

**3.** `response.ok()` bernilai true untuk:

- A) Hanya 200
- B) Semua status 2xx
- C) 401
- D) Network failure

**4.** `request.get("/api/products")` dengan relative URL membutuhkan:

- A) Browser
- B) `use.baseURL` di config (atau full URL, yang dilarang oleh course ini di dalam test)
- C) `waitForTimeout`
- D) Login di `beforeAll`

**5.** `await response.json()` menurut type dari Playwright adalah:

- A) Otomatis menjadi interface milikmu
- B) `any` — perlakukan sebagai `unknown` dan lakukan pengecekan
- C) `string`
- D) `never`

**6.** `--grep "unknown sku"` :

- A) Menghapus test
- B) Menjalankan test yang judulnya cocok
- C) Mengatur `baseURL`
- D) Mengaktifkan retry

**7.** True atau false: Membungkus `request.get` dengan `try/catch` lalu return adalah cara yang baik untuk menangani 500.

**8.** `let lastSku` di level module yang ditulis oleh test 1 lalu dibaca oleh test 2 melanggar:

- A) `baseURL`
- B) Independence
- C) JSON
- D) HTML reporting

**9.** Hal pertama yang dilakukan setelah test berhasil green adalah:

- A) Tambahkan retry
- B) Sengaja rusak behavior dan pastikan test menjadi red
- C) Commit `.env`
- D) Copy test sepuluh kali

**10.** `expect(response).toEqual({ sku: "LAMP" })` salah karena:

- A) LAMP bukan SKU
- B) `response` adalah HTTP response object, bukan parsed body
- C) `toEqual` dilarang
- D) GET tidak bisa mengembalikan JSON

---



## J. Review



### Konsep Utama


| Konsep                     | Versi satu kalimat                                 |
| -------------------------- | -------------------------------------------------- |
| `request` fixture          | `APIRequestContext` yang di-inject oleh Playwright |
| `baseURL`                  | Host disimpan di config                            |
| `await`                    | Setiap get/json                                    |
| `status()`                 | Cek code yang spesifik, jangan hanya `ok()`        |
| `json()` sebagai `unknown` | Cast ≠ check                                       |
| Break-it                   | Bukti yang wajib disertakan                        |
| Names                      | Behavior yang diharapkan                           |




### Competency Check

> **Bisa nggak kamu menulis test, sengaja merusak API, melihat test menjadi red karena alasan yang tepat, lalu memperbaikinya sampai green lagi?**

Loop inilah yang akan terus dipakai sepanjang sisa course.

---

[← 4.3 Designing API Test Cases](03-designing-api-test-cases.md) · [Next: 4.5 Write Operations →](05-playwright-api-write-operations.md)

# Chapter 4.7 — Reusable API Client dan Model

🔴 **Advanced** · [Part IV Overview](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing and Automation |
| **Estimasi waktu** | 1 sesi (90 menit) + 6 jam belajar mandiri |
| **Chapter prasyarat** | [4.5](05-playwright-api-write-operations.md), [4.6](06-api-authentication-and-authorization.md) |
| **Chapter berikutnya** | [4.8 API Test Data and Environment Configuration](08-api-test-data-and-environments.md) |

---

> **Chapter ini fokusnya refactor code kamu sendiri.** Bawa test yang masih banyak duplikasinya dari 4.4–4.6. Materi ini memang nggak akan terlalu berguna kalau pakai contoh code orang lain.
>
> **Client tahu cara memanggil API. Test tahu behavior apa yang seharusnya benar.** Ini hal pertama yang akan dicek oleh grader.

---

## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu akan bisa:

1. **Mengidentifikasi** duplication dan coupling di raw API test suite, lalu **mengukur** biaya maintenance-nya.
2. **Mendesain** typed API client yang method-nya menggambarkan operasi yang ingin dilakukan, bukan detail HTTP-nya.
3. **Mendefinisikan** request dan response model, serta **menjelaskan** bagaimana model tersebut bisa menjadi dokumentasi untuk system under test.
4. **Merefaktor** suite yang sudah ada supaya menggunakan client dan model tanpa mengubah behavior yang diverifikasi.
5. **Menjelaskan** dan **menerapkan** rule bahwa client tahu cara memanggil API, sedangkan test tahu apa yang seharusnya benar.
6. **Menentukan** apa yang sebaiknya dikembalikan oleh sebuah client method — raw response, parsed body, atau typed model — dan **menjelaskan alasannya**.
7. **Menggabungkan** beberapa client ke dalam service layer untuk workflow yang terdiri dari beberapa langkah.

---

## B. Pengetahuan Prasyarat

| Required | From |
|---|---|
| Write operations and cleanup | [Chapter 4.5](05-playwright-api-write-operations.md) |
| Authentication and token reuse | [Chapter 4.6](06-api-authentication-and-authorization.md) |
| Interfaces, generics, `Partial` | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |
| Layered architecture | [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) |
| Custom errors | [Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md) |
| **Your own tests from 4.4–4.6** | Required input |

---

## C. Penjelasan Konsep

### C.1 Ukur dulu biayanya

Demo 8: coba rename `product.title` → `product.name` di API (atau di fixture kamu). Hitung berapa file yang harus diubah. Setelah refactor, rename yang sama cukup menyentuh **model** dan **client**. Angka itulah yang menunjukkan manfaat refactor.

Duplication di sini bukan cuma masalah style. Setiap header, path, dan nama field yang dicopy sampai lima belas kali adalah biaya maintenance yang nyata.

### C.2 Client vs test

| | Client | Test |
|---|---|---|
| Knows | Paths, methods, headers, parse | What should be true |
| Names | `products.create(input)` | `creating a product returns 201 and a sku` |
| Contains | `request.post` | `expect` |
| Must not | `expect(status).toBe(201)` | Raw `request.post("/api/...")` after this chapter |

Assertion di dalam `create()` membuat **negative test** jadi bermasalah — client bisa throw atau fail sebelum test sempat bilang, "memang kita mengharapkan 400." [Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.5; [Chapter 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) flags this in review.

### C.3 Nama operasi, bukan nama HTTP verb

```ts
// weak names
postProduct()
getProductById()

// operations
create(input: NewProduct)
get(sku: string)
list(query?: ProductQuery)
replace(sku: string, input: Product)
update(sku: string, input: Partial<Product>)
delete(sku: string)
```

`postProduct` masih membuat kita berpikir dalam konteks HTTP. Sementara `create` lebih menggambarkan apa yang sebenarnya ingin dilakukan oleh test.

### C.4 Model

```ts
export interface NewProduct {
  sku: string;
  title: string;
  price: number;
  active: boolean;
}

export interface Product extends NewProduct {
  id: string;
}

export interface ProductQuery {
  q?: string;
  limit?: number;
  page?: number;
}
```

Model adalah semacam dokumentasi SUT yang ikut dicek oleh compiler. Gunakan `Partial<Product>` untuk PATCH. Jangan mengetik semua field hanya demi meniru payload yang panjang dan berisik — cukup type **contract** yang memang kamu enforce.

Hasil dari `json()` masih berupa `any`. Client bisa mengembalikan `unknown` + parser, atau `Product` yang sudah divalidasi. Sekadar melakukan `as Product` bukan berarti datanya benar-benar tervalidasi; Project 3 T3 memang meminta runtime validation. `parseProduct(raw: unknown): Product` yang sederhana di client (dan throw typed error kalau parsing gagal) masuk akal **ketika caller memang meminta parsed product**. Helper untuk happy path boleh melakukan parsing, tapi raw method tetap harus tersedia.

### C.5 Apa yang harus dikembalikan?

| Return | Happy path | Negative tests |
|---|---|---|
| Raw `APIResponse` | Test parses and asserts status | **Needed** — 400/401/403 |
| Parsed `Product` | Pleasant | Useless if the body is an error |
| Discriminated `{ ok: true, product } \| { ok: false, response }` | Both | Verbose |

Pattern yang lebih matang: **dua method atau satu option**.

```ts
async create(input: NewProduct): Promise<APIResponse>
async createProduct(input: NewProduct): Promise<Product> // throws if not 201 + parse fail
```

Test yang mengharapkan 201 bisa menggunakan `createProduct` atau `create` + expect. Test yang mengharapkan 400 harus menggunakan `create` dan jangan menggunakan parser yang melakukan throw.

**Throw vs return:** kalau setiap response non-2xx langsung di-throw, negative test jadi susah dilakukan. Bedakan antara "API menolak request" (return response) dan "network/API tidak bisa dijangkau" (throw). Custom error ([Chapter 2.11](../part-2-programming-fundamentals/11-error-handling.md)) bisa membantu membedakan `UnreachableError` dengan response 4xx biasa.

### C.6 Base client

```ts
export class ApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly token?: string,
  ) {}

  protected headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Accept: "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }
}

export class ProductsApiClient extends ApiClient {
  list(params?: ProductQuery) {
    return this.request.get("/api/products", { params, headers: this.headers() });
  }
  create(data: NewProduct) {
    return this.request.post("/api/products", { data, headers: this.headers() });
  }
  // get, replace, update, delete...
}
```

`baseURL` tetap di Playwright config / [Chapter 4.8](08-api-test-data-and-environments.md) — jangan dicopy ke setiap client. Jangan juga membuat satu god client yang menangani semua resource. Idealnya satu class untuk satu resource.

Untuk auth injection, pass `token` lewat constructor (token didapat dari login). Jangan membaca `process.env` di setiap method.

### C.7 Service

```ts
export class CheckoutService {
  constructor(
    private readonly users: UsersApiClient,
    private readonly cart: CartApiClient,
    private readonly orders: OrdersApiClient,
  ) {}

  async readyToPayBuyer(): Promise<{ token: string; user: User; order?: never }> {
    const user = await this.users.register(buildUser());
    const token = await this.users.login(user.email, user.password);
    // seed cart via cart client with token...
    return { token, user };
  }
}
```

Flow register → login → seed cart → place order cukup dibuat **sekali**. UI test di Part V tinggal memanggil service ini daripada mengklik semuanya dari awal. Test yang memang *memverifikasi* proses registration tetap menggunakan `UsersApiClient` secara langsung.

Service yang cuma membungkus satu operasi yang baru dipakai sekali adalah over-abstraction ([Chapter 3.2](../part-3-automation-fundamentals/02-test-automation-architecture.md) C.9). Tunggu sampai workflow tersebut muncul untuk ketiga kalinya sebelum diekstrak.

### C.8 Refactor dengan aman

1. Tambahkan client; satu test mulai menggunakannya; jalankan test; commit.
2. Pindahkan spec berikutnya.
3. Larang raw `request.*` di `tests/` (cek lewat review / grep).
4. Jangan sekalian mengubah assertion hanya karena "mumpung lagi refactor." Behavior harus tetap sama.

### C.9 Pattern yang sama dengan Page Object

`CartPage.addLamp()` sebenarnya menerapkan konsep yang sama seperti chapter ini, hanya saja yang dibungkus adalah locator. [Chapter 6.1](../part-6-framework-engineering/01-page-object-model.md) akan membahasnya lebih lanjut. Jadi, pahami boundary ini dari sekarang.

---

## D. Konteks QA

### D.1 Seed UI lewat API

Salah satu improvement terbesar untuk speed dan stability di Part V: jangan klik register → login → add item hanya untuk menjalankan payment test. Panggil `CheckoutService`.

### D.2 Model sebagai vocabulary bersama

`NewProduct` di sebuah PR juga menjadi vocabulary yang sama antara QA dan developer. Kalau contract berubah, kita bisa mendapat compile error atau parse error, bukan baru sadar jam 2 pagi gara-gara typo seperti `totl`.

### D.3 Review

Assertion di dalam client = architecture mark down. Kalau ada, harus ada alasan yang jelas, bukan sekadar diam-diam dikurangi nilainya.

---

## E. Contoh Kode

### E.1 Sangat sederhana — extract satu function

```ts
function createProduct(request: APIRequestContext, input: NewProduct) {
  return request.post("/api/products", { data: input });
}
```

Kalau resource kedua mulai muncul dan pattern-nya berulang, baru naikkan menjadi class.

### E.2 Praktis — `ProductsApiClient`

`list`, `get`, `create`, `replace`, `update`, `delete` — semuanya mengembalikan `APIResponse`.

### E.3 QA-oriented — test sebelum/sesudah

```ts
// before
const res = await request.post("/api/products", { data: { sku, title, price, active: true }, headers: { Authorization: `Bearer ${token}` } });

// after
const res = await products.create({ sku, title, price, active: true });
expect(res.status()).toBe(201);
```

Assertion-nya tetap sama. Coba hitung berapa kali `title` muncul sebelum dan sesudah rename.

### E.4 Automation-oriented — base + orders + service

`ApiClient` + `OrdersApiClient` + `CheckoutService.placeFromEmpty(token, sku)`. Test yang tadinya 40 baris bisa menjadi kurang dari 10 baris untuk bagian arrange, dengan assertion yang tetap sama.

---

## F. Kesalahan yang Sering Terjadi

### F.1 Assertion di dalam client
### F.2 Selalu throw untuk response non-2xx
### F.3 Nama seperti `postProduct`
### F.4 Return type `any`
### F.5 Satu god client untuk semuanya
### F.6 Membuat class untuk call yang cuma dipakai sekali
### F.7 `baseURL` dicopy ke setiap class
### F.8 Model berisi field yang tidak dipakai dan sering bikin test rusak
### F.9 Big-bang rewrite sampai suite merah seharian
### F.10 Workflow masih dicopy-paste di setiap spec

---

## G. Exercise

Estimasi total waktu: 120 menit.

### G.1 Easy — Tiga method (25 menit)

Extract tiga block code yang berulang.

### G.2 Medium — Model + hitung rename (40 menit)

Tambahkan interface. Rename satu field. Catat berapa file yang ikut berubah.

### G.3 Challenge — `CheckoutService` (55 menit)

Register, auth, seed, order. Ringkas satu test sampai bagian arrange-nya kurang dari 10 baris; **jangan menghapus assertion apa pun**.

---

## H. Coding Assignment

### Assignment 4.7 — Refactor suite kamu

| # | Requirement |
|---|---|
| 1 | Typed clients for **at least two** resources |
| 2 | Request/response models |
| 3 | Base client: headers + optional token |
| 4 | One service, multi-step |
| 5 | **No** raw `request.get/post/...` in `tests/` |
| 6 | **No** `expect` in clients |
| 7 | No behavior change (same tests pass) |
| 8 | `RENAME.md`: before/after file count for one field rename |

**Cara penilaiannya.**

| Aspek | Bobot | Full marks |
|---|---|---|
| Layer rule | 30% | Tidak ada assertion di client; tidak ada raw request di test |
| Types | 20% | Ada model; tidak menggunakan `any` |
| Return design | 20% | Negative test tetap bisa dilakukan |
| Service | 15% | Workflow nyata, bukan sekadar membungkus satu call |
| Rename evidence | 15% | Perhitungan before/after yang jelas |

> **Penggunaan AI: terbatas.** Refactor *suite kamu sendiri*. Membuat demo client baru lengkap dengan test baru tidak memenuhi tujuan lesson ini.

---

## I. Quiz

Sembilan pertanyaan. Kunci jawaban: [`answer-keys/part-4/07-reusable-api-clients-and-models.answers.md`](../answer-keys/part-4/07-reusable-api-clients-and-models.answers.md).

**1.** `ProductsApiClient.create` contains `expect(status).toBe(201)`. Masalahnya adalah:

- A) 201 is wrong
- B) Client tidak boleh melakukan assertion — negative test dan reuse akan bermasalah
- C) expect is slow
- D) POST is forbidden

**2.** Setelah chapter ini, file test seharusnya memanggil:

- A) `request.post("/api/products", ...)`
- B) `products.create(input)`
- C) `fetch`
- D) `waitForTimeout`

**3.** Default return terbaik untuk method yang dipakai oleh happy path maupun negative test:

- A) Selalu `Product` (throw saat 400)
- B) `APIResponse` (atau pasangan raw response + parsing helper)
- C) `void`
- D) `any`

**4.** Nama method `postProduct` kurang bagus karena:

- A) Nama tersebut menyebut HTTP, bukan operasinya
- B) POST is illegal
- C) It is too short
- D) Clients cannot use verbs

**5.** True atau false: Semakin banyak client class selalu semakin baik.

**6.** Register → login → seed cart seharusnya diletakkan di:

- A) Every spec, copied
- B) Service yang menggabungkan beberapa client
- C) `playwright.config.ts`
- D) A page object's CSS

**7.** Client yang cuma membungkus satu call dan dipakai di satu test biasanya:

- A) Required architecture
- B) Premature — tunggu sampai workflow tersebut muncul untuk ketiga kalinya
- C) A service
- D) Configuration

**8.** `as Product` di dalam client setelah `json()` tanpa validation:

- A) Is runtime validation
- B) Masih sebatas claim — lebih baik gunakan `unknown` + parse
- C) Makes `any` safer
- D) Replaces status asserts in the test

**9.** Exercise rename-and-count dibuat untuk:

- A) Slow you down
- B) Mengukur biaya duplication sebelum dan sesudah refactor
- C) Replace tests
- D) Prove REST

---

## J. Review

### Competency Check

> **Kalau orang lain membaca salah satu test kamu, apakah dia bisa memahami behavior bisnisnya tanpa perlu tahu satu pun URL API?**

Kalau `/api/products` masih terlihat langsung di spec, berarti refactor-nya belum selesai.

---

[← 4.6 API Authentication and Authorization](06-api-authentication-and-authorization.md) · [Next: 4.8 API Test Data and Environment Configuration →](08-api-test-data-and-environments.md)

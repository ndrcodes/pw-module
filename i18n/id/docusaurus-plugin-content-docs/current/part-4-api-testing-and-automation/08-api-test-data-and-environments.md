# Chapter 4.8 — API Test Data and Environment Configuration

🔴 **Advanced** · [Overview Part IV](00-module-overview.md) · [Table of Contents](../README.md)

| | |
|---|---|
| **Part** | IV — API Testing dan Automation |
| **Estimasi waktu** | 1 sesi (90 menit) + 5 jam belajar mandiri |
| **Chapter prasyarat** | [4.6](06-api-authentication-and-authorization.md), [4.7](07-reusable-api-clients-and-models.md) |
| **Chapter berikutnya** | [5.1 Playwright Fundamentals](../part-5-web-automation-playwright/01-playwright-fundamentals.md) |

---

> Ada dua pertanyaan yang menentukan apakah sebuah test suite enak dipakai satu tim: **base URL-nya datang dari mana**, dan **data test-nya datang dari mana**. Jawaban untuk keduanya sama: **bukan dari dalam test.**

---

## A. Learning Objectives

Setelah menyelesaikan chapter ini, kamu akan bisa:

1. **Mengatur** test suite supaya bisa jalan di beberapa environment hanya dengan mengubah configuration, tanpa mengedit file test.
2. **Memuat** configuration dari environment variable dengan default yang tervalidasi, dan **fail fast** kalau value yang wajib ternyata belum ada.
3. **Menjaga** secret tetap di luar repository, dan **mendokumentasikan** variable yang dibutuhkan lewat file example yang boleh di-commit.
4. **Membedakan** static reference data dengan data test yang dibuat secara dinamis, lalu **memilih** pendekatan yang tepat.
5. **Membuat** data factory sederhana yang menghasilkan entity yang valid, unik, dan bisa di-override.
6. **Mendesain** cleanup yang reliable, idempotent, dan tidak membuat test gagal.
7. **Menjelaskan** trade-off antara menggunakan shared seed dengan membuat data sendiri di setiap test.

---

## B. Pengetahuan Prasyarat

| Yang dibutuhkan | Dari |
|---|---|
| Typed client dan model | [Chapter 4.7](07-reusable-api-clients-and-models.md) |
| Token handling dan secret | [Chapter 4.6](06-api-authentication-and-authorization.md) |
| Data unik dan cleanup | [Chapter 4.5](05-playwright-api-write-operations.md) |
| Determinism dan isolation | [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md) |
| Default dan optional parameter | [Chapter 2.7](../part-2-programming-fundamentals/07-functions.md) |
| `Partial`, interface | [Chapter 2.10](../part-2-programming-fundamentals/10-typescript-fundamentals.md) |

---

## C. Penjelasan Konsep

### C.1 Hardcoding bikin test suite mentok

`https://localhost:3000` di dua puluh file berarti suite kamu cuma bisa jalan di satu tempat. `ORD-000041` yang kamu ambil dengan melihat database bisa hilang setelah database di-reset. Sementara `if (env === "staging")` di dalam test berarti kamu sebenarnya punya **dua suite yang pura-pura jadi satu**.

Bukti kamu mengerjakan bagian ini dengan benar: `git diff tests/` tetap kosong saat kamu pindah environment.

### C.2 One configuration module

```ts
export interface AppConfig {
  baseURL: string;
  defaultPassword: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable ${name}. See .env.example.`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    defaultPassword: required("E2E_USER_PASSWORD"),
  };
}

export const config = loadConfig();
```

**Urutan sumber config:** environment (CI / shell) jadi prioritas; `.env` untuk local (misalnya lewat `dotenv` kalau kamu menambahkannya — atau env milik Playwright); default hanya untuk value yang bukan secret (`BASE_URL` local).

**Fail fast** kalau secret yang dibutuhkan tidak ada, langsung saat config di-load. Jangan tunggu sampai test ke-17 gagal `401` dan kita cuma bisa bilang, "yaudah, kenapa ya?"

**Baca sekali.** Tinggal import `config`. Jangan menyebar `process.env.BASE_URL` ke berbagai client dan spec — typo kecil bisa menghasilkan masalah di banyak tempat.

Untuk Playwright, set `use.baseURL` dari `config.baseURL` di `playwright.config.ts`. Test tetap menggunakan relative path.

### C.3 Secrets

| File | Di-commit? | Isi |
|---|---|---|
| `.env` | **Jangan pernah** | Real URLs if sensitive, passwords, tokens |
| `.env.example` | Ya | `E2E_USER_PASSWORD=` dan komentar |
| `.gitignore` | Ya | `.env`, `playwright-report/`, `test-results/` |

"Kan cuma staging" bukan alasan yang aman. Password staging tetap bisa membuka akses ke data staging.

Kalau secret sudah terlanjur di-commit: **rotate** dulu (buat secret lama tidak berlaku), lalu hapus dari history Git kalau memang prosedur course/ops mengharuskannya. Menghapus file dari `main` saja tidak menghapus secret dari commit lama.

CI menyimpan variable yang sama di credential store ([Chapter 7.2](../part-7-cicd/02-jenkins-pipelines.md)). Test tetap cukup memanggil `loadConfig()`.

### C.4 Test tidak perlu tahu nama environment

```ts
// jangan dilakukan
if (process.env.ENV === "staging") {
  expect(body.tax).toBe(0);
}

// boleh: behavior ditentukan dari data
expect(body.shipping).toBe(subtotal >= 100 ? 0 : 4.99);
```

Kalau tax di staging berbeda, itu adalah **data** (fixture atau *value* di config seperti `config.taxIncluded`), bukan alasan untuk membuat branch berdasarkan nama environment.

### C.5 Static vs dynamic data

| Jenis | Contoh | Strategy |
|---|---|---|
| **Static / reference** | Currency code, country list, "USD" | Commit JSON; jangan diubah oleh test |
| **Dynamic** | User, order, cart, product yang kamu edit | Factory + cleanup |
| **Shared seed** | Catalogue 10 ribu product yang butuh 10 menit untuk dibuat | Seed sekali; test **tidak boleh** mengubah row tersebut; buat data tambahan/overlay |

Rule sederhananya: kalau dua worker bisa mengubah data tersebut, berarti data itu bukan static. Seed masuk akal untuk reference data yang mahal dibuat dan memang immutable. Tapi kalau data hasil seed kemudian di-PATCH oleh test, itu pada dasarnya mengulang masalah `beforeAll` di [Chapter 3.1](../part-3-automation-fundamentals/01-principles-of-good-automated-tests.md).

### C.6 Factory

```ts
export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = crypto.randomUUID();
  return {
    email: `buyer-${id}@shop.test`,
    password: config.defaultPassword,
    name: "Ada Buyer",
    ...overrides,
  };
}

export function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    sku: `LAMP-${id}`,
    title: "Aeron Desk Lamp",
    price: 49.5,
    active: true,
    ...overrides,
  };
}
```

`buildUser({ role: "seller" })` membuat test hanya perlu menyebutkan hal yang memang penting untuk test tersebut. Default-nya harus **valid**. Kalau ada override, override yang menang.

Untuk uniqueness: pakai UUID di email/SKU. Timestamp masih bisa collision. Counter bisa bermasalah antar-worker.

**Log** email/SKU yang dibuat di message `expect` atau `test.info().annotations` supaya failure bisa direproduce. Seed `Math.random` itu opsional; logging bukan.

### C.7 Cleanup, versi lengkap

Dari [Chapter 4.5](05-playwright-api-write-operations.md), sekarang kita jadikan sebagai rule set:

1. Selalu jalan (`afterEach`, `finally`, atau nanti lewat fixture).
2. Idempotent — dijalankan untuk kedua kalinya pun tetap aman.
3. Kalau resource sudah terhapus → jangan membuat test gagal.
4. Jangan pernah menghapus data yang tidak kamu buat sendiri (terutama seed/reference data).

```ts
async function safeDelete(run: () => Promise<APIResponse>): Promise<void> {
  try {
    const res = await run();
    if (res.status() !== 200 && res.status() !== 204 && res.status() !== 404) {
      console.warn(`cleanup unexpected status ${res.status()}`);
    }
  } catch {
    // teardown tidak boleh menutupi atau membuat test gagal
  }
}
```

### C.8 Shared seed vs create per test

| | Factory per test | Shared seed |
|---|---|---|
| Isolation | Paling aman | Aman hanya kalau immutable |
| Speed | Lebih banyak POST | Read lebih cepat |
| Parallel | Aman secara natural ([Chapter 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md)) | Bisa collision kalau ada yang melakukan write |
| Kapan | Default | Rate limit, provisioning yang butuh menit, catalogue besar |

Kamu harus bisa menjelaskan trade-off keduanya. Default-nya tetap **per-test**. Judgment level 🔴 di sini adalah bisa bilang, "gue pakai seed karena X," bukan "gue hardcode `user1` karena lebih gampang."

### C.9 Lifecycle sebuah run

```text
Before:  empty (or immutable seed only)
During:  each test's users/products/orders exist
After:   those records gone (best effort); seed untouched
```

Kalau setelah seminggu environment penuh dengan `buyer-*-@shop.test`, itu berarti ada bug di cleanup. Database jadi makin berat dan akhirnya bikin tim malu juga.

### C.10 Menuju fixtures

`test.extend({ buyer: async ({ request }, use) => { ...; await use(user); /* teardown */ } })` akan dibahas di [Chapter 6.2](../part-6-framework-engineering/02-fixtures.md). Factory bertugas menghasilkan **value**. Fixture bertugas mengatur **lifecycle**. Untuk sekarang, kita fokus punya value-nya dulu.

---

## D. Konteks QA

### D.1 "Works on my machine"

Hampir selalu penyebabnya `BASE_URL` atau env variable yang belum ada. CI adalah environment yang paling jujur ([Part VII](../part-7-cicd/00-module-overview.md)). Error fail-fast sebaiknya langsung menyebut nama variable yang bermasalah.

### D.2 Factory bikin worker jadi boring

Email yang unik membuat isolation terjadi secara natural. Shared `admin@shop.test` adalah flaky test yang tinggal menunggu waktunya muncul.

### D.3 Factory yang sama bisa dipakai untuk UI

Part V / Project 4 bisa memanggil `buildUser` + API client. Jangan membuat bentuk user kedua yang sebenarnya sama.

### D.4 Credential yang bocor adalah incident

Rotate, laporkan, dan jangan cuma bilang "sekarang gue gitignore aja."

---

## E. Contoh Kode

### E.1 Sangat sederhana — base URL

```ts
use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000" }
```

Ganti environment dengan `BASE_URL=https://staging.shop.test npx playwright test`. `git diff tests` harus tetap kosong.

### E.2 Praktis — `loadConfig`

Lihat C.2. Kalau `E2E_USER_PASSWORD` tidak ada, error harus muncul sebelum test dijalankan. Message-nya mengarahkan ke `.env.example`.

### E.3 QA-oriented — tiga factory

`buildUser`, `buildProduct`, `buildOrderInput`. Lima test diubah menggunakan factory. Gunakan override untuk `price: 100` (REQ-114) dan `role: "admin"` kalau API memang mengizinkannya.

### E.4 Automation-oriented — dua environment + double cleanup

Jalankan local dan staging (atau local + port kedua). Panggil cleanup function dua kali dalam unit-ish test atau spec khusus — pemanggilan kedua tidak boleh throw.

---

## F. Kesalahan yang Sering Terjadi

### F.1 URL, password, dan ID hasil intip database yang di-hardcode
### F.2 `.env` di-commit ("kan cuma staging")
### F.3 `if (environment === "staging")` di dalam test
### F.4 `process.env` tersebar di dua puluh file
### F.5 Variable hilang → tiba-tiba 401 di test ke-17
### F.6 Factory selalu menghasilkan email yang sama
### F.7 Data random tanpa log, akhirnya tidak bisa direproduce
### F.8 Cleanup throw saat 404
### F.9 Cleanup hanya jalan saat test sukses
### F.10 Row hasil seed diubah-ubah oleh setiap test
### F.11 PII customer asli dipakai di fixture

---

## G. Exercise

Estimasi total waktu: 100 menit.

### G.1 Easy — Config saja (20 menit)

Hapus host dari test. Buktikan dengan `git diff tests/`. Ganti `BASE_URL` satu kali.

### G.2 Medium — Tiga factory (35 menit)

Data unik + override menggunakan `Partial`. Ubah lima test supaya menggunakan factory.

### G.3 Challenge — Dua environment (45 menit)

Cukup ubah satu variable. Pastikan fail-fast bekerja. Hanya `.env.example` yang boleh di-commit. Jalankan cleanup dua kali. Pastikan tidak ada secret di Git (`git grep` / `git check-ignore .env`).

---

## H. Coding Assignment

### Assignment 4.8 — Environment-driven Suite dengan Factory

Persiapan terakhir sebelum [Project 3](../projects/project-3-api-automation.md).

| # | Requirement |
|---|---|
| 1 | `local` dan satu environment lain lewat **satu** variable (`BASE_URL` atau `ENV` yang hanya diinterpretasikan oleh config module) |
| 2 | `loadConfig()` yang typed; fail-fast; single source |
| 3 | Factory: user, product, order (atau cart line) — unik dan bisa di-override |
| 4 | Cleanup selalu jalan / idempotent / tidak membuat test gagal |
| 5 | `.env.example` di-commit; `.env` di-ignore |
| 6 | Test tidak mengandung host, password, atau ID hasil intip database |
| 7 | `PROOF.md`: `git diff tests` saat pindah environment; screenshot/text dari message fail-fast |

**Cara penilaiannya.**

| Aspek | Bobot | Full marks |
|---|---|---|
| Config | 25% | Satu module; pindah environment tanpa edit test |
| Secrets | 25% | Tidak ada secret yang terdeteksi grep; ada example file |
| Factory | 25% | Unique + override |
| Cleanup | 15% | Aman dijalankan dua kali |
| Proof | 10% | Diff + fail-fast |

> **Penggunaan AI: terbatas.**

---

## I. Quiz

Sepuluh pertanyaan. Kunci jawaban: [`answer-keys/part-4/08-api-test-data-and-environments.answers.md`](../answer-keys/part-4/08-api-test-data-and-environments.answers.md).

**1.** Untuk pindah ke staging, yang seharusnya perlu diubah adalah:

- A) Every spec
- B) Configuration / env vars only
- C) Client method names
- D) Assertion matchers

**2.** Kalau password yang wajib tidak ada, seharusnya:

- A) Surface as 401 in a random test
- B) Fail fast at config load with the variable name
- C) Default to `"password"`
- D) Be committed to git

**3.** True atau false: `.env` boleh di-commit kalau isinya hanya untuk staging.

**4.** `if (env === "staging") expect(tax).toBe(0)` di dalam test salah karena:

- A) Tax never matters
- B) Tests must not branch on environment name — you have forked the suite
- C) Staging cannot have tax
- D) `expect` is illegal

**5.** Country code di JSON yang di-commit termasuk:

- A) Dynamic data — must factory
- B) Static reference data — safe to share if tests do not mutate them
- C) Secrets
- D) Environment URLs

**6.** Kalau `buildUser()` dipanggil dua kali, hasilnya seharusnya:

- A) Return the same email
- B) Return two unique emails
- C) Return `admin@shop.test`
- D) Throw

**7.** Factory override dibuat supaya:

- A) Tests can set the one field they care about (`price: 100`) and keep valid defaults
- B) You can skip validation
- C) Secrets can live in code
- D) `baseURL` can move

**8.** Cleanup dijalankan untuk kedua kalinya dan record sudah tidak ada. Cleanup seharusnya:

- A) Fail the suite
- B) Succeed (404/ignore)
- C) Recreate production data
- D) Print the password

**9.** Seed catalogue yang butuh 10 menit untuk dibuat masuk akal ketika:

- A) You always want to skip factories
- B) Data is expensive and tests will **not** mutate those rows
- C) You need `user1@test.com`
- D) CI is down

**10.** Bukti bahwa suite tidak bergantung pada environment tertentu:

- A) A comment that says so
- B) `git diff tests/` empty after changing `BASE_URL` and a green run
- C) Hardcoded staging URL
- D) More retries

---

## J. Review

### Konsep Utama

| Konsep | Versi satu kalimat |
|---|---|
| Config module | Satu-satunya tempat environment dibaca |
| Fail fast | Secret yang hilang langsung menyebut nama variable-nya |
| `.env` / `.env.example` | Value asli vs dokumentasi |
| Static vs dynamic | Mutability yang menentukan |
| Factory | Valid + unique + `Partial` |
| Cleanup | Selalu jalan, idempotent, tidak berisik |
| Seed | Hanya untuk reference data yang immutable |

### Competency Check

> **Kalau colleague clone repository kamu, mengatur dua environment variable, apakah dia bisa langsung mendapatkan green run di environment miliknya sendiri?**

### Gate Part IV

Sebelum masuk ke [Part V](../part-5-web-automation-playwright/00-module-overview.md), dan setelah [Project 3](../projects/project-3-api-automation.md), pastikan:

- Tiga run berturut-turut, urutan bebas, dengan `--workers=4`
- Database fresh, tanpa persiapan manual
- Tidak ada ID, URL, atau password yang di-hardcode
- Setiap test bisa menjawab: "test ini akan gagal kalau X rusak"
- Rusak body satu endpoint → hanya test yang relevan yang menjadi red

Poin kelima biasanya yang dilewati learner, padahal hampir selalu dicek oleh grader.

**Project 3** adalah ujian Part IV yang benar-benar akan dipakai sebagai hasil akhir. Bawa matrix dari 4.3, client dari 4.7, dan config module dari chapter ini.

---

[← 4.7 Reusable API Clients and Models](07-reusable-api-clients-and-models.md) · [Next: Part V — 5.1 Playwright Fundamentals →](../part-5-web-automation-playwright/01-playwright-fundamentals.md)

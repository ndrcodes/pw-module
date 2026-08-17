# Bab 3.2 — Arsitektur Otomasi Pengujian

🟡 **Menengah** · [Ikhtisar Bagian III](00-module-overview.md) · [Daftar Isi](../README.md)

| | |
|---|---|
| **Bagian** | III — Dasar-Dasar Otomasi Pengujian |
| **Perkiraan waktu** | 1 sesi (90 menit) + 4 jam kerja mandiri |
| **Bab prasyarat** | [3.1 Prinsip-Prinsip Pengujian Otomatis yang Baik](01-principles-of-good-automated-tests.md) |
| **Bab berikutnya** | [4.1 Dasar-Dasar HTTP](../part-4-api-testing-and-automation/01-http-fundamentals.md) |

---

> Rangkaian sepuluh pengujian tidak membutuhkan arsitektur. Rangkaian lima ratus pengujian, yang dikelola oleh empat orang selama tiga tahun, hampir tidak membutuhkan apa-apa selain itu.
>
> Arsitektur bukan estetika. Ini adalah **keputusan biaya pemeliharaan**: apakah menambahkan pengujian kedeapan ratus membutuhkan dua puluh menit atau dua hari, dan apakah perubahan nama dalam aplikasi membutuhkan satu edit atau empat puluh.

---

## A. Tujuan Pembelajaran

Di akhir bab ini Anda akan mampu:

1. **Menggambarkan** tanggung jawab setiap lapisan dalam arsitektur otomasi berlapis.
2. **Menempatkan** sebuah kode tertentu ke lapisan yang tepat, dan **mengenali** pelanggaran lapisan.
3. **Menjelaskan** aturan ketergantungan — lapisan bergantung ke bawah, tidak pernah ke atas — dan **mengidentifikasi** pelanggarannya.
4. **Menggambarkan** peran test runner, assertion library, reporter, log, dan artefak dalam investigasi kegagalan.
5. **Membenarkan** setiap lapisan dengan menyebutkan duplikasi atau penggabungan spesifik yang dihilangkannya.
6. **Mengenali** over-abstraction, dan **berargumen** kapan duplikasi lebih baik dari lapisan baru.
7. **Menulis** konstitusi framework: aturan tertulis Anda sendiri tentang apa yang boleh ada di mana.

---

## B. Pengetahuan Prasyarat

| Diperlukan | Dari |
|---|---|
| Kemandirian, isolasi, determinisme, AAA | [Bab 3.1](01-principles-of-good-automated-tests.md) |
| Fungsi, objek, antarmuka, modul | [Bab 2.7–2.10](../part-2-programming-fundamentals/00-module-overview.md) |
| Pernah menduplikasi kode di berbagai file secara pribadi | Proyek 1 dan 2 |

Ketika bab ini berargumen untuk lapisan utilitas, Anda harus mengenali argumennya: Anda sudah menyalin perhitungan pass-rate ke tiga file.

---

## C. Penjelasan Konsep

### C.1 Arsitektur adalah siapa yang membayar nanti

Tanpa struktur, setiap file pengujian menjadi skrip: URL, locator, token, sleep, dan asersi dalam satu tumpukan. Sepuluh pengujian pertama cepat ditulis. Pengujian ke-80 menyalin pengujian ke-12 dan mengubah tiga string. Seorang desainer mengubah nama tombol; empat puluh file berubah. Engineer baru tidak bisa menemukan "di mana login berada."

**Pelapisan berdasarkan tanggung jawab** adalah cara Anda menjaga biaya perubahan lebih dekat ke linear daripada "cari di semua tempat."

Lapisan memiliki biaya **arah tidak langsung**. Orang yang membaca kegagalan pukul 2 pagi membayar biaya itu. Jadi setiap lapisan harus membuktikan nilainya dengan menghilangkan *duplikasi yang disebutkan* atau *penggabungan yang disebutkan*. Lapisan yang tidak bisa Anda benarkan adalah inventaris. Hapus saja.

### C.2 Lima lapisan

```text
Lapisan Pengujian     Apa yang sedang diverifikasi, dalam bahasa bisnis
    ↓
Lapisan Page/API      Cara berinteraksi dengan satu layar atau satu endpoint
    ↓
Lapisan Layanan       Alur kerja bisnis multi-langkah (daftar, lalu masuk, lalu isi keranjang)
    ↓
Lapisan Utilitas      Pembantu generik: data factories, pemformatan tanggal, percobaan ulang, logging
    ↓
Konfigurasi           Lingkungan, URL dasar, kredensial, batas waktu, browser
```

| Lapisan | Berkata | Berisi | Tidak boleh berisi |
|---|---|---|---|
| **Pengujian** | *Apa yang seharusnya benar* | AAA, nama dalam bahasa bisnis, asersi | Locator, URL mentah, plumbing `fetch`, `waitForTimeout` |
| **Page / API** | *Cara bicara dengan satu hal* | Locator dan tindakan satu layar; panggilan HTTP satu resource | Asersi tentang hasil bisnis; alur kerja yang mencakup tiga layar |
| **Layanan** | *Cara mempersiapkan dunia* | `registerAndLogin`, `seedCart`, `placeOrderViaApi` | Selektor CSS; `expect` |
| **Utilitas** | *Bantuan generik, ringan domain* | `userFactory`, tanggal ISO, logger | Pengetahuan tentang `LoginPage` atau `/api/orders` |
| **Konfigurasi** | *Apa yang berbeda per lingkungan* | URL dasar, *referensi* kredensial, batas waktu, browser | Logika pengujian, locator |

Jalan pintas legal dengan garis putus-putus dari [ikhtisar modul](00-module-overview.md): sebuah pengujian boleh memanggil layanan secara langsung (setup API untuk pengujian UI). Sebuah halaman boleh menggunakan utilitas (format tanggal). Panah yang **menunjuk ke atas** adalah pelanggaran: utilitas yang mengimpor `LoginPage`, page object yang mengimpor `checkout.spec.ts`.

### C.3 Aturan ketergantungan

**Setiap lapisan boleh bergantung pada lapisan di bawahnya, tidak pernah yang di atasnya.**

- Sebuah page object tidak boleh mengetahui pengujian mana yang menggunakannya.
- Sebuah utilitas tidak boleh mengetahui bahwa halaman login Anda ada.
- Konfigurasi tidak boleh mengimpor pengujian untuk "mengetahui" URL mana yang digunakan.

Mengapa: ketergantungan ke atas menciptakan siklus dan membuat penggunaan kembali menjadi tidak mungkin. Jika `userFactory` mengimpor `CartPage` untuk "membantu" mengosongkan keranjang, Anda tidak bisa menggunakan factory dalam pengujian khusus API, dan perubahan halaman keranjang merusak pembuatan data.

[Bab 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) memperlakukan panah ke atas sebagai cacat tinjauan. Belajarlah untuk melihatnya sekarang.

### C.4 Tiga pelanggaran yang dikerjakan

**Pelanggaran 1 — locator dalam pengujian**

```ts
test("lampu muncul di keranjang", async ({ page }) => {
  await page.locator("#cart > div:nth-child(3) span").click();
  await expect(page.locator(".line-title")).toHaveText("Aeron Desk Lamp");
});
```

Gejala: perubahan tata letak merusak pengujian, dan perbaikannya disalin ke setiap file yang menyertakan CSS yang sama secara inline. Pengujian tidak lagi terbaca sebagai spesifikasi; terbaca sebagai skrip.

**Penempatan:** locator dan `click` pada *layar ini* milik `CartPage`. Pengujian mengatakan `await cartPage.expectLine("Aeron Desk Lamp")` atau mengasersi pada nilai yang dikembalikan. (Bagaimana page objects mengekspos niat adalah [Bab 6.1](../part-6-framework-engineering/01-page-object-model.md). *Aturannya* ada di sini.)

**Pelanggaran 2 — alur kerja bisnis di dalam page object**

```ts
class CartPage {
  async checkoutAsNewUser(): Promise<void> {
    await this.register();
    await this.login();
    await this.addDefaultLamp();
    await this.applyCoupon("SAVE10");
    await this.placeOrder();
  }
}
```

Gejala: aplikasi mobile, rangkaian API, dan alur web kedua semuanya membutuhkan "pengguna baru dengan lampu di keranjang." Mereka tidak bisa menggunakan kembali kelas yang mengetahui CSS. Mengubah langkah kupon merusak setiap pengujian UI yang hanya menginginkan keranjang yang di-seed.

**Penempatan:** `CheckoutService.seedReadyToPayCart()` menggunakan **API** (atau layanan yang melakukannya). `CartPage` mengetahui cara mengklik *keranjang ini*.

**Pelanggaran 3 — URL yang dikodekan keras dalam utilitas**

```ts
export async function createUser(email: string): Promise<User> {
  const response = await fetch("https://staging.shop.test/api/users", { /* ... */ });
}
```

Gejala: URL staging dalam helper; production dan lokal membutuhkan edit di dua puluh file; CI menggunakan host yang berbeda dan tidak ada yang ingat yang ini.

**Penempatan:** `createUser` membaca `config.baseURL` (atau fixture `request` Playwright, yang sudah mengetahui base). Konfigurasi memiliki host.

### C.5 Apa yang seharusnya ada dalam pengujian

File pengujian harus dapat dibaca oleh seseorang yang mengetahui produk dan tidak mengetahui Playwright.

```ts
test("checkout dengan kartu valid mengkonfirmasi pesanan dan mengembalikan id ORD-", async ({ request }) => {
  const buyer = await userFactory.buyer();
  const product = await catalog.seedLamp();
  await cart.add(buyer, product, 1);

  const order = await checkout.place(buyer, { card: "valid" });

  expect(order.status, "pesanan seharusnya dikonfirmasi").toBe("confirmed");
  expect(order.id).toMatch(/^ORD-\d{6}$/);
});
```

Arrange / Act / Assert terlihat. Locator tidak ada. URL dasar tidak ada. Jika file ini mengimpor `page.locator`, lapisan sedang bocor.

Asersi tentang **hasil bisnis** ada di pengujian (atau dalam matcher kustom yang digunakan *oleh* pengujian). Asersi di dalam page objects atau klien API mengaburkan lapisan: pengujian tidak lagi bisa menyatakan niat, dan Anda tidak bisa menggunakan kembali `CartPage.add` tanpa juga menerima pendapatnya tentang arti "sukses." [Strategi Penilaian §8](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) mencantumkan ini secara eksplisit.

### C.6 Anatomi investigasi kegagalan

Ketika sebuah pengujian gagal, Anda tidak "menjalankan pengujian." Anda **mendiagnosis**. Peran-peran ini berbeda:

| Bagian | Pekerjaan |
|---|---|
| **Test runner** | Menemukan file, menjalankannya, menerapkan workers, percobaan ulang, batas waktu (`npx playwright test`) |
| **Assertion library** | Memutuskan lulus/gagal dan memformat ketidakcocokan (`expect`) |
| **Reporter** | Mengubah jalannya menjadi cerita yang dapat dibaca manusia (laporan HTML, daftar, anotasi CI) |
| **Log** | Peristiwa berurutan waktu yang Anda pilih untuk dipancarkan (id permintaan, email yang di-seed) |
| **Artefak** | Bukti yang ditangkap saat kegagalan: tangkapan layar, jejak, video, body respons |

Demo 6: kegagalan yang sama dua kali. Sekali Anda hanya punya `Error: expect(received).toBe(expected)`. Sekali Anda punya tangkapan layar, jejak, dan `expect(order.status, "pesanan seharusnya dikonfirmasi").toBe("confirmed")`. Waktu kedua diagnosis tersebut. Yang kedua adalah alasan [Bab 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md) ada, dan mengapa [Bab 7.2](../part-7-cicd/02-jenkins-pipelines.md) menerbitkan laporan daripada hanya dump konsol.

**Langkah pertama pada kegagalan CI adalah membaca artefaknya, bukan menjalankan ulang.** Menjalankan ulang menghancurkan satu-satunya bukti flake. [Bab 3.1](01-principles-of-good-automated-tests.md) Q9 adalah kalimat ini.

Output yang dapat dibaca mesin (JUnit, JSON reporter) adalah untuk gerbang CI dan skrip pelacak flake — bentuk Proyek 1, dari pipeline. Laporan manusia untuk manusia. Anda membutuhkan keduanya. Tidak mengonfigurasi keduanya adalah cara tim men-debug dengan menekan tombol lagi.

### C.7 Struktur proyek yang digunakan buku ini

```text
tests/
  api/
    orders.spec.ts              # lapisan pengujian
  web/
    checkout.spec.ts
src/
  api/
    orders-client.ts            # lapisan page/API (HTTP)
    catalog-client.ts
  pages/
    cart-page.ts                # lapisan page/API (UI)
    checkout-page.ts
  services/
    checkout-service.ts         # lapisan layanan
    auth-service.ts
  fixtures/
    user-factory.ts             # utilitas (data)
    ids.ts
  config/
    env.ts                      # konfigurasi
playwright.config.ts            # konfigurasi (runner)
```

Nama-namanya bisa bervariasi. Tanggung jawabnya seharusnya tidak. `helpers.ts` yang berisi `login`, `formatDate`, `parseOrder`, dan `waitForSpinner` bukan sebuah lapisan. Itu adalah laci sampah. Pisahkan ketika Anda bisa menyebutkan dua alasan berbeda mengapa itu akan berubah.

### C.8 Penamaan lintas lapisan

| Jenis | Pola | Contoh |
|---|---|---|
| File spesifikasi | area perilaku | `checkout.spec.ts` |
| Nama pengujian | hasil | `checkout dengan kartu valid mengkonfirmasi pesanan` |
| Kelas halaman | layar + `Page` | `CartPage` |
| Klien API | resource + `Client` | `OrdersApiClient` |
| Layanan | alur kerja | `AuthService`, `CheckoutService` |
| Factory | entitas + `Factory` | `userFactory` |
| Konfigurasi | apa yang dikonfigurasi | `env.ts`, `playwright.config.ts` |

Page objects mengekspos **niat**, bukan plumbing: `login(user)` bukan `getLoginButton()` lalu klik dalam pengujian. Itulah [Bab 6.1](../part-6-framework-engineering/01-page-object-model.md); penamaannya sudah menyiratkannya.

### C.9 Aturan tiga, pada skala arsitektur

[Bab 3.1](01-principles-of-good-automated-tests.md) C.9: duplikasi dua kali; abstraksi pada yang ketiga.

Diterapkan pada lapisan:

- **Satu** pengujian berbicara ke `POST /orders` secara inline. Biarkan saja.
- **Dua** pengujian menyalin panggilannya. Toleransi; perhatikan penyimpangan.
- Salinan **ketiga**: ekstrak `OrdersApiClient`. Sekarang Anda bisa melihat header dan penanganan error mana yang benar-benar dibagi.

**Bau over-abstraction:**

- `BasePage` dengan sebelas method protected, dua di antaranya digunakan.
- Lapisan layanan untuk delapan pengujian yang tidak pernah berbagi alur kerja.
- Helper yang digunakan sekali, dengan enam parameter opsional "untuk nanti."
- Lima lapisan karena sebuah blog memiliki lima folder.

**Kapan duplikasi benar:** dua salinannya akan segera berbeda (login web vs token API login). Memaksanya melalui satu fungsi menyembunyikan perbedaan sampai menjadi bug. Dua fungsi jujur mengalahkan satu yang tidak jujur.

### C.10 Bagaimana arsitektur berkembang

Tidak ada yang memulai dengan lima lapisan. Rasa sakit memicu ekstraksi berikutnya:

```text
Skrip (semua dalam spesifikasi)
    → perubahan nama pertama terlalu mahal
Objek Page / API (cara-bicara-dengan-satu-hal)
    → alur kerja setup disalin-tempel di seluruh spesifikasi
Layanan (persiapkan dunia)
    → email dan tanggal pengguna dibuat secara ad hoc
Factory dan konfigurasi (data + lingkungan)
    → pengujian membutuhkan setup terkomposisi tanpa menyalin
Fixture (Bab 6.2)
```

Setiap langkah adalah respons terhadap biaya yang telah Anda rasakan. Menyalin pohon folder dari tutorial *sebelum* biaya itu adalah cara Anda mendapatkan lima lapisan untuk delapan pengujian.

### C.11 Konstitusi framework

Sebuah **konstitusi** adalah dokumen satu halaman yang Anda tulis: apa yang boleh ada di mana, apa yang dilarang, dan bagaimana Anda akan memutuskan ekstraksi berikutnya.

Ini bukan pekerjaan sia-sia. Anda akan dinilai berdasarkan dokumen **Anda sendiri** dalam [pembelaan arsitektur capstone](../capstone/00-capstone-overview.md). Anda boleh merevisinya — jika Anda bisa menjelaskan apa yang mengubah pikiran Anda. Mengubah pikiran dengan alasan mendapat nilai lebih tinggi daripada mempertahankan aturan yang tidak lagi Anda percaya ([Bab 8.3](../part-8-professional-engineering/03-scalable-automation-architecture.md)).

Konstitusi yang mengatakan "kami menggunakan praktik terbaik" bukan konstitusi. Yang mengatakan "locator tidak pernah muncul di `tests/`; salinan ketiga dari panggilan HTTP menjadi klien; utilitas tidak boleh mengimpor halaman" bisa ditegakkan dalam tinjauan kode.

---

## D. Konteks QA

### D.1 Di mana setiap lapisan dibangun nanti

| Lapisan | Anda mengimplementasikannya di |
|---|---|
| Klien API | [Bab 4.7](../part-4-api-testing-and-automation/07-reusable-api-clients-and-models.md) |
| Page objects | [Bab 6.1](../part-6-framework-engineering/01-page-object-model.md) |
| Fixture (komposisi) | [Bab 6.2](../part-6-framework-engineering/02-fixtures.md) |
| Data factory | [Bab 6.4](../part-6-framework-engineering/04-test-data-management.md) |
| Auth sebagai layanan | [Bab 6.3](../part-6-framework-engineering/03-authentication-strategies.md) |
| Artefak dan jejak | [Bab 6.8](../part-6-framework-engineering/08-debugging-playwright-tests.md) |
| Laporan di CI | [Bab 7.2](../part-7-cicd/02-jenkins-pipelines.md) |
| Tinjauan pelanggaran | [Bab 8.2](../part-8-professional-engineering/02-code-review-for-automation.md) |

Bagian III menyebutkan standar. Bagian IV–VI mengimplementasikannya. Bagian VIII menegakkannya pada kode orang lain.

### D.2 Login dalam page object versus layanan

Jika `LoginPage.login` adalah satu-satunya cara untuk menjadi terautentikasi, rangkaian API dan rangkaian mobile menemukan login mereka sendiri. Auth sebagai **layanan** (token melalui API) memungkinkan pengujian web melewati layar login ketika perilaku yang diuji adalah checkout. Itulah keputusan piramida ([Bab 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md)) *dan* keputusan lapisan.

### D.3 Konstitusi kembali

Pembelaan capstone: "Tunjukkan saya sebuah file. Sebutkan lapisannya. Sebutkan duplikasi yang dihilangkan oleh lapisan itu. Tunjukkan saya aturan dalam konstitusi Anda yang dipatuhi file ini." Peserta yang menyalin struktur blog tanpa konstitusi tidak bisa menjawab. Peserta yang menulis halaman tertentu dan kemudian melanggar aturan mereka sendiri *dengan sengaja, dengan amandemen tertulis* bisa.

---

## E. Contoh Kode

### E.1 Sangat sederhana — apa versus bagaimana

```ts
// Apa (lapisan pengujian)
test("keranjang kosong menampilkan state kosong", async ({ page }) => {
  const cart = new CartPage(page);
  await cart.open();
  await expect(cart.emptyState).toBeVisible();
});

// Bagaimana (lapisan halaman)
class CartPage {
  constructor(private readonly page: Page) {}
  readonly emptyState = this.page.getByText("Your cart is empty");
  async open(): Promise<void> {
    await this.page.goto("/cart");
  }
}
```

Pengujian tidak mengetahui URL atau strategi locator string di luar apa yang diekspos halaman. Halaman tidak mengetahui nama pengujian.

### E.2 Praktis — pohon dengan pekerjaan

```text
tests/web/cart.spec.ts          → pengujian state kosong di atas
src/pages/cart-page.ts          → CartPage
src/api/cart-client.ts          → DELETE /cart untuk pembersihan
src/services/auth-service.ts    → token untuk klien API
src/fixtures/user-factory.ts    → pembeli unik
src/config/env.ts               → baseURL
```

Beri anotasi setiap file dengan satu kalimat: *ini ada agar kita tidak _____.* Jika Anda tidak bisa menyelesaikan kalimatnya, file tersebut adalah kandidat untuk dihapus.

### E.3 Berorientasi QA — tiga pelanggaran, dikoreksi

```ts
// 1. Locator dipindahkan keluar dari spesifikasi — lihat E.1

// 2. Alur kerja adalah layanan, bukan halaman
export async function seedReadyToPayCart(api: ShopApi, buyer: User): Promise<Cart> {
  const product = await api.catalog.seedLamp();
  return api.cart.add(buyer, product, 1);
}

// 3. Host berasal dari konfigurasi
export function ordersUrl(path: string): string {
  return `${env.baseURL}/api/orders${path}`;
}
```

### E.4 Berorientasi otomasi — dengan dan tanpa layanan

**Tanpa:** setiap pengujian UI checkout mengulangi daftar → masuk → seed lampu → buka keranjang. Perubahan persyaratan ("pembeli harus memverifikasi email") mengedit delapan spesifikasi.

**Dengan:** `await checkoutService.readyToPayBuyer()` berubah sekali. Pengujian UI yang *memverifikasi registrasi* masih melalui halaman. Pengujian UI yang *memverifikasi pembayaran* tidak membayar pajak registrasi.

Layanan mendapatkan tempatnya pada hari pengujian ketiga membutuhkan alur kerja yang sama. Sebelum itu, itu adalah folder untuk kepentingannya sendiri.

---

## F. Kesalahan Umum

### F.1 Locator dalam file pengujian

Pengujian menjadi skrip. Perubahan nama menjadi pencarian. Lihat C.4.

### F.2 Asersi di dalam page objects atau klien API

Klien tidak bisa digunakan kembali tanpa mewarisi vonis. Pengujian berhenti menyatakan niat.

### F.3 Logika bisnis dalam utilitas

`calculateFreeShipping` di `utils/string.ts`. Aturan domain milik berdekatan dengan API/layanan yang menggunakannya, atau dalam produk. Utilitas tetap generik.

### F.4 Ketergantungan ke atas

`userFactory` mengimpor `LoginPage`. Anda tidak lagi bisa membuat pengguna dari pengujian API.

### F.5 Lima lapisan untuk delapan pengujian

Seremonial. Benarkan atau hapus.

### F.6 `helpers.ts` sebagai laci sampah

Fungsi-fungsi yang tidak terkait yang berubah karena alasan yang tidak terkait. Pisahkan berdasarkan alasan-untuk-berubah.

### F.7 Kelas `BasePage` sebelum duplikasi

Sebelas method, dua yang digunakan. Engineer berikutnya membaca semua sebelas sebelum menulis pengujian.

### F.8 Konfigurasi dibaca sebagai string ajaib dalam pengujian

`goto("https://staging...")` dalam spesifikasi. Perubahan lingkungan menjadi edit di setiap file.

### F.9 Tidak ada reporter, diagnosa dengan menjalankan ulang

Menghancurkan bukti flake. Lihat C.6.

### F.10 Pohon folder yang disalin, pekerjaan tidak diketahui

Direktori `services/` dengan satu file yang membungkus satu `click`. Sebutkan duplikasinya atau ratakan.

---

## G. Latihan

Waktu total yang disarankan: 90 menit.

### G.1 Mudah — Dua puluh potongan kode (25 menit)

Tetapkan setiap baris ke sebuah lapisan. Jika dua lapisan dapat dipertahankan, pilih satu dan tulis alasannya.

```text
1.  expect(order.status).toBe("confirmed")
2.  page.getByRole("button", { name: "Place order" })
3.  await request.post("/api/orders", { data })
4.  crypto.randomUUID()
5.  process.env.BASE_URL
6.  test("...", async () => { ... })
7.  class OrdersApiClient { ... }
8.  class CartPage { ... }
9.  async function registerLoginAndSeedCart() { ... }
10. formatIsoDate(date)
11. playwright.config.ts timeout
12. await cartPage.addLamp()
13. expect(page).toHaveURL(/\/orders\/ORD-/)
14. readFile("storage-state.json")
15. logger.info(`seeded ${email}`)
16. await page.locator("#cart > div:nth-child(3)").click()
17. const token = await authService.loginAs(buyer)
18. retries: 1 in config
19. interface Order { id: string; status: OrderStatus }
20. await expect(cartPage.emptyState).toBeVisible()
```

(16) adalah locator — lapisan halaman, dan sebuah bau. (19) adalah model; ia berjalan bersama lapisan API. (20) adalah asersi lapisan pengujian yang *menggunakan* page object.

### G.2 Menengah — Perburuan pelanggaran (30 menit)

Dalam mini-tree (tulis satu jika tidak ada yang disediakan), tanam atau temukan:

1. Locator dalam spesifikasi.
2. Alur kerja dalam page object.
3. URL yang dikodekan keras dalam utilitas.

Untuk masing-masing: **gejala yang akhirnya akan ditimbulkannya** (bukan hanya "lapisan yang salah"), kemudian penempatan yang dikoreksi.

### G.3 Tantangan — Hapus dua lapisan (35 menit)

Seseorang mengusulkan enam lapisan untuk rangkaian API-only 12-pengujian: pengujian, API, layanan, utilitas, konfigurasi, plus "core" dan "shared."

Hapus dua (atau ratakan "core"/"shared" ke dalam yang sudah ada). Pertahankan kemampuan untuk menulis pengujian yang sama. Tulis: apa yang sebenarnya hilang? Jika jawaban jujurnya adalah "nama folder," itulah pelajarannya.

---

## H. Tugas Coding

### Tugas 3.2 — Rencana arsitektur dan konstitusi framework

**Tujuan.** Rencanakan otomasi toko demo sebelum Anda menulis kode Bagian IV–VI, dan tulis aturan yang akan Anda nilai terhadapnya nanti.

**Hasil yang diberikan.** `assignment-3-2/ARCHITECTURE.md`, `assignment-3-2/CONSTITUTION.md`.

**ARCHITECTURE.md** harus mencakup:

1. Diagram lapisan (mermaid atau ASCII) untuk mengotomasi toko demo — API *dan* web, meskipun Anda akan membangun API lebih dulu.
2. Rencana file: setiap file yang direncanakan ditetapkan ke sebuah lapisan. Minimal 12 file. Gunakan struktur buku (C.7) atau variannya yang dibenarkan.
3. Untuk **setiap** lapisan yang Anda pertahankan: satu duplikasi atau penggabungan bernama yang dihilangkannya. "Organisasi" bukan pembenaran.
4. Tiga contoh fungsi/kelas yang ditempatkan, dengan alasan satu baris.
5. Satu non-lapisan eksplisit: sesuatu yang Anda tolak untuk diekstrak sekarang, dan mengapa (aturan tiga).

**CONSTITUTION.md** — satu halaman, cukup spesifik untuk menolak PR berdasarkannya:

| Aturan yang diperlukan | Contoh spesifisitas yang cukup |
|---|---|
| Apa yang boleh ada di pengujian | "Tidak ada locator, tidak ada URL host mentah, tidak ada `fetch`" |
| Apa yang boleh ada di page/API | "Satu layar atau satu resource; tidak ada `expect` pada hasil bisnis" |
| Arah ketergantungan | "Tidak ada impor dari lapisan yang lebih rendah ke folder yang lebih tinggi" |
| Kapan mengekstrak | "Salinan ketiga dari panggilan HTTP menjadi klien" |
| Data | "Tidak ada email bersama yang dikodekan keras; factory menghasilkan id unik" |
| Artefak | "Laporan HTML + jejak pada kegagalan diperlukan di CI" |
| Cara Anda mengamandemen | "Ubah konstitusi dalam PR yang sama dengan pengecualiannya, dengan alasan" |

Anda akan menggunakan ini kembali dalam capstone. Kata sifat yang samar ("bersih," "DRY," "praktik terbaik") mendapat nilai sebagai aturan yang hilang.

**Cara ini dinilai.**

| Dimensi | Bobot | Nilai penuh |
|---|---|---|
| Pembenaran lapisan | 30% | Setiap lapisan yang dipertahankan menyebutkan sebuah duplikasi |
| Rencana file | 20% | 12+ file, konsisten dengan diagram |
| Spesifisitas konstitusi | 30% | Seorang reviewer bisa menolak PR hanya menggunakan halaman ini |
| Penilaian | 20% | Setidaknya satu ekstraksi yang ditolak; tidak ada seremonial enam lapisan untuk kepentingannya sendiri |

> **Penggunaan AI: terbatas.** "Struktur folder enterprise" yang dihasilkan tanpa duplikasi yang disebutkan gagal pada 30%.

---

## I. Kuis

Sembilan pertanyaan. Kunci jawaban: [`answer-keys/part-3/02-test-automation-architecture.answers.md`](../answer-keys/part-3/02-test-automation-architecture.answers.md).

**1.** Sebuah file pengujian berisi `page.locator("#submit").click()`. Masalah lapisannya adalah:

- A) Pengujian tidak boleh menggunakan `click`
- B) Locator milik lapisan halaman; pengujian seharusnya menyatakan niat
- C) Locator milik konfigurasi
- D) Tidak ada masalah

**2.** `OrdersApiClient.create()` menyertakan `expect(status).toBe(201)`. Mengapa itu adalah pelanggaran?

- A) Klien tidak boleh pernah melihat status
- B) Asersi hasil bisnis milik lapisan pengujian; klien menjadi tidak dapat digunakan kembali
- C) 201 sudah usang
- D) Asersi milik utilitas

**3.** `userFactory` mengimpor `LoginPage` untuk mengosongkan keranjang. Ini melanggar:

- A) AAA
- B) Aturan ketergantungan (ke atas / menyamping ke UI)
- C) Determinisme
- D) Aturan tiga

**4.** Benar atau salah: Lebih banyak lapisan selalu berarti framework yang lebih profesional.

**5.** `BasePage` memiliki sebelas method protected; dua yang digunakan. Langkah yang biasanya benar adalah:

- A) Tambahkan sembilan method lagi agar terpakai
- B) Hapus atau jangan perkenalkan permukaan yang tidak digunakan; ekstrak ketika duplikasi ada
- C) Pindahkan `BasePage` ke konfigurasi
- D) Kembalikan locator ke pengujian

**6.** Sebuah pengujian gagal di CI. Anda hanya punya `expect(received).toBe(expected)` dalam log. Apa yang hilang?

- A) Lebih banyak percobaan ulang
- B) Artefak dan asersi bernama — alat diagnostik
- C) Lapisan keenam
- D) `waitForTimeout`

**7.** Kapan Anda mengekstrak klien API?

- A) Sebelum pengujian pertama, dari template blog
- B) Pada salinan ketiga dari panggilan HTTP yang sama, ketika bagian yang dibagi terlihat
- C) Tidak pernah — duplikasi selalu lebih baik
- D) Ketika file memiliki 20 baris

**8.** Laporan HTML versus reporter JSON:

- A) Anda hanya butuh JSON
- B) HTML untuk manusia yang mendiagnosis jalannya; JSON/JUnit untuk mesin CI dan skrip
- C) Mereka adalah file yang sama
- D) Laporan hanya untuk manajer

**9.** Konstitusi Anda mengatakan locator tidak pernah muncul di `tests/`. Sebuah PR menempatkan satu dalam spesifikasi "hanya kali ini." Menurut kursus ini:

- A) Merge saja; aturan adalah panduan
- B) Tolak, atau amandemen konstitusi dalam PR yang sama dengan alasan
- C) Tambahkan percobaan ulang
- D) Pindahkan locator ke `helpers.ts`

---

## J. Ulasan

### Konsep kunci

| Konsep | Versi satu kalimat |
|---|---|
| Lapisan | Sebuah tanggung jawab, dibenarkan oleh duplikasi yang disebutkan |
| Lapisan pengujian | Apa yang seharusnya benar |
| Lapisan Page/API | Cara bicara dengan satu layar atau resource |
| Lapisan layanan | Multi-langkah "persiapkan dunia" |
| Lapisan utilitas | Bantuan generik; tidak ada halaman, tidak ada host |
| Konfigurasi | Apa yang berbeda per lingkungan |
| Aturan ketergantungan | Hanya ke bawah |
| Artefak | Bukti; baca sebelum Anda menjalankan ulang |
| Aturan tiga | Abstraksi ketika Anda bisa melihat polanya |
| Konstitusi | Aturan Anda, cukup spesifik untuk menolak PR |

### Rekap kesalahan

Locator dalam spesifikasi · asersi dalam klien · utilitas yang mengetahui halaman · lima lapisan untuk delapan pengujian · helper laci sampah · `BasePage` prematur · host dalam pengujian · tidak ada reporter · pohon yang disalin.

### Pemeriksaan kompetensi

> **Untuk setiap bagian kode dalam framework Anda, dapatkah Anda menyebutkan lapisannya dan duplikasi yang dihilangkan oleh lapisan itu?**

### Gerbang Bagian III

Sebelum [Bagian IV](../part-4-api-testing-and-automation/00-module-overview.md), diberikan file pengujian yang belum pernah Anda lihat, Anda bisa:

1. Menyebutkan sifat keandalan yang dilanggar setiap pengujian, jika ada ([Bab 3.1](01-principles-of-good-automated-tests.md)).
2. Menemukan Arrange, Act, dan Assert.
3. Menetapkan setiap bagian kode ke sebuah lapisan.

Bagian IV adalah tempat standar-standar ini bertemu sistem nyata. Tidak ada rendering dan tidak ada locator — jika sebuah pengujian tidak andal, itu adalah kesalahan pengujian Anda. Bawa konstitusinya.

---

[← 3.1 Prinsip-Prinsip Pengujian Otomatis yang Baik](01-principles-of-good-automated-tests.md) · [Berikutnya: Bagian IV — 4.1 Dasar-Dasar HTTP →](../part-4-api-testing-and-automation/01-http-fundamentals.md)

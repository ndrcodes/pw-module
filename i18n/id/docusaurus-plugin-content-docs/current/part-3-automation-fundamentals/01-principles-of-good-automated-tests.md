# Bab 3.1 — Prinsip-Prinsip Pengujian Otomatis yang Baik

🟡 **Menengah** · [Ikhtisar Bagian III](00-module-overview.md) · [Daftar Isi](../README.md)

| | |
|---|---|
| **Bagian** | III — Dasar-Dasar Otomasi Pengujian |
| **Perkiraan waktu** | 1 sesi (90 menit) + 4 jam kerja mandiri |
| **Bab prasyarat** | [Bagian I](../part-1-testing-fundamentals/00-module-overview.md), [Bagian II](../part-2-programming-fundamentals/00-module-overview.md) |
| **Bab berikutnya** | [3.2 Arsitektur Otomasi Pengujian](02-test-automation-architecture.md) |

---

> Ada pertanyaan yang lebih penting dari "apakah pengujian ini lulus?"
>
> **Apa yang harus rusak agar pengujian ini gagal?**
>
> Jika Anda tidak bisa menyelesaikan kalimat itu, pengujian belum selesai. Setiap rubrik proyek dalam kursus ini, dan [prosedur verifikasi evaluator](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders), adalah pertanyaan itu yang dibuat mekanis.

---

## A. Tujuan Pembelajaran

Di akhir bab ini Anda akan mampu:

1. **Mendefinisikan** kemandirian, isolasi, dan determinisme, serta **membedakannya** dengan contoh.
2. **Mengevaluasi** pengujian yang ada terhadap sifat-sifat tersebut dan **menyebutkan** mana yang dilanggar.
3. **Merestrukturisasi** pengujian menjadi fase Arrange → Act → Assert yang eksplisit.
4. **Menilai** apakah sebuah pengujian benar-benar bisa gagal, dan **memperkuat** asersi yang tidak bisa.
5. **Memilih** antara setup/teardown bersama dan pembuatan data per-pengujian, dan **membenarkan** pilihan tersebut.
6. **Menjelaskan** mengapa rangkaian pengujian yang tidak dipercaya memiliki nilai negatif, dan **menggambarkan** bagaimana kepercayaan hilang.

---

## B. Pengetahuan Prasyarat

| Diperlukan | Dari |
|---|---|
| Kualitas kasus uji: atomik, deterministik, dapat diverifikasi | [Bab 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) |
| Rangkaian pengujian yang tidak dipercaya memiliki nilai negatif | [Bab 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) |
| Fungsi, array, objek, antarmuka | [Bab 2.7–2.10](../part-2-programming-fundamentals/00-module-overview.md) |
| `async`/`await` | [Bab 2.12](../part-2-programming-fundamentals/12-asynchronous-programming.md) |
| Pengalaman kode terduplikasi Anda sendiri | Proyek 1 dan 2 |

Bab 1.4 mengajarkan sifat-sifat ini sebagai kualitas kasus uji *tertulis*. Bab ini mengajarkannya sebagai kualitas pengujian *yang dapat dieksekusi*. Namanya sama; mode kegagalannya kini adalah kode.

---

## C. Penjelasan Konsep

### C.1 Pertanyaan falsifiabilitas

Sebuah pengujian adalah sebuah eksperimen. Eksperimen yang tidak bisa menghasilkan hasil negatif bukanlah eksperimen.

```ts
test("user can log in", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: { email: "user@example.com", password: "wrong-password" },
  });
  expect(response).toBeTruthy();           // objek respons selalu truthy
  expect(response.status()).toBeDefined(); // status selalu terdefinisi
});
```

Apa yang harus rusak di aplikasi agar pengujian ini menjadi merah? **Tidak ada.** Kata sandinya salah, login bisa mengembalikan 401 atau 500 atau HTML, dan kedua asersi tetap lulus. Pengujian berjalan. Ini melaporkan cakupan. Ini tidak melindungi apa pun.

Ini adalah Demo 1 dari [catatan instruktur](instructor-notes.md). Ini juga merupakan cacat paling umum dalam rangkaian pengujian pemula dan hal pertama yang dicari oleh reviewer berpengalaman. [Strategi Penilaian §8](../00-course-overview/04-assessment-strategy.md#8-common-failure-modes-across-all-submissions) mencantumkan `expect(response.ok()).toBeTruthy()` sebagai satu-satunya asersi dengan alasan yang sama: 2xx apa pun lulus; hampir tidak ada yang diverifikasi.

**Kalimat yang harus diselesaikan setiap pengujian:**

> Pengujian ini gagal jika ________.

Untuk pengujian login: *pengujian ini gagal jika pengguna yang valid tidak bisa mendapatkan sesi.* Kemudian tulis asersi yang membuat kalimat itu benar — status, bentuk body, token yang benar-benar ada, permintaan lanjutan yang menggunakannya.

Jika Anda tidak bisa menulis kalimatnya, hapus pengujian atau selesaikan. Jangan kirimkan lampu hijau yang tidak terhubung ke apa pun.

### C.2 Asersi lemah, dan penggantinya yang kuat

| Lemah | Yang sebenarnya dibuktikannya | Pengganti yang kuat |
|---|---|---|
| `expect(response).toBeTruthy()` | Sebuah objek ada | `expect(response.status()).toBe(201)` |
| `expect(response.status()).toBeDefined()` | HTTP memiliki status | `expect(response.status()).toBe(201)` |
| `expect(response.ok()).toBeTruthy()` | Beberapa 2xx terjadi | Status **dan** field yang mengidentifikasi resource yang dibuat |
| `expect(body).toBeTruthy()` | Parse mengembalikan sesuatu | `expect(body.id).toMatch(/^ORD-\d{6}$/)` |
| `expect(page).toBeDefined()` | Playwright memberi Anda halaman | Asersi web-first pada hasil yang terlihat pengguna |
| `expect(true).toBe(true)` | Aritmatika berfungsi | Hapus saja |
| `expect(items.length).toBeGreaterThan(0)` | Daftarnya tidak kosong | `expect(items.map(i => i.id)).toContain(seededId)` |
| `expect(message).toContain("success")` | Beberapa string menyertakan substring itu | Pesan kontrak yang tepat, atau sebuah kode |

Polanya: asersi lemah memeriksa bahwa *sesuatu terjadi*. Asersi kuat memeriksa bahwa *hal yang Anda klaim terjadi, memang terjadi, untuk data yang Anda buat.*

Pengujian dengan lima asersi lemah tidak lebih aman dari pengujian dengan satu asersi. Itu adalah lima cara untuk tetap hijau.

### C.3 Kemandirian — hubungan antar pengujian

**Kemandirian** berarti: pengujian ini tidak membutuhkan pengujian lain yang telah berjalan lebih dulu. Anda bisa menjalankannya sendiri, dalam urutan apa pun, pada lingkungan yang baru, dan hasilnya sama.

```ts
test("1. buat produk", async () => { /* POST /products → id disimpan di global */ });
test("2. ubah produk", async () => { /* PATCH id dari pengujian 1 */ });
test("3. hapus produk", async () => { /* DELETE id dari pengujian 1 */ });
```

Jalankan file: hijau. `npx playwright test --grep "edit product"`: merah. `--workers=2`: merah, secara tidak menentu.

Itulah Demo 2. Ini juga [langkah evaluator 5](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders): urutan diacak atau dibalik, dan `--workers=1` versus `--workers=4`. Ketergantungan urutan adalah cacat keandalan, bukan catatan gaya.

**Cara memverifikasi kemandirian secara mekanis:**

1. Jalankan pengujian **sendirian**.
2. Jalankan file **terbalik** (atau diacak).
3. Jalankan dengan **beberapa workers**.

Jika salah satu perubahan itu mengubah hasilnya, pengujian tidak mandiri. [Bab 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) tidak menciptakan masalah ini. Ia *mengungkapnya*. Masalahnya selalu ada; eksekusi serial menyembunyikannya.

Kemandirian berkaitan dengan **urutan, data, dan state** — bukan tentang "tidak ada variabel bersama di file." Dua pengujian yang tidak pernah saling menyebutkan masih bisa tergabung jika keduanya mengasumsikan "pengguna admin memiliki keranjang kosong."

### C.4 Isolasi — radius ledakan

**Isolasi** berarti: pengujian ini tidak mengganggu apa pun yang diandalkan pengujian lain.

Kemandirian dan isolasi mudah tertukar. Buatlah konkret:

| | Pertanyaan | Bentuk kegagalan |
|---|---|---|
| **Kemandirian** | Apakah A membutuhkan B berjalan lebih dulu? | A gagal saat dijalankan sendiri |
| **Isolasi** | Apakah A menyentuh sesuatu yang juga disentuh B? | A dan B lulus sendiri, gagal (atau tidak stabil) bersama |

Sebuah pengujian bisa **mandiri tapi tidak terisolasi**. Tidak membuat apa pun; tidak membutuhkan pengujian sebelumnya; ia memutasi keranjang `admin@shop.test` yang dibagi. Dijalankan sendiri: hijau. Dijalankan bersama rangkaian kolega pukul 4 sore: "keranjang sudah memiliki item."

Demo 3 adalah dua orang yang menjalankan pengujian registrasi yang sama dengan `user@example.com`. Salah satunya mendapat "email sudah ada." Data bersama yang dikodekan keras bukan berarti hati-hati. Itu adalah tabrakan yang dijadwalkan nanti.

**Mengisolasi pengujian bukan berarti mengisolasi sistem.** Pengujian end-to-end berbagi aplikasi nyata. Anda tidak bisa memberi setiap pengujian alam semestanya sendiri. Anda *bisa* memberi setiap pengujian **datanya** sendiri: email unik, SKU unik, pesanan unik. Data unik dapat dicapai di mana saja. Fatalisasi ("isolasi tidak mungkin di E2E") biasanya berarti rangkaian dibangun di atas data bersama yang sudah ada.

### C.5 Determinisme — vonis stabil, bukan data beku

**Determinisme** berarti: state sistem yang sama menghasilkan hasil yang sama. *Vonis*-nya stabil.

Ini **tidak** berarti "tidak ada nilai acak."

```ts
const email = "user1@test.com";          // terlihat deterministik; tabrakan di bawah paralel
const email = `buyer-${crypto.randomUUID()}@shop.test`;  // data acak, vonis stabil
```

Identitas bersama yang dikodekan keras adalah pilihan yang paling *tidak* deterministik begitu ada dua workers atau dua engineer. Data **unik** yang acak menstabilkan vonis karena tabrakan menghilang.

Teknik lain, sudah diperkenalkan di [Bab 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md):

| Teknik | Daripada | Gunakan |
|---|---|---|
| Waktu absolut | "bulan lalu" | `2026-03-01` hingga `2026-03-31` |
| Batas yang di-seed | "semua pesanan" | Empat pesanan yang diketahui, dua di luar jendela |
| Asersi relatif | `expect(stock).toBe(41)` | `expect(stock).toBe(before - 1)` |
| Id yang ditangkap | "pesanan terbaru" | Id yang *pengujian ini* buat |

Ketika sistem benar-benar memiliki state — tingkat stok, nomor pesanan berurutan, batas tarif — jangan berpura-pura aplikasi adalah fungsi murni. Buat data Anda sendiri. Asersi pada **hubungan**, bukan angka ajaib. Beberapa pemeriksaan cocok di lapisan yang lebih rendah ([Bab 1.3](../part-1-testing-fundamentals/03-test-strategy-and-the-test-pyramid.md)): Anda tidak perlu pengujian E2E untuk membuktikan aritmatika pada total baris.

Mengontrol waktu dan keacakan adalah perhatian framework nanti ([Bab 6.4](../part-6-framework-engineering/04-test-data-management.md)). Prinsipnya sekarang: jika vonis bergantung pada jam, database yang tersisa, atau siapa yang terakhir berjalan, pengujian tidak deterministik.

### C.6 Arrange → Act → Assert adalah sebuah batasan

**Arrange** — siapkan dunia (data, autentikasi, navigasi ke titik awal).
**Act** — lakukan **satu** tindakan berarti (perilaku yang diuji).
**Assert** — verifikasi hasilnya.

AAA bukan konvensi komentar. Komentar yang bertuliskan `// Arrange` di atas kode yang kusut tidak membuatnya menjadi AAA. Batasannya adalah:

- Tidak ada asersi selama Arrange.
- Tidak ada setup baru selama Assert.
- Act adalah satu perilaku, bukan tur.

```ts
// SEBELUM — tercampur, lima perilaku, nama kegagalan tidak memberi tahu apa pun
test("checkout", async ({ request }) => {
  const user = await createUser();
  expect(user.id).toBeTruthy();
  const product = await createProduct({ price: 49.5 });
  await addToCart(user, product);
  expect((await getCart(user)).items).toHaveLength(1);
  const order = await checkout(user, { card: "valid" });
  expect(order.status).toBe("confirmed");
  await addToCart(user, product); // sisa keranjang dari ide sebelumnya
  expect((await getCart(user)).items).toHaveLength(0);
});
```

```ts
// SESUDAH — satu alasan untuk gagal
test("checkout dengan kartu valid mengkonfirmasi pesanan dan mengembalikan id ORD-", async ({ request }) => {
  // Arrange
  const user = await createUser();
  const product = await createProduct({ price: 49.5 });
  await addToCart(user, product);

  // Act
  const order = await checkout(user, { card: "valid" });

  // Assert
  expect(order.status, "pesanan seharusnya dikonfirmasi").toBe("confirmed");
  expect(order.id, "konfirmasi seharusnya membawa nomor pesanan").toMatch(/^ORD-\d{6}$/);
});
```

Setelah penulisan ulang, dua hal menjadi jelas: untuk apa pengujian ini *ada*, dan apa arti sebuah kegagalan. Itulah Demo 4. Audiens untuk pengujian yang gagal adalah orang yang lelah yang tidak menulisnya. AAA adalah cara Anda menulis untuk orang itu.

Keranjang-kosong-setelah-checkout adalah **pengujian yang berbeda**. Persilangan ambang pengiriman adalah pengujian yang berbeda. [Bab 1.4](../part-1-testing-fundamentals/04-regression-smoke-sanity-and-test-quality.md) menyebut ini atomisitas. Satu alasan untuk gagal adalah bentuk kode yang dapat dieksekusi dari aturan itu.

Jika sebuah pengujian mengasersi lima hal yang tidak terkait dan gagal, laporan mengatakan nama pengujian dan asersi pertama. Anda tidak tahu perilaku mana yang rusak tanpa membaca isinya. Pisahkan.

### C.7 Setup dan teardown — kecepatan tidak gratis

| Strategi | Apa yang dibagi | Kapan dibenarkan | Biaya khas |
|---|---|---|---|
| **Pembuatan per-pengujian** | Tidak ada | Default. Pengguna unik, produk unik, pesanan unik | Lebih lambat; dapat dipercaya |
| **`beforeEach`** | Kode setup, bukan *state* mutable | Pengaturan identik yang mahal yang tidak bocor | Baik-baik saja jika setiap pengujian masih memiliki datanya sendiri |
| **`beforeAll`** | Satu objek untuk seluruh file | Data referensi yang benar-benar tidak dapat diubah (fixture katalog yang tidak akan Anda edit) | Berbahaya begitu satu pengujian memutasinya |
| **Data lingkungan bersama** | Pengguna / produk / pesanan nyata yang semua orang tahu | Hampir tidak pernah, dalam kursus ini | Tabrakan, ketergantungan urutan, kegagalan hari Selasa |

"`beforeAll` adalah opsi cepat" adalah kesalahpahaman. Kecepatan yang dibeli dengan state mutable yang dibagi dibayar kembali dengan kegagalan yang hanya muncul ketika satu pengujian dijalankan sendiri — atau hanya ketika *tidak*.

**Pembersihan yang berada di bagian bawah body pengujian dilewati saat gagal.** Pengujian melempar; penghapusan tidak pernah berjalan; jalannya berikutnya bertabrakan dengan sisa. Teardown milik mekanisme yang **selalu berjalan** — teardown fixture Playwright, `try`/`finally`, `afterEach` yang tidak mengasumsikan keberhasilan. [Bab 6.2](../part-6-framework-engineering/02-fixtures.md) adalah mekanisme itu. Prinsipnya sekarang: **jika pengujian mati di tengah jalan, apa yang tersisa?**

Reset lingkungan malam bukan pembersihan. Dua engineer pukul 4 sore tidak menunggu tengah malam.

### C.8 Nama adalah spesifikasi

```ts
test("test login", async () => { /* ... */ });
test("user can log in", async () => { /* ... */ });
test("login with valid credentials returns 200 and a session token", async () => { /* ... */ });
```

Yang pertama menyebutkan topik. Yang kedua menyebutkan harapan. Yang ketiga menyebutkan perilaku yang diharapkan — dan menyelesaikan kalimat falsifiabilitas.

Namai **hasil**, bukan langkah-langkahnya. "Tambahkan lampu, pergi ke keranjang, klik checkout, isi kartu" adalah sebuah skrip. "Checkout dengan kartu valid mengkonfirmasi pesanan" adalah spesifikasi. Ketika gagal di CI pukul 2 pagi, nama adalah artefak pertama.

### C.9 Penggunaan kembali versus aturan tiga

Duplikasi lebih murah daripada abstraksi yang salah.

**Aturan tiga:** duplikasi dua kali; abstraksi pada kemunculan ketiga, ketika Anda bisa melihat polanya. Helper yang digunakan sekali dan diparameterisasi enam cara bukan penggunaan kembali. Itu adalah teka-teki yang harus diselesaikan oleh pembaca berikutnya.

Bab ini menamai aturannya. [Bab 3.2](02-test-automation-architecture.md) menerapkannya pada lapisan. Jangan ekstrak `loginAndCheckoutAndAssert` pada pengujian pertama yang membutuhkan login.

### C.10 Persamaan kepercayaan

[Bab 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) mengatakan rangkaian pengujian yang tidak dipercaya memiliki **nilai negatif**: ia menghabiskan biaya, menyembunyikan kegagalan nyata dalam kebisingan, dan menekan pengujian manual yang seharusnya telah menangkapnya.

Kepercayaan hilang satu jalan pintas yang masuk akal dalam satu waktu:

1. Asersi lemah untuk "membuatnya hijau."
2. Pengguna bersama karena membuat pengguna itu lambat.
3. Login `beforeAll` yang dimutasi oleh pengujian selanjutnya.
4. Pembersihan hanya di jalur sukses.
5. Percobaan ulang "hanya untuk flake itu."
6. Tim mulai menjalankan ulang build merah sebelum membacanya.
7. Merah berarti "mungkin baik-baik saja." Rangkaian kini hanya dekorasi.

**40 pengujian flaky kurang nilainya dari 10 pengujian yang andal.** Keandalan, pemeliharaan, dan kecepatan adalah batasan desain, bukan aspirasi yang Anda tambahkan nanti. Anda tidak bisa menambahkan kepercayaan belakangan. Anda hanya bisa berhenti membelanjakannya.

Percobaan ulang bukan strategi keandalan. Itu adalah cara untuk menyembunyikan perlombaan. Kursus ini membatasi percobaan ulang (satu, pada capstone, dan Anda harus membenarkannya). Jika sebuah pengujian perlu dicoba ulang untuk lulus, pengujian atau aplikasinya tidak deterministik. Perbaiki itu.

---

## D. Konteks QA

### D.1 Evaluator sudah menjalankan bab ini

[Strategi Penilaian §7](../00-course-overview/04-assessment-strategy.md#7-verification-procedure-used-by-graders) adalah sifat-sifat di atas sebagai daftar periksa:

| Langkah evaluator | Sifat |
|---|---|
| Jalankan dua kali; vonis tidak boleh berubah | Determinisme |
| Urutan terbalik / beberapa workers | Kemandirian (dan isolasi, jika tabrakan muncul) |
| Sengaja rusak aplikasinya; pengujian harus menjadi merah | Falsifiabilitas |
| Jejak/laporan mengidentifikasi penyebab tanpa menjalankan ulang | AAA + asersi bernama + artefak ([Bab 3.2](02-test-automation-architecture.md)) |

Langkah 7 — rusak dengan sengaja — adalah langkah yang paling sering tidak dilakukan oleh peserta. Bagian IV akan memerlukannya di setiap skenario. Latih kalimatnya sekarang.

### D.2 Paralelisme adalah ujiannya

[Bab 6.7](../part-6-framework-engineering/07-parallel-execution-and-sharding.md) mengaktifkan workers dan shard. Setiap jalan pintas isolasi yang Anda ambil di Bagian IV–V menjadi flake di sana. Merancang untuk kemandirian sekarang lebih murah daripada men-debug tabrakan di Minggu 22.

### D.3 Kegagalan organisasional

Tim yang tidak bisa mempercaya rangkaian pengujian berhenti memperlakukan merah sebagai informasi. Mereka menjalankan ulang. Mereka melewati. Mereka merge saat kuning. Rangkaian masih "mencakup" produk. Cacat dikirimkan dengan pipeline yang kehijau-hijauan. Itulah [Bab 1.2](../part-1-testing-fundamentals/02-manual-vs-automation-testing.md) C.9 dalam standup, bukan buku teks.

Pekerjaan Anda bukan memaksimalkan jumlah pengujian. Ini adalah menjaga rangkaian dalam kumpulan hal-hal yang akan ditindaklanjuti oleh tim.

---

## E. Contoh Kode

### E.1 Sangat sederhana — tidak bisa gagal, lalu bisa

```ts
test("buat pesanan — tidak bisa gagal", async ({ request }) => {
  const response = await request.post("/api/orders", { data: { sku: "LAMP" } });
  expect(response).toBeTruthy();
});

test("buat pesanan — gagal jika pesanan tidak dibuat", async ({ request }) => {
  const response = await request.post("/api/orders", { data: { sku: "LAMP", qty: 1 } });
  expect(response.status(), "pesanan seharusnya dibuat").toBe(201);
  const body = await response.json();
  expect(body.id, "pesanan yang dibuat seharusnya memiliki id ORD-").toMatch(/^ORD-\d{6}$/);
});
```

Rusak handler-nya sehingga mengembalikan 500. Hanya pengujian kedua yang menjadi merah. Itulah intinya.

### E.2 Praktis — bergantung urutan, lalu mandiri

```ts
// Tergabung — jangan tulis ini
let productId: string;
test("buat", async () => { productId = await createProduct("LAMP"); });
test("ubah nama", async () => { await renameProduct(productId, "Aeron Lamp"); });
test("hapus", async () => { await deleteProduct(productId); });

// Mandiri — setiap pengujian memiliki datanya sendiri
test("membuat produk mengembalikan SKU", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  expect(product.sku).toMatch(/^LAMP-/);
});

test("mengubah nama produk memperbarui judul katalog", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  const updated = await renameProduct(product.id, "Aeron Lamp");
  expect(updated.title).toBe("Aeron Lamp");
});

test("menghapus produk menghapusnya dari GET /products/:id", async () => {
  const product = await createProduct(`LAMP-${id()}`);
  await deleteProduct(product.id);
  const response = await getProduct(product.id);
  expect(response.status()).toBe(404);
});
```

Ya, Anda membuat tiga produk, bukan satu. Itulah harga rangkaian pengujian yang bisa Anda debug.

### E.3 Berorientasi QA — penyelamatan AAA

Ambil pengujian 40-baris mana saja yang Anda tulis di lingkungan Proyek 2 (atau `checkout` yang kusut di C.6). Gambar tiga kotak. Pindahkan setiap baris ke dalam satu kotak. Jika sebuah baris tidak cocok, itu adalah pengujian kedua atau setup yang tersisa.

Kemudian tulis kalimat falsifiabilitas. Jika Anda perlu "atau" dalam kalimat, Anda memiliki dua pengujian.

### E.4 Berorientasi otomasi — tabrakan, lalu data unik

```ts
const SHARED = "admin@shop.test";

test("admin dapat menambahkan lampu ke keranjang", async () => {
  await login(SHARED);
  await addToCart("LAMP");
  expect(await cartCount(SHARED)).toBe(1);  // gagal jika saudara pengujian juga menambahkan
});

test("keranjang admin — terisolasi", async () => {
  const admin = await createUser({ role: "admin", email: `admin-${id()}@shop.test` });
  await addToCart(admin, "LAMP");
  expect(await cartCount(admin)).toBe(1);
});
```

Jalankan pasangan pertama dengan dua workers. Lalu yang kedua. Perbedaannya adalah isi bab ini.

---

## F. Kesalahan Umum

### F.1 Asersi yang tidak bisa gagal

`toBeTruthy()` pada sebuah objek. `toBeDefined()` pada sebuah status. `ok()` sebagai satu-satunya pemeriksaan. Lihat C.2.

### F.2 Ketergantungan urutan

Pengujian 2 mengedit apa yang dibuat oleh pengujian 1. Gagal dengan `--grep` dan workers. Lihat C.3.

### F.3 Akun login bersama

`admin@shop.test` / `user1` yang dimutasi oleh semua orang. Terlihat mandiri, tapi tidak terisolasi. Lihat C.4.

### F.4 Id yang dikodekan keras dari database yang diintip

`expect(order).toBe("ORD-000041")` berfungsi di laptop Anda sampai lingkungan direset. Langkah evaluator 2.

### F.5 Setup `beforeAll` yang dimodifikasi oleh pengujian selanjutnya

Pengujian pertama yang berjalan "menang." Sendiri versus bersama tidak setuju.

### F.6 Pembersihan di bagian bawah body pengujian

Dilewati saat throw. Sisa menjadi flake hari esok.

### F.7 Satu pengujian, enam perilaku

Kegagalan menyebutkan nama pengujian, bukan perilaku. Pisahkan. Lihat C.6.

### F.8 Nama yang menggambarkan langkah-langkah

"Klik checkout dan isi formulir." Namai hasilnya.

### F.9 Abstraksi pada duplikasi pertama

Helper `doEverything(options)` setelah satu copy-paste. Tunggu yang ketiga. Lihat C.9.

### F.10 Percobaan ulang sebagai keandalan

Flake masih ada. Anda hanya meminta CI untuk melempar dadu lagi.

---

## G. Latihan

Waktu total yang disarankan: 90 menit.

### G.1 Mudah — Apa yang ini buktikan? (20 menit)

Untuk setiap asersi, tulis satu kalimat: *apa yang ini sebenarnya buktikan.* Kemudian tulis ulang lima yang paling lemah sehingga bisa gagal karena cacat nyata.

```ts
expect(response).toBeTruthy();
expect(response.status()).toBeDefined();
expect(response.ok()).toBe(true);
expect(body.id).toMatch(/^ORD-\d{6}$/);
expect(body.items.length).toBeGreaterThan(0);
expect(page).toBeDefined();
expect(await title.textContent()).toBe("Order confirmed");
expect(true).toBe(true);
expect(stock).toBe(41);
expect(email).toBe("user1@test.com");
```

### G.2 Menengah — Audit lima pengujian (35 menit)

Anda akan diberikan (atau Anda akan menulis) lima pengujian singkat yang masing-masing melanggar **satu** sifat utama. Untuk setiap pengujian, berikan:

| Field | Diperlukan |
|---|---|
| Sifat yang dilanggar | kemandirian / isolasi / determinisme / falsifiabilitas / AAA / pembersihan |
| Gejala | apa yang akan diamati oleh evaluator atau kolega |
| Perbaikan | satu perubahan konkret, bukan "buat lebih baik" |

Penalaran lebih penting dari labelnya. Label yang salah dengan mekanisme yang benar mendapat nilai lebih tinggi dari label yang beruntung.

### G.3 Tantangan — Ketergantungan tersembunyi (35 menit)

File lima pengujian dengan tiga ketergantungan urutan tersembunyi (shared `let`, pengguna bersama, keranjang yang tersisa). Buat setiap pengujian lulus:

1. sendiri,
2. dengan file terbalik,
3. dengan empat workers.

Kemudian satu paragraf: resource bersama mana yang menyebabkan setiap ketergantungan. Jangan klaim "itu flaky." Sebutkan resource-nya.

---

## H. Tugas Coding

### Tugas 3.1 — Audit dan perbaikan rangkaian pengujian

**Tujuan.** Diberikan sebuah rangkaian yang lulus hari ini dan melanggar beberapa sifat keandalan, hasilkan audit tertulis, rangkaian yang diperbaiki, dan bukti bahwa setiap pengujian yang diperbaiki masih gagal ketika perilakunya rusak.

**Hasil yang diberikan.** `assignment-3-1/AUDIT.md`, pengujian yang diperbaiki di bawah `assignment-3-1/tests/`, `PROOF.md`.

Jika tidak ada rangkaian yang disediakan, **tulis rangkaian yang rusak lebih dulu** (setidaknya lima pengujian, setidaknya empat jenis pelanggaran berbeda dari C.3–C.7), commit, lalu perbaiki. Kedua versi tetap ada di riwayat git (atau di `broken/` dan `repaired/`).

**AUDIT.md** — satu bagian per pengujian:

1. Kalimat falsifiabilitas (bahkan jika pengujian saat ini tidak bisa memenuhinya).
2. Sifat yang dilanggar dan mekanismenya.
3. Gejala yang diharapkan (sendiri / terbalik / workers / "masih hijau saat rusak").
4. Perbaikan yang diusulkan.

**Rangkaian yang diperbaiki**

- Setiap pengujian menyelesaikan kalimat falsifiabilitas dalam komentar di atasnya.
- Lulus sendiri, terbalik, dan dengan `--workers=4` (dokumentasikan perintahnya di `PROOF.md`).
- Data unik; tidak ada data `beforeAll` yang mutable dan dibagi; teardown yang berjalan saat gagal.
- AAA terlihat tanpa bergantung pada komentar saja (baris kosong / struktur).
- Asersi kuat (C.2).

**PROOF.md**

Untuk **setiap** pengujian yang diperbaiki: apa yang Anda rusak dengan sengaja, dan bahwa pengujian menjadi merah. Rangkaian yang hanya tetap hijau belum dinilai.

**Persyaratan.**

| # | Persyaratan |
|---|---|
| 1 | Setidaknya empat jenis pelanggaran disebutkan dalam audit |
| 2 | Pengujian yang diperbaiki mandiri dan terisolasi seperti yang didefinisikan di C.3–C.4 |
| 3 | Bukti rusak-dengan-sengaja per pengujian |
| 4 | Tidak ada `waitForTimeout` / `sleep` |
| 5 | Tidak ada percobaan ulang yang digunakan untuk "memperbaiki" flake yang tersisa |

**Cara ini dinilai.**

| Dimensi | Bobot | Nilai penuh |
|---|---|---|
| Penalaran audit | 30% | Mekanisme disebutkan; gejala diprediksi; label boleh sedikit salah |
| Perbaikan | 30% | Sendiri / terbalik / workers bertahan |
| Bukti falsifiabilitas | 25% | Setiap pengujian ditunjukkan merah saat perilakunya rusak |
| Asersi dan AAA | 15% | Asersi kuat; satu alasan untuk gagal |

> **Penggunaan AI: terbatas.** Audit adalah penilaian. Tabel label yang dihasilkan AI tanpa mekanisme mendapat nilai mendekati nol pada 30%.

---

## I. Kuis

Sembilan pertanyaan. Kunci jawaban: [`answer-keys/part-3/01-principles-of-good-automated-tests.answers.md`](../answer-keys/part-3/01-principles-of-good-automated-tests.answers.md).

**1.** `expect(response).toBeTruthy()` setelah `request.post` lemah karena:

- A) POST sudah usang
- B) Objek respons selalu truthy, sehingga tidak ada cacat aplikasi yang bisa menggagalkan pengujian
- C) Playwright melarang `toBeTruthy`
- D) Terlalu lambat

**2.** Pengujian A membuat sebuah produk. Pengujian B mengedit "produk yang dibuat A," menggunakan shared `let`. B terutama kekurangan:

- A) Hanya isolasi
- B) Kemandirian (tidak bisa berjalan sendiri)
- C) Lapisan layanan
- D) Percobaan ulang

**3.** Dua pengujian keduanya menggunakan `admin@shop.test` dan memutasi keranjang. Masing-masing lulus sendiri. Bersama, mereka flaky. Sifat yang hilang adalah:

- A) Kemandirian (urutan)
- B) Isolasi (data mutable yang dibagi)
- C) AAA
- D) Penamaan

**4.** Benar atau salah: Determinisme berarti pengujian tidak boleh menggunakan nilai acak.

**5.** Sebuah pengujian mengasersi login, tambah-ke-keranjang, diskon, checkout, dan riwayat-pesanan dalam satu body. Masalah utama keandalan/pemeliharaan adalah:

- A) Terlalu cepat
- B) Kegagalan tidak menyebutkan perilaku mana yang rusak; pengujian memiliki banyak alasan untuk gagal
- C) Menggunakan `await`
- D) Membutuhkan `beforeAll`

**6.** Pembersihan yang ditulis sebagai baris terakhir dari body pengujian berisiko karena:

- A) Playwright mengabaikannya
- B) Baris-baris itu dilewati jika asersi sebelumnya melempar
- C) Pembersihan selalu ilegal
- D) Membuat pengujian mandiri

**7.** `beforeAll` sesuai ketika:

- A) Anda ingin pengujian berbagi keranjang yang akan mereka modifikasi
- B) Data yang dibagi adalah data referensi yang tidak dapat diubah yang tidak akan diedit oleh file ini
- C) Selalu — lebih cepat
- D) Tidak pernah

**8.** Setup mana yang paling mungkin tetap deterministik dengan dua workers?

- A) `email: "user1@test.com"`
- B) `email: \`buyer-${crypto.randomUUID()}@shop.test\``
- C) Membaca pengguna apa pun yang ditinggalkan oleh pengujian sebelumnya yang masih masuk
- D) Id pesanan yang dikodekan keras dari database hari Selasa lalu

**9.** Sebuah pengujian gagal di CI semalam dan lulus pagi ini. Langkah pertama Anda:

- A) Jalankan ulang sampai hijau
- B) Baca artefaknya (laporan, jejak, asersi bernama) dari jalannya yang gagal
- C) Tambahkan percobaan ulang
- D) Hapus pengujian

---

## J. Ulasan

### Konsep kunci

| Konsep | Versi satu kalimat |
|---|---|
| Falsifiabilitas | Pengujian ini gagal jika ___ |
| Kemandirian | Tidak membutuhkan pengujian lain yang telah berjalan lebih dulu |
| Isolasi | Tidak mengganggu apa yang diandalkan pengujian lain |
| Determinisme | State sistem yang sama → vonis yang sama (data unik sering kali *membantu*) |
| AAA | Siapkan dunia, satu tindakan, lalu asersi — tanpa pencampuran |
| Satu alasan untuk gagal | Atomisitas, dapat dieksekusi |
| Teardown | Harus berjalan ketika pengujian mati di tengah jalan |
| Aturan tiga | Duplikasi dua kali; abstraksi pada yang ketiga |
| Kepercayaan | 40 flake < 10 pengujian andal; rangkaian yang tidak dipercaya memiliki nilai negatif |

### Rekap kesalahan

Asersi yang tidak bisa gagal · ketergantungan urutan · akun bersama · id yang diintip · `beforeAll` mutable · pembersihan-hanya-di-sukses · mega-pengujian · nama langkah · abstraksi awal · percobaan ulang sebagai strategi.

### Pemeriksaan kompetensi

> **Untuk setiap pengujian yang Anda tulis mulai sekarang, dapatkah Anda menyelesaikan kalimat "pengujian ini gagal jika ___"?**

Jika tidak, pengujian belum selesai. Kalimat itu adalah gerbang masuk ke Bagian IV.

---

[← Ikhtisar Bagian III](00-module-overview.md) · [Berikutnya: 3.2 Arsitektur Otomasi Pengujian →](02-test-automation-architecture.md)

# Konten modul belajar (markdown)

Konten UI modul belajar Playwright diambil dari folder ini supaya mudah diedit tanpa ubah komponen React.

## Struktur folder

```text
learn-content/playwright/
  phase-0/          # Orientasi
  phase-1/          # Fondasi
  ...
  phase-N/
    NN-slug.mdsource  # Satu file = satu modul (step)
```

Daftar modul, judul, checklist, dan urutan ada di `src/learn/playwright/manifest.ts`. Setiap modul mengimpor file `.md` yang sesuai.

## Media di markdown

- **Gambar:** `![alt](/img/learn/gambar.svg)` (file di `static/img/learn/`)
- **Video YouTube atau MP4:** blok fenced:

```markdown
```video
https://www.youtube.com/watch?v=VIDEO_ID
```
```

Path lokal: `/img/learn/demo.mp4` (relatif ke `static/`).

## Menambah modul baru

1. Tambah file `.mdsource` di phase yang tepat.
2. Daftarkan step di `STEPS` pada `manifest.ts` (id, phaseId, title, summary, import body, checklist).

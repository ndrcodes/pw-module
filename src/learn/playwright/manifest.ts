import phase0_00 from '@site/learn-content/playwright/phase-0/00-kenalan-track.mdsource';
import phase0_01 from '@site/learn-content/playwright/phase-0/01-persiapan-lab.mdsource';
import phase1_00 from '@site/learn-content/playwright/phase-1/00-browser-context-page.mdsource';
import phase1_01 from '@site/learn-content/playwright/phase-1/01-test-browser-pertama.mdsource';
import phase2_00 from '@site/learn-content/playwright/phase-2/00-strategi-locator.mdsource';
import phase2_01 from '@site/learn-content/playwright/phase-2/01-locator-praktik.mdsource';
import phase3_00 from '@site/learn-content/playwright/phase-3/00-aksi-browser.mdsource';
import phase3_01 from '@site/learn-content/playwright/phase-3/01-interaksi-lanjutan.mdsource';
import phase4_00 from '@site/learn-content/playwright/phase-4/00-web-assertions.mdsource';
import phase5_00 from '@site/learn-content/playwright/phase-5/00-auto-wait.mdsource';
import phase5_01 from '@site/learn-content/playwright/phase-5/01-hindari-flaky.mdsource';
import phase6_00 from '@site/learn-content/playwright/phase-6/00-selesai.mdsource';

function mdBody(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new Error('Learn content must be imported as raw markdown string');
  }
  return raw;
}

export const PROGRESS_STORAGE_KEY = 'pw-module-learn-playwright-v1';

export type LearnStep = {
  id: string;
  phaseId: string;
  title: string;
  summary: string;
  body: string;
  checklist: string[];
};

export type LearnPhase = {
  id: string;
  title: string;
};

export const TRACK_META = {
  id: 'playwright',
  kicker: 'TRACK 05 · WEB AUTOMATION',
  level: 'Level menengah',
  title: 'Playwright untuk QA Automation',
  description:
    'Belajar otomasi browser step-by-step: dari Browser/Context/Page sampai locator, aksi, assertion, dan cara nge-handle test yang suka ngambek tanpa numpuk `sleep`.',
  phasesCount: 6,
};

export const PHASES: LearnPhase[] = [
  {id: '0', title: 'Orientasi & setup'},
  {id: '1', title: 'Fondasi Playwright'},
  {id: '2', title: 'Locator yang tahan redesign'},
  {id: '3', title: 'Aksi di browser'},
  {id: '4', title: 'Assertion web-first'},
  {id: '5', title: 'Sinkronisasi & flaky test'},
  {id: '6', title: 'Penutup'},
];

export const STEPS: LearnStep[] = [
  {
    id: '0.0',
    phaseId: '0',
    title: 'Kenalan track & peta belajar',
    summary:
      'Ngerti dulu kenapa UI test datang belakangan, dan apa yang bakal kamu kuasai di track ini.',
    body: mdBody(phase0_00),
    checklist: [
      'Baca peta modul sampai tahu urutan belajar',
      'Catat prasyarat: sudah nyaman dengan TypeScript async/await',
      'Siapkan folder project Playwright (boleh pakai yang dari Part IV)',
    ],
  },
  {
    id: '0.1',
    phaseId: '0',
    title: 'Persiapan lab & menjalankan test',
    summary:
      'Cek instalasi browser Playwright, jalanin satu test, dan buka report-nya.',
    body: mdBody(phase0_01),
    checklist: [
      'Jalankan `npx playwright test` minimal sekali',
      'Buka HTML report setelah run',
      'Coba mode headed (`--headed`) biar kelihatan browser-nya',
    ],
  },
  {
    id: '1.0',
    phaseId: '1',
    title: 'Browser, Context, dan Page',
    summary:
      'Tiga objek ini nerangin hampir semua perilaku Playwright — termasuk kenapa test kamu selalu “fresh”.',
    body: mdBody(phase1_00),
    checklist: [
      'Jelaskan dengan kata sendiri beda Browser vs Context vs Page',
      'Tahu kenapa tiap test dapat context baru',
      'Bisa gambar skema hierarkinya (di kertas juga oke)',
    ],
  },
  {
    id: '1.1',
    phaseId: '1',
    title: 'Test browser pertama',
    summary:
      'Navigate, locate, act, assert — pola AAA yang sama, bedanya sekarang ada DOM.',
    body: mdBody(phase1_01),
    checklist: [
      'Tulis test yang `goto` + assert title',
      'Pakai `getByRole` untuk satu interaksi',
      'Pastikan tidak ada `waitForTimeout` di test',
    ],
  },
  {
    id: '2.0',
    phaseId: '2',
    title: 'Urutan prioritas locator',
    summary:
      'Role → label → text → placeholder → test id → CSS → XPath. Bukan sekadar hafalan.',
    body: mdBody(phase2_00),
    checklist: [
      'Sebutkan 3 locator yang kamu prioritaskan untuk form login',
      'Tahu kapan `getByTestId` masuk akal',
      'Paham strict mode (dua match = error)',
    ],
  },
  {
    id: '2.1',
    phaseId: '2',
    title: 'Praktik refactor locator',
    summary:
      'Ubah locator rapuh jadi yang ngomongin intent, bukan struktur CSS.',
    body: mdBody(phase2_01),
    checklist: [
      'Refactor satu locator CSS ke `getByRole` atau `getByLabel`',
      'Jalankan test sebelum & sesudah refactor',
      'Catat alasan kenapa locator baru lebih aman',
    ],
  },
  {
    id: '3.0',
    phaseId: '3',
    title: 'Klik, isi field, pilih opsi',
    summary:
      'Interaksi yang paling sering di UI test — dengan auto-wait bawaan Playwright.',
    body: mdBody(phase3_00),
    checklist: [
      'Pakai `fill` untuk text input',
      'Pakai `check` / `uncheck` untuk checkbox',
      'Pakai `selectOption` untuk dropdown',
    ],
  },
  {
    id: '3.1',
    phaseId: '3',
    title: 'Upload file & keyboard',
    summary:
      'Kontrol yang sering bikin test pertama gagal kalau locator-nya asal.',
    body: mdBody(phase3_01),
    checklist: [
      'Upload file dengan `setInputFiles`',
      'Tekan Enter dari keyboard di satu field',
      'Assert hasil setelah interaksi (bukan cuma klik)',
    ],
  },
  {
    id: '4.0',
    phaseId: '4',
    title: 'Web-first assertions',
    summary:
      'Assertion di Playwright sekaligus jadi mekanisme tunggu — ini kunci anti-flaky.',
    body: mdBody(phase4_00),
    checklist: [
      'Pakai `expect(locator).toBeVisible()`',
      'Assert teks dengan `toHaveText` / `toContainText`',
      'Assert URL dengan `expect(page).toHaveURL()`',
    ],
  },
  {
    id: '5.0',
    phaseId: '5',
    title: 'Auto-wait & apa yang tidak dijamin',
    summary:
      'Playwright sudah banyak nungguin, tapi tidak bisa nebak kebutuhan bisnis kamu.',
    body: mdBody(phase5_00),
    checklist: [
      'Sebutkan 2 hal yang auto-wait cover',
      'Sebutkan 1 kondisi yang tetap perlu assertion khusus',
      'Review test lama: ada hard wait tidak?',
    ],
  },
  {
    id: '5.1',
    phaseId: '5',
    title: 'Diagnosa flaky & hindari sleep',
    summary:
      'Kebanyakan “timing issue” sebenarnya locator atau assertion yang lemah.',
    body: mdBody(phase5_01),
    checklist: [
      'Baca trace satu test yang gagal intermittent',
      'Ganti satu `waitForTimeout` dengan assertion',
      'Tulis catatan root cause di README tim (1 paragraf)',
    ],
  },
  {
    id: '6.0',
    phaseId: '6',
    title: 'Lanjut ke framework & project',
    summary:
      'Ringkasan track dan jembatan ke Part VI (POM, fixture) serta Project 4.',
    body: mdBody(phase6_00),
    checklist: [
      'Tandai modul yang masih mau kamu ulang',
      'Buka outline Part VI di dokumentasi kurikulum',
      'Rencanakan satu skenario UI untuk Project 4',
    ],
  },
];

export function getStepById(stepId: string): LearnStep | undefined {
  return STEPS.find((s) => s.id === stepId);
}

export function getPhaseById(phaseId: string): LearnPhase | undefined {
  return PHASES.find((p) => p.id === phaseId);
}

export function getStepsForPhase(phaseId: string): LearnStep[] {
  return STEPS.filter((s) => s.phaseId === phaseId);
}

export function getAdjacentSteps(stepId: string): {
  prev: LearnStep | undefined;
  next: LearnStep | undefined;
} {
  const index = STEPS.findIndex((s) => s.id === stepId);
  if (index < 0) {
    return {prev: undefined, next: undefined};
  }
  return {
    prev: index > 0 ? STEPS[index - 1] : undefined,
    next: index < STEPS.length - 1 ? STEPS[index + 1] : undefined,
  };
}

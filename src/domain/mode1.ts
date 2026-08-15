import type { DayKey, Exercise, ExerciseTarget, SessionDefinition } from './types';

const exercise = (
  id: string,
  title: string,
  kind: Exercise['kind'],
  purpose: string,
  steps: string[],
  breathingCue: string,
  commonMistakes: string[],
  beginnerModification: string,
  stopCondition = 'Hentikan jika muncul nyeri tajam, pusing, atau sesak yang tidak biasa.',
  equipment: string[] = [],
  videoId?: string,
): Exercise => ({
  id,
  title,
  kind,
  purpose,
  equipment,
  steps,
  breathingCue,
  commonMistakes,
  beginnerModification,
  stopCondition,
  illustration: `/movement/${id}.png`,
  videoId,
});

export const MODE1_EXERCISES: Record<string, Exercise> = {
  march: exercise('march', 'Jalan di tempat', 'warmup', 'Menghangatkan tubuh dan menaikkan napas perlahan.', ['Berdiri tegak dekat kursi.', 'Angkat kaki bergantian dengan nyaman.', 'Ayunkan tangan tanpa memaksa.'], 'Bernapas normal; jangan menahan napas.', ['Mengangkat lutut terlalu tinggi', 'Memulai terlalu cepat'], 'Pegang sandaran kursi dan buat langkah lebih pendek.'),
  'shoulder-roll': exercise('shoulder-roll', 'Putaran bahu', 'warmup', 'Mengurangi ketegangan bahu akibat duduk.', ['Turunkan bahu menjauh dari telinga.', 'Putar bahu ke belakang perlahan.', 'Ulangi ke arah depan.'], 'Buang napas ketika bahu bergerak turun.', ['Mengangkat bahu terlalu tinggi', 'Gerakan menghentak'], 'Buat lingkaran kecil.'),
  'chest-open': exercise('chest-open', 'Buka dada', 'warmup', 'Membuka dada dan menggerakkan bahu.', ['Rentangkan tangan ke samping.', 'Dekatkan tulang belikat dengan lembut.', 'Peluk tubuh dan ganti tangan yang berada di atas.'], 'Tarik napas saat membuka, buang saat memeluk.', ['Melengkungkan pinggang', 'Memaksa bahu ke belakang'], 'Tekuk siku dan kecilkan rentang gerak.'),
  'standing-cat-cow': exercise('standing-cat-cow', 'Cat–cow berdiri', 'warmup', 'Menggerakkan tulang belakang dengan lembut.', ['Letakkan tangan di paha.', 'Bulatkan punggung perlahan.', 'Kembali ke posisi netral lalu buka dada sedikit.'], 'Buang napas saat membulat, tarik saat kembali.', ['Mendongakkan kepala berlebihan', 'Mengunci lutut'], 'Kurangi rentang gerak.'),
  'trunk-turn': exercise('trunk-turn', 'Putaran badan ringan', 'warmup', 'Menggerakkan punggung atas dan pinggang dengan terkendali.', ['Kaki tetap menghadap depan.', 'Putar dada sedikit ke kanan.', 'Kembali dan ulangi ke kiri.'], 'Bernapas normal.', ['Memutar dengan hentakan', 'Memaksa pinggang'], 'Gerakkan hanya bahu dan dada dalam rentang kecil.'),
  'hip-circle': exercise('hip-circle', 'Lingkar pinggul', 'warmup', 'Melemaskan pinggul setelah lama duduk.', ['Berdiri dengan kaki selebar pinggul.', 'Buat lingkaran kecil dengan pinggul.', 'Ganti arah.'], 'Bernapas normal.', ['Lingkaran terlalu besar', 'Lutut terkunci'], 'Pegang kursi.'),
  'knee-raise': exercise('knee-raise', 'Angkat lutut bergantian', 'warmup', 'Menyiapkan pinggul dan keseimbangan.', ['Pegang kursi bila perlu.', 'Angkat satu lutut senyaman mungkin.', 'Turunkan perlahan dan ganti sisi.'], 'Buang napas saat mengangkat.', ['Badan condong jauh ke belakang', 'Menahan napas'], 'Angkat kaki hanya beberapa sentimeter.'),
  'ankle-circle': exercise('ankle-circle', 'Putaran pergelangan kaki', 'warmup', 'Menyiapkan pergelangan kaki untuk berjalan.', ['Pindahkan berat ke satu kaki.', 'Angkat ujung kaki lainnya sedikit.', 'Putar pergelangan ke dua arah.'], 'Bernapas normal.', ['Memutar lutut', 'Kehilangan keseimbangan'], 'Duduk di kursi.'),
  'chair-squat': exercise('chair-squat', 'Chair squat', 'strength', 'Menguatkan paha dan pinggul untuk berdiri dan berjalan.', ['Berdiri di depan kursi dengan kaki selebar bahu.', 'Dorong pinggul ke belakang sampai menyentuh kursi.', 'Tekan telapak kaki dan berdiri kembali.'], 'Tarik saat turun, buang saat berdiri.', ['Menjatuhkan badan ke kursi', 'Lutut jatuh ke dalam'], 'Gunakan kursi lebih tinggi dan tangan di paha.', undefined, ['Kursi kokoh'], 'chair-squat'),
  'wall-pushup': exercise('wall-pushup', 'Wall push-up', 'strength', 'Menguatkan dada, bahu, dan lengan.', ['Letakkan tangan di dinding setinggi dada.', 'Jaga tubuh lurus dan tekuk siku.', 'Dorong kembali menjauh dari dinding.'], 'Tarik saat mendekat, buang saat mendorong.', ['Pinggang melengkung', 'Siku terbuka tegak lurus'], 'Berdiri lebih dekat ke dinding.', undefined, ['Dinding kokoh'], 'wall-pushup'),
  'glute-bridge': exercise('glute-bridge', 'Glute bridge', 'strength', 'Mengaktifkan pinggul dan menopang punggung.', ['Berbaring dengan lutut ditekuk.', 'Kencangkan perut ringan dan angkat pinggul.', 'Turunkan perlahan.'], 'Buang napas saat mengangkat.', ['Melengkungkan pinggang', 'Mendorong dari leher'], 'Angkat pinggul lebih rendah.'),
  'bird-dog': exercise('bird-dog', 'Bird-dog', 'strength', 'Melatih kestabilan perut dan punggung.', ['Mulai dengan posisi merangkak.', 'Luruskan tangan dan kaki berlawanan.', 'Kembali dan ganti sisi.'], 'Buang napas saat memanjangkan.', ['Pinggul berputar', 'Mengangkat anggota tubuh terlalu tinggi'], 'Gerakkan tangan atau kaki saja.'),
  'calf-raise': exercise('calf-raise', 'Calf raise', 'strength', 'Menguatkan betis dan pergelangan kaki.', ['Pegang kursi ringan.', 'Angkat kedua tumit.', 'Turunkan perlahan.'], 'Buang napas saat naik.', ['Mengayun', 'Tumit jatuh cepat'], 'Naik setengah tinggi.', undefined, ['Kursi kokoh']),
  walk: exercise('walk', 'Jalan nyaman', 'cardio', 'Melatih jantung dan paru secara bertahap.', ['Mulai pelan selama tiga menit.', 'Berjalan pada tempo yang masih memungkinkan bicara.', 'Akhiri pelan selama tiga menit.'], 'Gunakan napas alami dan tes bicara.', ['Mengejar kecepatan', 'Langkah terlalu lebar'], 'Perlambat atau bagi menjadi dua sesi pendek.'),
  'single-leg': exercise('single-leg', 'Berdiri satu kaki', 'balance', 'Melatih keseimbangan dengan dukungan aman.', ['Berdiri dekat dinding atau kursi.', 'Angkat satu kaki sedikit.', 'Tahan lalu ganti sisi.'], 'Bernapas normal.', ['Berlatih jauh dari pegangan', 'Menahan napas'], 'Tetap sentuhkan ujung jari kaki ke lantai.', undefined, ['Kursi kokoh']),
  'heel-to-toe': exercise('heel-to-toe', 'Jalan tumit ke ujung kaki', 'balance', 'Melatih kontrol langkah.', ['Berdiri dekat dinding.', 'Letakkan tumit tepat di depan ujung kaki lain.', 'Ambil langkah perlahan.'], 'Bernapas normal.', ['Terburu-buru', 'Melihat terus ke kaki'], 'Beri jarak kecil di antara kedua kaki.'),
  'hip-hinge': exercise('hip-hinge', 'Hip hinge', 'strength', 'Menguatkan pola membungkuk yang aman.', ['Tekuk lutut sedikit.', 'Dorong pinggul ke belakang dengan punggung netral.', 'Kencangkan pinggul untuk berdiri.'], 'Tarik saat turun, buang saat berdiri.', ['Membulatkan punggung', 'Berubah menjadi squat'], 'Berlatih menyentuhkan pinggul ke dinding.'),
  row: exercise('row', 'Row dengan band', 'strength', 'Menguatkan punggung dan membantu postur.', ['Pegang band dengan dada terbuka.', 'Tarik siku ke arah rusuk.', 'Kembali perlahan.'], 'Buang napas saat menarik.', ['Bahu naik', 'Tubuh mengayun'], 'Lakukan tanpa band sambil merapatkan tulang belikat.', undefined, ['Resistance band opsional']),
  'dead-bug': exercise('dead-bug', 'Dead bug sederhana', 'strength', 'Melatih kontrol otot inti.', ['Berbaring dengan lutut ditekuk.', 'Kencangkan perut ringan.', 'Geser satu tumit menjauh lalu kembali.'], 'Buang napas saat tumit menjauh.', ['Pinggang terangkat', 'Gerakan terlalu jauh'], 'Geser tumit lebih pendek.'),
  'easy-mobility': exercise('easy-mobility', 'Mobilitas pemulihan', 'recovery', 'Menjaga tubuh tetap bergerak pada hari ringan.', ['Pilih putaran bahu, buka dada, dan lingkar pinggul.', 'Bergerak lambat selama lima sampai sepuluh menit.', 'Akhiri ketika tubuh terasa lebih nyaman.'], 'Gunakan napas pelan dan nyaman.', ['Memaksa rentang gerak', 'Menjadikan sesi sebagai latihan berat'], 'Lakukan sambil duduk bila lelah.'),
  'slow-breathing': exercise('slow-breathing', 'Napas santai', 'recovery', 'Membantu tubuh beralih ke keadaan tenang.', ['Duduk tegak dan rileks.', 'Tarik melalui hidung sekitar empat detik.', 'Buang perlahan sekitar lima sampai enam detik.'], 'Jangan menahan atau mengambil napas terlalu besar.', ['Memaksa napas dalam', 'Melanjutkan saat pusing'], 'Kembali ke napas biasa.'),
  'slow-walk': exercise('slow-walk', 'Jalan pelan pendinginan', 'cooldown', 'Menurunkan napas secara bertahap.', ['Perlambat langkah.', 'Biarkan bahu rileks.', 'Berjalan sampai napas kembali nyaman.'], 'Bernapas normal.', ['Berhenti mendadak', 'Menahan napas'], 'Jalan di tempat.'),
};

const warmup: ExerciseTarget[] = [
  { exerciseId: 'march', seconds: 120 },
  { exerciseId: 'shoulder-roll', reps: 10 },
  { exerciseId: 'chest-open', reps: 10 },
  { exerciseId: 'standing-cat-cow', reps: 8 },
  { exerciseId: 'trunk-turn', reps: 8 },
  { exerciseId: 'hip-circle', reps: 8 },
  { exerciseId: 'knee-raise', reps: 10 },
  { exerciseId: 'ankle-circle', reps: 8 },
];

const cooldown: ExerciseTarget[] = [{ exerciseId: 'slow-walk', seconds: 180 }];

export const MODE1_SESSIONS: Record<DayKey, SessionDefinition> = {
  monday: { id: 'walk-base', title: 'Kardio dasar', description: 'Pemanasan dan jalan nyaman.', estimatedMinutes: 25, items: [...warmup, { exerciseId: 'walk' }, ...cooldown] },
  tuesday: { id: 'strength-a', title: 'Kekuatan A', description: 'Kaki, dorong, pinggul, inti, dan betis.', estimatedMinutes: 25, items: [...warmup.slice(0, 4), ...['chair-squat', 'wall-pushup', 'glute-bridge', 'bird-dog', 'calf-raise'].map((exerciseId) => ({ exerciseId }))] },
  wednesday: { id: 'walk-balance', title: 'Kardio & keseimbangan', description: 'Jalan nyaman dan latihan kestabilan.', estimatedMinutes: 30, items: [...warmup, { exerciseId: 'walk' }, { exerciseId: 'single-leg', seconds: 20 }, { exerciseId: 'heel-to-toe', reps: 8 }, ...cooldown] },
  thursday: { id: 'active-recovery', title: 'Pemulihan aktif', description: 'Gerak lembut dan napas santai.', estimatedMinutes: 18, items: [{ exerciseId: 'easy-mobility', minutes: 10 }, { exerciseId: 'slow-breathing', minutes: 5 }] },
  friday: { id: 'strength-b', title: 'Kekuatan B', description: 'Pola berdiri, menarik, dan kestabilan tubuh.', estimatedMinutes: 25, items: [...warmup.slice(0, 4), ...['chair-squat', 'wall-pushup', 'hip-hinge', 'row', 'dead-bug', 'calf-raise'].map((exerciseId) => ({ exerciseId }))] },
  saturday: { id: 'fun-cardio', title: 'Kardio pilihan', description: 'Jalan atau senam low-impact ringan.', estimatedMinutes: 30, items: [...warmup, { exerciseId: 'walk' }, ...cooldown] },
  sunday: { id: 'active-rest', title: 'Istirahat aktif', description: 'Bergerak ringan dan mengevaluasi pemulihan.', estimatedMinutes: 15, items: [{ exerciseId: 'easy-mobility', minutes: 10 }] },
};

export const WEEK_VOLUME = {
  1: { cardioMin: 10, cardioMax: 15, sets: 1, repsMin: 8, repsMax: 8 },
  2: { cardioMin: 15, cardioMax: 20, sets: 1, repsMin: 10, repsMax: 12 },
  3: { cardioMin: 20, cardioMax: 25, sets: 2, repsMin: 8, repsMax: 8 },
  4: { cardioMin: 25, cardioMax: 30, sets: 2, repsMin: 10, repsMax: 12 },
} as const;

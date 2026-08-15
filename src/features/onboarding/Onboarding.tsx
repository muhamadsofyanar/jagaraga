import { useState } from 'react';
import { ArrowRight, Check, HeartPulse, LockKeyhole, MoonStar } from 'lucide-react';
import type { AppSettings } from '../../persistence/db';
import { defaultSettings } from '../../persistence/repository';

export function Onboarding({ onComplete }: { onComplete: (settings: AppSettings) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());
  const [accepted, setAccepted] = useState(false);

  if (step === 0) return (
    <div className="onboarding page-pad">
      <div className="onboarding-art" aria-hidden="true"><span>01</span><HeartPulse size={54} /></div>
      <p className="eyebrow">PROGRAM 4 MINGGU</p>
      <h1>Mulai pelan.<br />Jadi lebih kuat.</h1>
      <p className="lead">JagaRaga menemani tubuh kembali aktif—satu sesi ringan pada satu waktu.</p>
      <div className="privacy-note"><LockKeyhole size={19} /><span>Progres hanya tersimpan di HP ini. Tanpa akun, tanpa pelacakan.</span></div>
      <button className="primary wide" onClick={() => setStep(1)}>Lanjut <ArrowRight size={19} /></button>
    </div>
  );

  if (step === 1) return (
    <div className="onboarding page-pad">
      <p className="eyebrow">PENGATURAN AWAL</p>
      <h1>Sesuaikan ritmemu</h1>
      <p className="lead">Semua pilihan dapat diubah nanti.</p>
      <label className="field"><span>Tanggal mulai</span><input type="date" value={settings.startDate} onChange={(event) => setSettings({ ...settings, startDate: event.target.value })} /></label>
      <label className="field"><span>Waktu latihan yang disukai</span><input type="time" value={settings.preferredTime ?? ''} onChange={(event) => setSettings({ ...settings, preferredTime: event.target.value })} /></label>
      <label className="switch-row"><span><strong>Video panduan</strong><small>Memuat video resmi ketika online</small></span><input type="checkbox" checked={settings.videoConsent} onChange={(event) => setSettings({ ...settings, videoConsent: event.target.checked })} /></label>
      <button className="primary wide" onClick={() => setStep(2)}>Lanjut ke keamanan <ArrowRight size={19} /></button>
      <button className="text-button" onClick={() => setStep(0)}>Kembali</button>
    </div>
  );

  return (
    <div className="onboarding page-pad">
      <div className="safety-icon"><MoonStar size={32} /></div>
      <p className="eyebrow">SEBELUM MULAI</p>
      <h1>Dengarkan tubuh</h1>
      <p className="lead">Hentikan latihan dan cari pertolongan segera jika ada nyeri/tekanan dada, sesak berat, hampir pingsan, keringat dingin, atau nyeri menjalar.</p>
      <div className="notice"><strong>Karena Anda pernah mudah engap</strong><p>Periksakan diri sebelum menaikkan intensitas jika sesak juga muncul saat berjalan biasa atau naik satu lantai.</p></div>
      <label className="accept-row"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Saya memahami bahwa JagaRaga bukan pengganti pemeriksaan medis.</span></label>
      <button className="primary wide" disabled={!accepted} onClick={() => onComplete({ ...settings, onboardingComplete: true })}><Check size={19} /> Mulai Mode 1</button>
      <button className="text-button" onClick={() => setStep(1)}>Kembali</button>
    </div>
  );
}

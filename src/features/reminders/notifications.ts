export interface NotificationApi {
  permission: NotificationPermission;
  requestPermission?: () => Promise<NotificationPermission>;
  new (title: string, options?: NotificationOptions): Notification;
}

export type NotificationCapability = 'unsupported' | 'default' | 'denied' | 'granted';

const browserNotification = () => typeof Notification === 'undefined' ? undefined : Notification as unknown as NotificationApi;

export function getNotificationCapability(api: Pick<NotificationApi, 'permission'> | undefined = browserNotification()): NotificationCapability {
  if (!api) return 'unsupported';
  return api.permission;
}

export async function requestNotificationPermission(api: Pick<NotificationApi, 'permission' | 'requestPermission'> | undefined = browserNotification()): Promise<NotificationCapability> {
  if (!api?.requestPermission) return api ? api.permission : 'unsupported';
  return api.requestPermission();
}

export async function showTestNotification(api: NotificationApi | undefined = browserNotification(), serviceWorker: ServiceWorkerContainer | undefined = typeof navigator === 'undefined' ? undefined : navigator.serviceWorker): Promise<string> {
  if (!api) return 'Notifikasi tidak didukung browser ini.';
  if (api.permission !== 'granted') return 'Izin notifikasi belum diberikan.';
  try {
    if (serviceWorker) {
      const registration = await serviceWorker.ready;
      await registration.showNotification('Pengingat JagaRaga', { body: 'Notifikasi uji berhasil. Kalender HP tetap menjadi pengingat utama.', icon: '/icons/icon-192.png' });
    } else new api('Pengingat JagaRaga', { body: 'Notifikasi uji berhasil.' });
    return 'Notifikasi uji berhasil ditampilkan.';
  } catch { return 'Notifikasi tidak dapat ditampilkan di perangkat ini.'; }
}

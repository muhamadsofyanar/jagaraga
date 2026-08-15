import { describe, expect, it, vi } from 'vitest';
import { getNotificationCapability, requestNotificationPermission, showTestNotification, type NotificationApi } from './notifications';

describe('browser notifications', () => {
  it('reports unsupported and denied capability', () => {
    expect(getNotificationCapability(undefined)).toBe('unsupported');
    expect(getNotificationCapability({ permission: 'denied' } as NotificationApi)).toBe('denied');
  });
  it('requests permission only through the explicit function', async () => {
    const api = { permission: 'default', requestPermission: vi.fn().mockResolvedValue('granted') } as unknown as NotificationApi;
    await expect(requestNotificationPermission(api)).resolves.toBe('granted');
    expect(api.requestPermission).toHaveBeenCalledOnce();
  });
  it('uses a service worker registration for a test notification', async () => {
    const showNotification = vi.fn();
    const result = await showTestNotification({ permission: 'granted' } as NotificationApi, { ready: Promise.resolve({ showNotification }) } as unknown as ServiceWorkerContainer);
    expect(result).toContain('berhasil');
    expect(showNotification).toHaveBeenCalled();
  });
});

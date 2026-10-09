import { getActiveAlert, SITE_ALERTS } from '../alerts';

describe('active Finistère alert', () => {
  afterEach(() => jest.useRealTimers());
  test('is active, non-dismissible and restricted to French', () => {
    const alert = getActiveAlert('crise-eau-finistere-2026');
    expect(alert?.status).toBe('active');
    expect(alert?.dismissible).toBe(false);
    expect(alert?.languages).toEqual(['fr']);
  });
  test('returns null for missing and resolved alerts', () => {
    expect(getActiveAlert('missing')).toBeNull();
    expect(getActiveAlert('pollution-manganese-vendee-2026')).toBeNull();
  });
  test('excludes expired alerts and retains a future expiry', () => {
    const alert = SITE_ALERTS.find(a => a.id === 'crise-eau-finistere-2026');
    if (!alert) throw new Error('Missing crisis alert');
    jest.useFakeTimers().setSystemTime(new Date('2026-10-09T12:00:00Z'));
    const original = alert.displayUntil;
    try {
      alert.displayUntil = '2026-10-08T23:59:59Z';
      expect(getActiveAlert(alert.id)).toBeNull();
      alert.displayUntil = '2026-10-10T23:59:59Z';
      expect(getActiveAlert(alert.id)?.id).toBe(alert.id);
    } finally { alert.displayUntil = original; }
  });
});
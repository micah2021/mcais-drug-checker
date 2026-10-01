import {
  validateNafdacCode,
  verifyAuthenticity,
  submitFakeDrugReport,
  getPublicReportPoints,
  updateReportModerationStatus,
  clearStoredReportsForTests,
} from './drugSafety';

describe('drugSafety service', () => {
  beforeEach(() => {
    clearStoredReportsForTests();
  });

  test('normalizes and validates NAFDAC code', () => {
    const result = validateNafdacCode(' a4-0001 ');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('A4-0001');
  });

  test('returns pending_review when valid image is uploaded', () => {
    const file = new File(['img'], 'pack.jpg', { type: 'image/jpeg' });
    const result = verifyAuthenticity({ nafdacCode: 'A4-0001', imageFile: file });

    expect(result.status).toBe('pending_review');
    expect(result.image.received).toBe(true);
    expect(result.image.queued_for_review).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('submits fake drug report with default pending moderation', () => {
    const res = submitFakeDrugReport({
      productName: 'Fake Coartem',
      nafdacCode: 'A4-0001',
      locationText: 'Yaba, Lagos',
      description: 'Suspicious packaging and smell',
      reporterContact: '08012345678',
    });

    expect(res.ok).toBe(true);
    expect(res.report.moderation_status).toBe('pending');

    const points = getPublicReportPoints();
    expect(points).toHaveLength(1);
    expect(points[0].product_name).toBe('Fake Coartem');
    expect(points[0].moderation_status).toBe('pending');
    expect(points[0].description).toBeUndefined();
  });

  test('updates moderation status', () => {
    const res = submitFakeDrugReport({
      productName: 'Counterfeit syrup',
      locationText: 'Abuja',
      description: 'Looks tampered',
    });

    const updated = updateReportModerationStatus(res.report.id, 'verified');
    expect(updated.ok).toBe(true);

    const points = getPublicReportPoints();
    expect(points[0].moderation_status).toBe('verified');
  });
});

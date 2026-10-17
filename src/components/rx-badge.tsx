export function RxBadge({ requiresPrescription }: { requiresPrescription: boolean }) {
  return requiresPrescription ? (
    <span className="badge badge-rx">℞ بوصفة طبية فقط</span>
  ) : (
    <span className="badge badge-otc">متاح بدون وصفة</span>
  );
}

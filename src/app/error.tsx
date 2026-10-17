"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl place-content-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-extrabold">حدث خطأ غير متوقع</h1>
      <p className="text-muted">لم نتمكن من إكمال طلبك. حاول مرة أخرى بعد قليل.</p>
      <div className="flex justify-center">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}

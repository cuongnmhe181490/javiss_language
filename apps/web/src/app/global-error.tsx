"use client";

/**
 * Custom global error boundary. Next.js renders this in place of the root
 * layout when an unhandled error occurs at the root, so it must provide its own
 * <html>/<body>. Providing a custom one also avoids a prerender issue with the
 * framework's built-in global-error page under Next 16 + React 19.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020617",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Đã xảy ra lỗi
          </h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#94a3b8" }}>
            Trang gặp sự cố ngoài dự kiến. Bạn có thể thử lại hoặc quay về trang chủ.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>
              Mã lỗi: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: "0.75rem",
                backgroundColor: "#10b981",
                color: "#020617",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
              }}
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                backgroundColor: "transparent",
                color: "#e2e8f0",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

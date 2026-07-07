export default function Loading() {
  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Hero skeleton */}
      <div className="px-5 pt-12 pb-6 animate-pulse"
        style={{ background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)" }}>
        <div className="h-3 w-24 rounded mb-2"
          style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="h-7 w-48 rounded mb-5"
          style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-2 w-32 rounded mb-3"
            style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="h-8 w-40 rounded mb-3"
            style={{ background: "rgba(255,255,255,0.15)" }} />
          <div className="h-2 w-20 rounded"
            style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 pt-4 animate-pulse">
        <div className="h-2 w-32 rounded mb-3"
          style={{ background: "rgba(26,18,8,0.08)" }} />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2].map(i => (
            <div key={i} className="rounded-xl p-4 h-32"
              style={{ background: "rgba(26,18,8,0.06)" }} />
          ))}
        </div>
        <div className="rounded-xl p-4 mb-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="h-6 rounded mx-auto mb-1 w-12"
                  style={{ background: "rgba(26,18,8,0.06)" }} />
                <div className="h-2 rounded mx-auto w-10"
                  style={{ background: "rgba(26,18,8,0.04)" }} />
              </div>
            ))}
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
            <div className="w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: "rgba(26,18,8,0.06)" }} />
            <div className="flex-1">
              <div className="h-3 rounded mb-1.5 w-3/4"
                style={{ background: "rgba(26,18,8,0.06)" }} />
              <div className="h-2 rounded w-1/2"
                style={{ background: "rgba(26,18,8,0.04)" }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
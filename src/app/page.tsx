export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--cream)' }}>

      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ background: 'var(--forest)' }}>
          🌿
        </div>
        <h1 className="text-4xl text-center"
          style={{ fontFamily: 'DM Serif Display, serif', color: 'var(--ink)' }}>
          Abia Green
        </h1>
        <p className="text-sm text-center max-w-xs"
          style={{ fontFamily: 'Space Mono, monospace', color: 'var(--ash)',
            letterSpacing: '0.08em' }}>
          CIVIC INTELLIGENCE PLATFORM · ABIA STATE
        </p>

        {/* Module tiles */}
        <div className="grid grid-cols-2 gap-3 mt-6 w-72">
          <div className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
            style={{ background: 'var(--deep)' }}>
            <span className="text-2xl">🚌</span>
            <span className="text-white font-semibold text-sm">Green Shuttle</span>
            <span className="text-xs" style={{ color: 'rgba(253,250,245,0.5)' }}>
              Transport module
            </span>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
            style={{ background: '#3D2800' }}>
            <span className="text-2xl">🌿</span>
            <span className="text-white font-semibold text-sm">Environment</span>
            <span className="text-xs" style={{ color: 'rgba(253,250,245,0.5)' }}>
              AEIS module
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 px-4 py-2 rounded-full text-xs flex items-center gap-2"
          style={{ background: 'rgba(26,107,60,0.1)',
            fontFamily: 'Space Mono, monospace', color: 'var(--forest)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'var(--forest)' }}></span>
          MORNING STACK ICT CLUB · IBEKU HIGH SCHOOL
        </div>
      </div>
    </main>
  )
}
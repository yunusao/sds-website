export default function LoadingSdsFc() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* glow */}
          <div className="absolute -inset-10 rounded-full bg-[#C7A24A]/15 blur-3xl animate-pulse" />

          {/* logo */}
          <img
            src="/sds-fc/fclogo.png"
            alt="SDS FC"
            className="relative w-40 sm:w-52 object-contain
                       animate-[logoPop_900ms_ease-in-out_infinite_alternate]"
          />
        </div>

        <div className="text-xs font-bold tracking-[0.25em] text-white/60">
          LOADING
        </div>
      </div>

      <style>{`
        @keyframes logoPop {
          from { transform: scale(0.98); filter: drop-shadow(0 0 18px rgba(199,162,74,0.25)); opacity: 0.85; }
          to   { transform: scale(1.04); filter: drop-shadow(0 0 34px rgba(199,162,74,0.45)); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

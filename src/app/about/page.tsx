
import { getChannelInfo } from "@/lib/youtube";

export default async function AboutPage() {
  const mainChannelId = process.env.YOUTUBE_CHANNEL_ID || "";
  const secondChannelId = process.env.YOUTUBE_CHANNEL_ID_SECOND || "";

  const [mainChannel, secondChannel] = await Promise.all([
    mainChannelId ? getChannelInfo(mainChannelId) : Promise.resolve(null),
    secondChannelId ? getChannelInfo(secondChannelId) : Promise.resolve(null),
  ]);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-white">About SDS</h1>
        <p className="mt-3 text-lg text-white/60">Channel statistics and community info</p>
      </div>

      {/* Channel Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Channel */}
        {mainChannel && (
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <div className="flex items-start gap-4">
              <img
                src="/logo.jpg"
                alt={mainChannel.title}
                className="h-20 w-20 rounded-full border border-white/10"
              />
              <div className="flex-1">
                <h2 className="text-xl font-black text-white">{mainChannel.title}</h2>
                <p className="mt-1 text-sm text-white/60">{mainChannel.description}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {formatNumber(mainChannel.subscriberCount)}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Subscribers</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {formatNumber(mainChannel.viewCount)}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Total Views</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {mainChannel.videoCount}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Videos</div>
              </div>
            </div>
          </div>
        )}

        {/* Second Channel */}
        {secondChannel && (
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-6">
            <div className="flex items-start gap-4">
              <img
                src="/sdsextra.jpg"
                alt={secondChannel.title}
                className="h-20 w-20 rounded-full border border-white/10"
              />
              <div className="flex-1">
                <h2 className="text-xl font-black text-white">{secondChannel.title}</h2>
                <p className="mt-1 text-sm text-white/60">{secondChannel.description}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {formatNumber(secondChannel.subscriberCount)}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Subscribers</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {formatNumber(secondChannel.viewCount)}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Total Views</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {secondChannel.videoCount}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">Videos</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

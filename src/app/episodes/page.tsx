import EpisodesClient from "./episodes-client";
import { getMainChannelFirstPage, getSecondChannelFirstPage } from "@/lib/youtube";

export default async function EpisodesPage() {
  const [main, second] = await Promise.all([
    getMainChannelFirstPage(),
    getSecondChannelFirstPage(),
  ]);

  return (
    <EpisodesClient
      initialMainVideos={main.videos}
      initialSecondVideos={second.videos}
      initialMainPageToken={main.nextPageToken}
      initialSecondPageToken={second.nextPageToken}
    />
  );
}

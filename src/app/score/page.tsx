import SDSScoreClient from "./sds-score-client";
import { getLatestVideo } from "@/lib/youtube";

export default async function SDSScorePage() {
  // Pull just 1 latest video from MAIN channel (uses YOUTUBE_CHANNEL_ID)
  const vids = await getLatestVideo();

  return <SDSScoreClient latestVideo={vids} />;
}

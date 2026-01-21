export function formatEpisodeTitle(title: string) {
  // Remove common separators and branding
  const cleaned = title
    .replace("&#39;", "'")
    .replace("&amp;", "&")
    .trim();
    

  return cleaned;
}

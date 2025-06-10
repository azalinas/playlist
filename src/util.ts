import { PlaylistItem } from "./schema";

export function extractType(content: string): Partial<PlaylistItem> {
  const match = content.match(/https?:\/\/(www\.)?([^\s]+)/)

  if (match) {
    const url = new URL(match[0]);
    const domain = url.hostname.replace(/^www\./, '');

    if (["youtube.com", "youtu.be"].includes(domain)) {
      return { type: "youtube", url: match[0] };
    } else if (["twitter.com", "x.com"].includes(domain)) {
      return { type: "twitter", url: match[0] };
    } else {
      return { type: "link", url: match[0] };
    }
  }
  
  return { type: "text", content: content };
}
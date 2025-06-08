import { co, z } from "jazz-tools";

// Base fields that all playlist items share
const BaseItemFields = {
  title: z.optional(co.plainText()),
  addedContext: z.optional(co.plainText()), // Why this was added to the playlist
  addedAt: z.optional(z.number()), // When it was added
};

// Define different types of playlist items
export const VideoItem = co.map({
  ...BaseItemFields,
  type: z.literal("video"),
  url: co.plainText(),
  duration: z.number(),
  thumbnail: z.optional(co.image()),
});

export const AudioItem = co.map({
  ...BaseItemFields,
  type: z.literal("audio"),
  artist: co.plainText(),
  url: co.plainText(),
  duration: z.number(),
  albumArt: z.optional(co.image()),
});

export const ImageItem = co.map({
  ...BaseItemFields,
  type: z.literal("image"),
  image: co.image(),
  caption: z.optional(co.plainText()),
});

export const TextItem = co.map({
  ...BaseItemFields,
  type: z.literal("text"),
  content: co.plainText(),
});

export const LinkItem = co.map({
  ...BaseItemFields,
  type: z.literal("link"),
  url: co.plainText(),
  preview: z.optional(co.plainText()), // Preview text or description
});

// Create a discriminated union of all item types
export const PlaylistItem = z.discriminatedUnion("type", [
  VideoItem,
  AudioItem,
  ImageItem,
  TextItem,
  LinkItem,
]);
export type PlaylistItem = co.loaded<typeof PlaylistItem>;

export const PlaylistItemsList = co.list(PlaylistItem);

// Define the playlist
export const Playlist = co.map({
  name: z.string(),
  description: z.optional(z.string()),
  items: PlaylistItemsList,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Playlist = co.loaded<typeof Playlist>;

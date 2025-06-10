import { co, z, CoMapSchema } from "jazz-tools";

// Base fields that all playlist items share
const BaseItemFields = {
  title: z.optional(co.plainText()),
  addedContext: z.optional(co.plainText()), // Why this was added to the playlist
  addedAt: z.optional(z.number()), // When it was added
};

export type ContentType = "youtube" | "image" | "text" | "link";

// Define each content type schema separately
export const YoutubeItem = co.map({
  ...BaseItemFields,
  type: z.literal("youtube"),
  url: z.string(),
});

export const TwitterItem = co.map({
  ...BaseItemFields,
  type: z.literal("twitter"),
  url: z.string(),
});

export const ImageItem = co.map({
  ...BaseItemFields,
  type: z.literal("image"),
  image: co.image(),
});

export const TextItem = co.map({
  ...BaseItemFields,
  type: z.literal("text"),
  content: z.string(),
});

export const LinkItem = co.map({
  ...BaseItemFields,
  type: z.literal("link"),
  url: z.string(),
});

// If you still want an object mapping for convenience, create it like this:
export const ContentTypes = {
  youtube: YoutubeItem,
  image: ImageItem,
  text: TextItem,
  link: LinkItem,
  twitter: TwitterItem,
} as const;

// Create the discriminated union using Jazz's pattern
export const PlaylistItem = z.discriminatedUnion("type", [YoutubeItem, ImageItem, TextItem, LinkItem, TwitterItem]);
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

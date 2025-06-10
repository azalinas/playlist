import { createImage, useAccount, useCoState } from "jazz-react";
import { ProgressiveImg } from "jazz-react";
import { co } from "jazz-tools";
import { useState } from "react";
import { 
  Playlist, 
  PlaylistItem, 
  ContentTypes,
} from "./schema.ts";
import {
  AppContainer,
  TopBar,
  ChatBody,
  InputBar,
  ImageInput,
  TextInput,
} from "./ui.tsx";
import { 
  PlayIcon, 
  Music2Icon, 
  TwitterIcon,
  ImageIcon, 
  FileTextIcon, 
  LinkIcon,
  PlusIcon,
  ClockIcon,
  CalendarIcon
} from "lucide-react";
import { extractType } from "./util.ts";
import { Tweet } from "react-twitter-widgets";

export function PlaylistScreen(props: { playlistID: string }) {
  const playlist = useCoState(Playlist, props.playlistID, {
    resolve: { items: { $each: true } },
  });
  const { me } = useAccount();
  const [addItemType, setAddItemType] = useState<PlaylistItem["type"]>("text");

  if (!playlist) {
    return (
      <div>
        Loading playlist...
      </div>
    );
  }

  const addItem = (itemData: Partial<PlaylistItem>) => {
    if (!playlist?._owner) return;

    console.log(itemData)
    
    const baseData: Partial<PlaylistItem> = {
      addedAt: Date.now(),
      ...itemData,
    };

    console.log(baseData)
    console.log(baseData as any)

    const actualType = (itemData.type || addItemType) as PlaylistItem["type"];
    let itemType = ContentTypes[actualType];

    let newItem: PlaylistItem = itemType.create(baseData as any, playlist._owner);
    
    playlist.items?.push(newItem);
    playlist.updatedAt = Date.now();
  };

  return (
    <div>
        <div>
          <h1>{playlist.name}</h1>
          {playlist.description && (
            <p>
              {playlist.description}
            </p>
          )}
        </div>
        <div>
          <CalendarIcon size={16} />
          {new Date(playlist.createdAt).toLocaleDateString()}
        </div>

        <div>
          {playlist.items && playlist.items.length > 0 ? (
            playlist.items.map((item, index) => (
              // <div>{item.type}</div>
              <PlaylistItemComponent key={item.id} item={item} index={index} />
            ))
          ) : (
            <div>
              <FileTextIcon size={48} />
              <p>No items in this playlist yet.</p>
              <p>Add some content to get started!</p>
            </div>
          )}
        </div>

      <InputBar>
        <AddItemForm
            itemType={addItemType}
            onTypeChange={setAddItemType}
            onSubmit={addItem}
          />
      </InputBar>
    </div>
  );
}

// Extensible item renderer component
function PlaylistItemComponent({ item, index }: { item: PlaylistItem; index: number }) {
  console.log(item)

  const itemRenderers: Record<PlaylistItem["type"], React.ComponentType<{ item: any }>> = {
    youtube: YoutubeItemRenderer,
    image: () => <div>Image</div>,
    text: TextRenderer,
    link: () => <div>Link</div>, 
    twitter: TwitterItemRenderer,
  };

  const ItemRenderer = itemRenderers[item.type];
  
  return (
    <div>
      <div>
        <div>
          <span>
            #{index + 1}
          </span>
          <ItemTypeIcon type={item.type} />
          {item.title && (
            <h3>
              {item.title}
            </h3>
          )}
          {item.addedAt && (
            <div>
              <ClockIcon size={12} />
              {new Date(item.addedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* <div>
          {item.type}
        </div>
         */}
        <ItemRenderer item={item} />
        
        {item.addedContext && (
          <div>
            <span>Note: </span>
            <span>{item.addedContext}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function YoutubeItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "youtube") {
    return null;
  }

  // Convert YouTube URL to embed format
  let embedUrl = "";
  if (item.url) {
    const url = new URL(item.url);
    let videoId = "";
    
    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || "";
    }
    
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return <iframe
            width="560"
            height="315" 
            src={embedUrl} 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>;
}

function TwitterItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "twitter") {
    return null;
  }
  
  // Convert Twitter/X URL to nitter embed format
  // let embedUrl = "";
  // if (item.url) {
  //   const url = new URL(item.url);
    
  //   if (url.hostname.includes("twitter.com") || url.hostname.includes("x.com")) {
  //     // Replace the hostname with nitter.net and add /embed
  //     embedUrl = `https://xcancel.com${url.pathname}/embed`;
  //   }
  // }

  // Extract tweet ID from URL
  let tweetId = "";
  if (item.url) {
    const url = new URL(item.url);
    
    if (url.hostname.includes("twitter.com") || url.hostname.includes("x.com")) {
      // Extract tweet ID from pathname (format: /username/status/tweetId)
      const pathParts = url.pathname.split('/');
      const statusIndex = pathParts.indexOf('status');
      if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
        tweetId = pathParts[statusIndex + 1];
      }
    }
  }
  

  return <Tweet tweetId={tweetId} />;
}

function TextRenderer({ item }: { item: PlaylistItem & { type: "text" } }) {
  return <div>{item.content}</div>;
}

function ItemTypeIcon({ type }: { type: PlaylistItem["type"] }) {
  const icons = {
    youtube: PlayIcon,
    image: ImageIcon,
    text: FileTextIcon,
    link: LinkIcon,
    twitter: TwitterIcon,
  };
  
  const Icon = icons[type];
  return <Icon size={16} />;
}

function AddItemForm({ 
  itemType, 
  onTypeChange, 
  onSubmit,
}: {
  itemType: PlaylistItem["type"];
  onTypeChange: (type: PlaylistItem["type"]) => void;
  onSubmit: (data: Partial<PlaylistItem>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let data = extractType(formData.content || "")

    console.log(data)
    
    // Include the context as addedContext if provided
    onSubmit({ 
      ...data,
      ...(formData.context ? { addedContext: formData.context } : {})
    });
    setFormData({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <textarea
          style={{ width: "400px", height: "100px" }}
          placeholder="Paste a link or upload a file"
          value={formData.content || ""}
          onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, content: e.target.value }))}
        />
        <label style={{ position: "absolute", top: 0, right: 0, cursor: "pointer" }}>
          <PlusIcon size={16} />
          <input className="hidden" type="file" onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, file: e.target.files?.[0] }))} style={{ display: "none" }} />
        </label>
      </div>
      <div>
        <input type="text" placeholder="Add context (optional)" value={formData.context || ""} onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, context: e.target.value }))} />
        <button type="submit">Add</button>
      </div>
    </form>
  );
}
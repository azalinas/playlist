import { createImage, useAccount, useCoState } from "jazz-react";
import { ProgressiveImg } from "jazz-react";
import { co } from "jazz-tools";
import { useState } from "react";
import { 
  Playlist, 
  PlaylistItem, 
  VideoItem, 
  AudioItem, 
  ImageItem, 
  TextItem, 
  LinkItem 
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
  ImageIcon, 
  FileTextIcon, 
  LinkIcon,
  PlusIcon,
  ClockIcon,
  CalendarIcon
} from "lucide-react";

export function PlaylistScreen(props: { playlistID: string }) {
  const playlist = useCoState(Playlist, props.playlistID, {
    resolve: { items: { $each: true } },
  });
  const { me } = useAccount();
  const [showAddForm, setShowAddForm] = useState(false);
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
    
    const baseData = {
      addedAt: Date.now(),
      ...itemData,
    };

    let newItem: PlaylistItem;
    
    switch (addItemType) {
      case "video":
        newItem = VideoItem.create(baseData as any, playlist._owner);
        break;
      case "audio":
        newItem = AudioItem.create(baseData as any, playlist._owner);
        break;
      case "image":
        newItem = ImageItem.create(baseData as any, playlist._owner);
        break;
      case "text":
        newItem = TextItem.create(baseData as any, playlist._owner);
        break;
      case "link":
        newItem = LinkItem.create(baseData as any, playlist._owner);
        break;
      default:
        return;
    }

    playlist.items?.push(newItem);
    playlist.updatedAt = Date.now();
    setShowAddForm(false);
  };

  return (
    <AppContainer>
      <TopBar>
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
      </TopBar>

      <ChatBody>
        <div>
          {playlist.items && playlist.items.length > 0 ? (
            playlist.items.map((item, index) => (
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
      </ChatBody>

      <InputBar>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
          >
            <PlusIcon size={20} />
            Add Item
          </button>
        ) : (
          <AddItemForm
            itemType={addItemType}
            onTypeChange={setAddItemType}
            onSubmit={addItem}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </InputBar>
    </AppContainer>
  );
}

// Extensible item renderer component
function PlaylistItemComponent({ item, index }: { item: PlaylistItem; index: number }) {
  const itemRenderers: Record<PlaylistItem["type"], React.ComponentType<{ item: any }>> = {
    video: VideoItemRenderer,
    audio: AudioItemRenderer,
    image: ImageItemRenderer,
    text: TextItemRenderer,
    link: LinkItemRenderer,
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

// Individual item type renderers
function VideoItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "video") return null;
  
  return (
    <div>
      {item.thumbnail && (
        <div>
          <ProgressiveImg image={item.thumbnail}>
            {({ src }) => (
              <img
                src={src}
                alt="Video thumbnail"
              />
            )}
          </ProgressiveImg>
          <div>
            <div>
              <PlayIcon size={24} />
            </div>
          </div>
        </div>
      )}
      <div>
        <a 
          href={item.url?.toString()} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {item.url?.toString()}
        </a>
        <span>
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function AudioItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "audio") return null;
  
  return (
    <div>
      {item.albumArt && (
        <ProgressiveImg image={item.albumArt}>
          {({ src }) => (
            <img
              src={src}
              alt="Album art"
            />
          )}
        </ProgressiveImg>
      )}
      <div>
        <p>{item.artist?.toString()}</p>
        <a 
          href={item.url?.toString()} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Play
        </a>
        <p>
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

function ImageItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "image") return null;
  
  return (
    <div>
      <ProgressiveImg image={item.image}>
        {({ src }) => (
          <img
            src={src}
            alt={item.caption?.toString() || "Playlist image"}
          />
        )}
      </ProgressiveImg>
      {item.caption && (
        <p>
          {item.caption.toString()}
        </p>
      )}
    </div>
  );
}

function TextItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "text") return null;
  
  return (
    <div>
      <p>{item.content?.toString()}</p>
    </div>
  );
}

function LinkItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "link") return null;
  
  return (
    <div>
      <a 
        href={item.url?.toString()} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {item.url?.toString()}
      </a>
      {item.preview && (
        <p>
          {item.preview.toString()}
        </p>
      )}
    </div>
  );
}

function ItemTypeIcon({ type }: { type: PlaylistItem["type"] }) {
  const icons = {
    video: PlayIcon,
    audio: Music2Icon,
    image: ImageIcon,
    text: FileTextIcon,
    link: LinkIcon,
  };
  
  const Icon = icons[type];
  return <Icon size={16} />;
}

function AddItemForm({ 
  itemType, 
  onTypeChange, 
  onSubmit, 
  onCancel 
}: {
  itemType: PlaylistItem["type"];
  onTypeChange: (type: PlaylistItem["type"]) => void;
  onSubmit: (data: Partial<PlaylistItem>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type: itemType, ...formData });
    setFormData({});
  };

  const itemTypes: { value: PlaylistItem["type"]; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "link", label: "Link" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "image", label: "Image" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <select
          value={itemType}
          onChange={(e) => onTypeChange(e.target.value as PlaylistItem["type"])}
        >
          {itemTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Title (optional)"
          value={formData.title || ""}
          onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <ItemTypeSpecificFields 
        type={itemType} 
        data={formData} 
        onChange={setFormData} 
      />

      <textarea
        placeholder="Why are you adding this? (optional)"
        value={formData.addedContext || ""}
        onChange={(e) => setFormData((prev: Record<string, any>) => ({ ...prev, addedContext: e.target.value }))}
        rows={2}
      />

      <div>
        <button type="submit">
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ItemTypeSpecificFields({ 
  type, 
  data, 
  onChange 
}: {
  type: PlaylistItem["type"];
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
  const updateField = (field: string, value: any) => {
    onChange((prev: Record<string, any>) => ({ ...prev, [field]: value }));
  };

  switch (type) {
    case "video":
      return (
        <>
          <input
            type="url"
            placeholder="Video URL"
            required
            value={data.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            value={data.duration || ""}
            onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
          />
        </>
      );
    
    case "audio":
      return (
        <>
          <input
            type="text"
            placeholder="Artist"
            required
            value={data.artist || ""}
            onChange={(e) => updateField("artist", e.target.value)}
          />
          <input
            type="url"
            placeholder="Audio URL"
            required
            value={data.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            value={data.duration || ""}
            onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
          />
        </>
      );
    
    case "image":
      return (
        <>
          <input
            type="text"
            placeholder="Image caption (optional)"
            value={data.caption || ""}
            onChange={(e) => updateField("caption", e.target.value)}
          />
          <div>
            Note: Image upload functionality would need to be implemented using createImage()
          </div>
        </>
      );
    
    case "text":
      return (
        <textarea
          placeholder="Text content"
          required
          value={data.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          rows={3}
        />
      );
    
    case "link":
      return (
        <>
          <input
            type="url"
            placeholder="URL"
            required
            value={data.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
          />
          <input
            type="text"
            placeholder="Preview/description (optional)"
            value={data.preview || ""}
            onChange={(e) => updateField("preview", e.target.value)}
          />
        </>
      );
    
    default:
      return null;
  }
}

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
      <div className="flex-1 flex justify-center items-center">
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
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {playlist.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon size={16} />
          {new Date(playlist.createdAt).toLocaleDateString()}
        </div>
      </TopBar>

      <ChatBody>
        <div className="flex flex-col gap-4 p-4">
          {playlist.items && playlist.items.length > 0 ? (
            playlist.items.map((item, index) => (
              item && <PlaylistItemComponent key={item.id} item={item} index={index} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileTextIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No items in this playlist yet.</p>
              <p className="text-sm">Add some content to get started!</p>
            </div>
          )}
        </div>
      </ChatBody>

      <InputBar>
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-full justify-center"
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
    <div className="bg-white dark:bg-stone-900 rounded-lg shadow-sm border dark:border-stone-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{index + 1}
          </span>
          <ItemTypeIcon type={item.type} />
          {item.title && (
            <h3 className="font-medium text-gray-900 dark:text-white">
              {item.title}
            </h3>
          )}
          {item.addedAt && (
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              <ClockIcon size={12} />
              {new Date(item.addedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <ItemRenderer item={item} />
        
        {item.addedContext && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-stone-800 rounded text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Note: </span>
            <span className="text-gray-600 dark:text-gray-400">{item.addedContext}</span>
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
    <div className="space-y-2">
      {item.thumbnail && (
        <div className="relative">
          <ProgressiveImg image={item.thumbnail}>
            {({ src }) => (
              <img
                src={src}
                alt="Video thumbnail"
                className="w-full h-48 object-cover rounded"
              />
            )}
          </ProgressiveImg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <PlayIcon size={24} className="text-white fill-current" />
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <a 
          href={item.url?.toString()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
        >
          {item.url?.toString()}
        </a>
        <span className="text-sm text-gray-500 ml-2">
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function AudioItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "audio") return null;
  
  return (
    <div className="flex items-center gap-4">
      {item.albumArt && (
        <ProgressiveImg image={item.albumArt}>
          {({ src }) => (
            <img
              src={src}
              alt="Album art"
              className="w-16 h-16 object-cover rounded"
            />
          )}
        </ProgressiveImg>
      )}
      <div className="flex-1">
        <p className="font-medium">{item.artist?.toString()}</p>
        <a 
          href={item.url?.toString()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Play
        </a>
        <p className="text-sm text-gray-500">
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

function ImageItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "image") return null;
  
  return (
    <div className="space-y-2">
      <ProgressiveImg image={item.image}>
        {({ src }) => (
          <img
            src={src}
            alt={item.caption?.toString() || "Playlist image"}
            className="w-full max-h-64 object-contain rounded"
          />
        )}
      </ProgressiveImg>
      {item.caption && (
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          {item.caption.toString()}
        </p>
      )}
    </div>
  );
}

function TextItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "text") return null;
  
  return (
    <div className="prose dark:prose-invert max-w-none">
      <p className="whitespace-pre-wrap">{item.content?.toString()}</p>
    </div>
  );
}

function LinkItemRenderer({ item }: { item: PlaylistItem }) {
  if (item.type !== "link") return null;
  
  return (
    <div className="space-y-2">
      <a 
        href={item.url?.toString()} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline block"
      >
        {item.url?.toString()}
      </a>
      {item.preview && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
  return <Icon size={16} className="text-gray-500" />;
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
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <select
          value={itemType}
          onChange={(e) => onTypeChange(e.target.value as PlaylistItem["type"])}
          className="px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
        >
          {itemTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Title (optional)"
          value={formData.title || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="flex-1 px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
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
        onChange={(e) => setFormData(prev => ({ ...prev, addedContext: e.target.value }))}
        className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
        rows={2}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors"
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
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            value={data.duration || ""}
            onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
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
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
          <input
            type="url"
            placeholder="Audio URL"
            required
            value={data.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            value={data.duration || ""}
            onChange={(e) => updateField("duration", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
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
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
          <div className="text-sm text-gray-500">
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
          className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
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
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
          <input
            type="text"
            placeholder="Preview/description (optional)"
            value={data.preview || ""}
            onChange={(e) => updateField("preview", e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-stone-800 dark:border-stone-700"
          />
        </>
      );
    
    default:
      return null;
  }
}

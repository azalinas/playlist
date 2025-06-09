import { ProgressiveImg } from "jazz-react";
import { CoPlainText, ImageDefinition } from "jazz-tools";
import { ImageIcon } from "lucide-react";
import { useId, useRef } from "react";

export function AppContainer(props: { children: React.ReactNode }) {
  return (
    <div>
      {props.children}
    </div>
  );
}

export function TopBar(props: { children: React.ReactNode }) {
  return (
    <div>
      {props.children}
    </div>
  );
}

export function ChatBody(props: { children: React.ReactNode }) {
  return (
    <div role="application">
      {props.children}
    </div>
  );
}

export function EmptyChatMessage() {
  return (
    <div>
      Start a conversation below.
    </div>
  );
}

export function BubbleContainer(props: {
  children: React.ReactNode;
  fromMe: boolean | undefined;
}) {
  return (
    <div role="row">
      {props.children}
    </div>
  );
}

export function BubbleBody(props: {
  children: React.ReactNode;
  fromMe: boolean | undefined;
}) {
  return (
    <div>
      {props.children}
    </div>
  );
}

export function BubbleText(props: {
  text: CoPlainText | string;
}) {
  return (
    <p>
      {props.text}
    </p>
  );
}

export function BubbleImage(props: { image: ImageDefinition }) {
  return (
    <ProgressiveImg image={props.image}>
      {({ src }) => (
        <img src={src} />
      )}
    </ProgressiveImg>
  );
}

export function BubbleInfo(props: { by: string | undefined; madeAt: Date }) {
  return (
    <div>
      {props.by} · {props.madeAt.toLocaleTimeString()}
    </div>
  );
}

export function InputBar(props: { children: React.ReactNode }) {
  return (
    <div>
      {props.children}
    </div>
  );
}

export function ImageInput({
  onImageChange,
}: { onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Send image"
        title="Send image"
        onClick={onUploadClick}
      >
        <ImageIcon size={24} strokeWidth={1.5} />
      </button>

      <label>
        Image
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={onImageChange}
        />
      </label>
    </>
  );
}

export function TextInput(props: { onSubmit: (text: string) => void }) {
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId}>
        Type a message and press Enter
      </label>
      <input
        id={inputId}
        placeholder="Type a message and press Enter"
        maxLength={2048}
        onKeyDown={({ key, currentTarget: input }) => {
          if (key !== "Enter" || !input.value) return;
          props.onSubmit(input.value);
          input.value = "";
        }}
      />
    </div>
  );
}

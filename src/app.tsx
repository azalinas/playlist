import { apiKey } from "@/apiKey.ts";
import { useIframeHashRouter } from "hash-slash";
import { JazzInspector } from "jazz-inspector";
import { JazzProvider, useAccount } from "jazz-react";
import { Group } from "jazz-tools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlaylistScreen } from "./playlistScreen.tsx";
import { Playlist, PlaylistItemsList } from "./schema.ts";
import { ThemeProvider } from "./themeProvider.tsx";

export function App() {
  const { me } = useAccount();
  const router = useIframeHashRouter();

  const createPlaylist = () => {
    if (!me) return;
    const group = Group.create();
    group.makePublic("writer");
    const playlist = Playlist.create({
      name: "Playlist",
      description: "My cool playlist",
      items: PlaylistItemsList.create([], group),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, group);
    // router.navigate("/#/" + playlist.id);

         playlist.waitForSync().then(() => {
       router.navigate("/#/" + playlist.id);
     });
  };

  return (
    <div>
      <div>
        <button onClick={() => router.navigate("/")}>New Playlist</button>
      </div>
      {router.route({
        "/": () => createPlaylist() as never,
        "/:id": (id) => <PlaylistScreen playlistID={id} />,
      })}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <StrictMode>
      <JazzProvider
        sync={{
          peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
        }}
        // defaultProfileName={defaultProfileName}
      >
        <App />
        <JazzInspector />
      </JazzProvider>
    </StrictMode>
  </ThemeProvider>,
);

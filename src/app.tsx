import { apiKey } from "@/apiKey.ts";
import { getRandomUsername, inIframe, onPlaylistLoad } from "@/util.ts";
import { useIframeHashRouter } from "hash-slash";
import { JazzInspector } from "jazz-inspector";
import { JazzProvider, useAccount } from "jazz-react";
import { Group } from "jazz-tools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlaylistScreen } from "./playlistScreen.tsx";
import { Playlist, PlaylistItemsList } from "./schema.ts";
import { ThemeProvider } from "./themeProvider.tsx";
import { AppContainer, TopBar } from "./ui.tsx";

export function App() {
  const { me, logOut } = useAccount();
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
    router.navigate("/#/" + playlist.id);

    // for https://jazz.tools marketing site demo only
    onPlaylistLoad(playlist);
  };

  return (
    <AppContainer>
      <TopBar>
        <input
          type="text"
          value={me?.profile?.name ?? ""}
          className="bg-transparent"
          onChange={(e) => {
            if (!me?.profile) return;
            me.profile.name = e.target.value;
          }}
          placeholder="Set username"
        />
        {!inIframe && <button onClick={logOut}>Log out</button>}
      </TopBar>
      {router.route({
        "/": () => createPlaylist() as never,
        "/:id": (id) => <PlaylistScreen playlistID={id} />,
      })}
    </AppContainer>
  );
}

const url = new URL(window.location.href);
const defaultProfileName = url.searchParams.get("user") ?? getRandomUsername();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <StrictMode>
      <JazzProvider
        sync={{
          peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
        }}
        defaultProfileName={defaultProfileName}
      >
        <App />
        <JazzInspector />
      </JazzProvider>
    </StrictMode>
  </ThemeProvider>,
);

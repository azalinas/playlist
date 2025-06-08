import { ClerkProvider, useClerk } from "@clerk/clerk-react";
import { JazzInspector } from "jazz-inspector";
import { JazzProviderWithClerk } from "jazz-react-auth-clerk";
import { ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { apiKey } from "./apiKey.ts";
import "./index.css";
import { JazzAccount } from "./schema.ts";

// We use this to identify the app in the passkey auth
export const APPLICATION_NAME = "Jazz File Stream Example";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk publishable key to the .env file");
}

function JazzProvider({ children }: { children: ReactNode }) {
  const clerk = useClerk();

  return (
    <JazzProviderWithClerk
      clerk={clerk}
      sync={{
        peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
      }}
      AccountSchema={JazzAccount}
    >
      <JazzInspector />
      {children}
    </JazzProviderWithClerk>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <JazzProvider>
        <App />
      </JazzProvider>
    </ClerkProvider>
  </StrictMode>
);

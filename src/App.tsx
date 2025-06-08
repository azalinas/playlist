import { SignInButton, SignOutButton } from "@clerk/clerk-react";
import { useAccount, useIsAuthenticated } from "jazz-react";
import { FileWidget } from "./FileWidget.js";
import { Logo } from "./Logo.tsx";

function App() {
  const { me } = useAccount();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <main className="container mt-16 flex flex-col gap-8">
        <Logo />
        <div className="text-center">
          <h2 className="text-xl mb-4">
            Sign in to sync your files across devices
          </h2>
          <SignInButton />
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-16 flex flex-col gap-8">
      <Logo />
      <div className="flex justify-between items-center">
        <p>Welcome back, {me?.profile?.name || "User"}!</p>
        <SignOutButton>Sign Out</SignOutButton>
      </div>
      <FileWidget />
    </main>
  );
}

export default App;

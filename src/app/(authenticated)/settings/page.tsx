"use client";
import React, { useEffect, useState } from "react";
import RepositoryAccessList from "~/features/auth/components/RepositoryAccessList";

type Repo = { id: string; name: string; full_name: string; allowed: boolean };

export default function SettingsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/github/repos");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRepos(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(repoName: string, allow: boolean) {
    try {
      const res = await fetch("/api/settings/github/repos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName, allow }),
      });
      if (!res.ok) throw new Error("update failed");
      const body = await res.json();
      setRepos(body.data ?? repos);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect GitHub and remove imported data?")) return;
    try {
      const res = await fetch("/api/settings/github/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("disconnect failed");
      alert("Disconnected. Please sign in again if you want to reconnect.");
      load();
    } catch (err) {
      console.error(err);
      alert("Disconnect failed");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Settings</h1>
      {loading ? <div>Loading...</div> : null}
      <RepositoryAccessList repos={repos} onToggle={handleToggle} onDisconnect={handleDisconnect} />
    </main>
  );
}

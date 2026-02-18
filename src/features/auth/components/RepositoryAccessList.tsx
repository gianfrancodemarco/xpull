"use client";
import React from "react";

type Repo = {
  id: string;
  name: string;
  full_name: string;
  allowed: boolean;
};

export default function RepositoryAccessList({
  repos,
  onToggle,
  onDisconnect,
}: {
  repos: Repo[];
  onToggle: (repoName: string, allow: boolean) => Promise<void>;
  onDisconnect: () => Promise<void>;
}) {
  return (
    <div>
      <h2>Repository Access</h2>
      <p>Toggle repository access for xpull.</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {repos.map((r) => (
          <li
            key={r.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{r.full_name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{r.name}</div>
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={r.allowed}
                  onChange={(e) => onToggle(r.name, e.target.checked)}
                />
                <span style={{ fontSize: 14 }}>Allowed</span>
              </label>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => onDisconnect()}
          style={{ background: "#c62828", color: "white", padding: "8px 12px", border: "none", borderRadius: 6 }}
        >
          Disconnect GitHub
        </button>
      </div>
    </div>
  );
}

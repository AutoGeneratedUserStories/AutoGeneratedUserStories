'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    geminiApiKey: "",
    trelloApiKey: "",
    trelloApiToken: "",
  });

  const router = useRouter();

  const handleNavigation = () => {
    router.push('/');
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("Settings saved!");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <label className="block mb-2">
        Gemini API Key:
        <input
          type="text"
          name="geminiApiKey"
          value={settings.geminiApiKey}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />
      </label>
      <label className="block mb-2">
        Trello API Key:
        <input
          type="text"
          name="trelloApiKey"
          value={settings.trelloApiKey}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />
      </label>
      <label className="block mb-2">
        Trello API Token:
        <input
          type="text"
          name="trelloApiToken"
          value={settings.trelloApiToken}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />
      </label>
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save Settings
      </button>
      <button
        onClick={handleNavigation}
        className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back to Home
      </button>
    </div>
  );
}

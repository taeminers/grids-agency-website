"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const ColorSwatch = ({ name, bgClass, textClass = "text-foreground" }: { name: string, bgClass: string, textClass?: string }) => (
    <div className={cn("flex flex-col gap-2 p-4 rounded-lg border border-border", bgClass, textClass)}>
      <span className="font-medium capitalize">{name}</span>
      <span className="text-xs opacity-70">Variable</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground p-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Toggle {isDark ? "Light" : "Dark"} Mode
          </button>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Background" bgClass="bg-background" />
            <ColorSwatch name="Foreground" bgClass="bg-foreground" textClass="text-background" />
            <ColorSwatch name="Card" bgClass="bg-card" />
            <ColorSwatch name="Card FG" bgClass="bg-card-foreground" textClass="text-card" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Primary" bgClass="bg-primary" textClass="text-primary-foreground" />
            <ColorSwatch name="Secondary" bgClass="bg-secondary" textClass="text-secondary-foreground" />
            <ColorSwatch name="Tertiary" bgClass="bg-tertiary" textClass="text-tertiary-foreground" />
            <ColorSwatch name="Muted" bgClass="bg-muted" textClass="text-muted-foreground" />
            <ColorSwatch name="Accent" bgClass="bg-accent" textClass="text-accent-foreground" />
            <ColorSwatch name="Destructive" bgClass="bg-destructive" textClass="text-destructive-foreground" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">UI Elements</h2>
          <div className="grid gap-4 p-6 border border-border rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Input Field</label>
              <input 
                type="text" 
                placeholder="Type something..." 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Primary Button
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  Outline Button
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
                  Destructive
                </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

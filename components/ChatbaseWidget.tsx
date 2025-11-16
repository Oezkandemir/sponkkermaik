"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatbase?: any;
  }
}

export default function ChatbaseWidget() {
  useEffect(() => {
    // Chatbase Initialisierung
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };

      window.chatbase = new Proxy(window.chatbase, {
        get(target: any, prop: string) {
          if (prop === "q") {
            return target.q;
          }
          return (...args: any[]) => target(prop, ...args);
        },
      });

      const onLoad = () => {
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "pD2jaDR7B6k89RPlgJbiM";
        script.setAttribute("domain", "www.chatbase.co");
        document.body.appendChild(script);
      };

      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    }

    // Optional: Benutzer identifizieren (wenn Token vorhanden)
    // Dies kann später aktiviert werden, wenn eine Anmeldung implementiert wird
    // const identifyUser = async () => {
    //   try {
    //     const response = await fetch('/api/chatbase/token');
    //     if (response.ok) {
    //       const { token } = await response.json();
    //       if (token && window.chatbase) {
    //         window.chatbase('identify', { token });
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error identifying user for Chatbase:', error);
    //   }
    // };
    // identifyUser();
  }, []);

  return null;
}


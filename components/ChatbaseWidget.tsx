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
        
        // Warte auf das Widget und entferne schwarzen Hintergrund + Begrüßungstext
        const removeBlackBackground = () => {
          const widget = document.querySelector('[id*="chatbase"], [class*="chatbase"], iframe[src*="chatbase"]');
          if (widget) {
            const style = document.createElement('style');
            style.id = 'chatbase-custom-styles';
            style.textContent = `
              [id*="chatbase"] *,
              [class*="chatbase"] *,
              iframe[src*="chatbase"] {
                background: transparent !important;
                background-color: transparent !important;
              }
              
              /* Begrüßungstext "Wie kann ich dir helfen" ausblenden */
              [id*="chatbase"] *[class*="greeting"],
              [id*="chatbase"] *[class*="Greeting"],
              [id*="chatbase"] *[class*="welcome"],
              [id*="chatbase"] *[class*="Welcome"],
              [id*="chatbase"] *[class*="intro"],
              [id*="chatbase"] *[class*="Intro"],
              [id*="chatbase"] *[data-greeting],
              [id*="chatbase"] *[data-welcome],
              [class*="chatbase"] *[class*="greeting"],
              [class*="chatbase"] *[class*="Greeting"],
              [class*="chatbase"] *[class*="welcome"],
              [class*="chatbase"] *[class*="Welcome"],
              [class*="chatbase"] *[class*="intro"],
              [class*="chatbase"] *[class*="Intro"],
              iframe[src*="chatbase"] *[class*="greeting"],
              iframe[src*="chatbase"] *[class*="Greeting"],
              iframe[src*="chatbase"] *[class*="welcome"],
              iframe[src*="chatbase"] *[class*="Welcome"],
              iframe[src*="chatbase"] *[class*="intro"],
              iframe[src*="chatbase"] *[class*="Intro"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            `;
            
            // Entferne alte Styles falls vorhanden
            const oldStyle = document.getElementById('chatbase-custom-styles');
            if (oldStyle) {
              oldStyle.remove();
            }
            
            document.head.appendChild(style);
            
            // Versuche auch direkt im iframe zu suchen und zu entfernen
            const iframe = document.querySelector('iframe[src*="chatbase"]') as HTMLIFrameElement;
            if (iframe) {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  // Suche nach Begrüßungstexten im iframe
                  const greetingElements = iframeDoc.querySelectorAll('*');
                  greetingElements.forEach((el) => {
                    const text = el.textContent || '';
                    const className = el.className || '';
                    if (
                      (text.includes('Wie kann ich dir helfen') ||
                       text.includes('How can I help') ||
                       text.includes('wie kann ich') ||
                       className.toLowerCase().includes('greeting') ||
                       className.toLowerCase().includes('welcome') ||
                       className.toLowerCase().includes('intro')) &&
                      el.tagName !== 'BODY' &&
                      el.tagName !== 'HTML'
                    ) {
                      (el as HTMLElement).style.display = 'none';
                      (el as HTMLElement).style.visibility = 'hidden';
                      (el as HTMLElement).style.opacity = '0';
                      (el as HTMLElement).style.height = '0';
                      (el as HTMLElement).style.overflow = 'hidden';
                    }
                  });
                }
              } catch (e) {
                // Cross-origin restrictions können auftreten, das ist normal
                console.log('Chatbase iframe access restricted (normal)');
              }
            }
          } else {
            // Versuche es erneut nach kurzer Verzögerung
            setTimeout(removeBlackBackground, 500);
          }
        };
        
        setTimeout(removeBlackBackground, 1000);
        
        // Wiederhole nach längerer Verzögerung für dynamisch geladene Inhalte
        setTimeout(removeBlackBackground, 3000);
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


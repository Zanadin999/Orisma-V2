import { useEffect } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";

export function useGoogleFont() {
  useEffect(() => {
    if (document.getElementById("sb-font-link")) return;
    const link = document.createElement("link");
    link.id = "sb-font-link";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);
}

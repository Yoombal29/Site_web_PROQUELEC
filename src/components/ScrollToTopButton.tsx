
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-7 right-6 z-50 p-3 bg-gradient-to-br from-proqblue via-proqblue-dark to-proqgray-dark text-white shadow-2xl rounded-full animate-fade-in hover:scale-110 transition-all duration-200 border border-proqgray-medium hover:from-proqblue-dark"
      aria-label="Retour en haut"
      tabIndex={0}
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

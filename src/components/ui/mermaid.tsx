import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif"
});

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      setLoading(true);
      setError(null);

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err: unknown) {
        console.error("Mermaid Render Error:", err);
        setError("Erreur de rendu du diagramme");
      } finally {
        setLoading(false);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-mono">
                {error}
            </div>);

  }

  return (
    <div className="my-4 overflow-x-auto rounded-xl bg-slate-900/30 p-4 border border-white/5 flex items-center justify-center min-h-[100px]">
            {loading ?
      <Loader2 className="w-6 h-6 animate-spin text-cyan-500 opacity-50" /> :

      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svg }}
        className="w-full max-w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto" />

      }
        </div>);

};
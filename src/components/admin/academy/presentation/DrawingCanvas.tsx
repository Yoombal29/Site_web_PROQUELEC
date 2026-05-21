import React, { useRef, useEffect, useState, useCallback } from 'react';


interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  type: 'pen' | 'highlighter';
}

interface DrawingCanvasProps {
  isActive: boolean;
  tool: ToolType;
  penColor: string;
  onClear?: boolean;
  onClearComplete?: () => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isActive,
  tool,
  penColor,
  onClear,
  onClearComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  // Clear canvas when requested
  useEffect(() => {
    if (onClear) {
      setPaths([]);
      setCurrentPath(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      onClearComplete?.();
    }
  }, [onClear, onClearComplete]);

  // Resize canvas to match window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawPaths();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redrawPaths = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (path.type === 'highlighter') {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1;
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length - 1; i++) {
        const xc = (path.points[i].x + path.points[i + 1].x) / 2;
        const yc = (path.points[i].y + path.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
      }

      const lastPoint = path.points[path.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }, [paths]);

  useEffect(() => {
    redrawPaths();
  }, [paths, redrawPaths]);

  const getPointerPos = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || tool !== 'pen' && tool !== 'highlighter' && tool !== 'eraser') return;

    setIsDrawing(true);
    const pos = getPointerPos(e);

    if (tool === 'eraser') {
      // Find and remove paths near the click
      const eraserRadius = 20;
      setPaths((prev) => prev.filter((path) => {
        return !path.points.some((point) =>
        Math.abs(point.x - pos.x) < eraserRadius &&
        Math.abs(point.y - pos.y) < eraserRadius
        );
      }));
      return;
    }

    const newPath: DrawingPath = {
      points: [pos],
      color: tool === 'highlighter' ? '#FFFF00' : penColor,
      width: tool === 'highlighter' ? 20 : 3,
      type: tool as 'pen' | 'highlighter'
    };
    setCurrentPath(newPath);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentPath || tool === 'eraser') return;

    const pos = getPointerPos(e);
    setCurrentPath((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, pos]
      };
    });

    // Draw current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentPath.points;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = currentPath.color;
    ctx.lineWidth = currentPath.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentPath.type === 'highlighter') {
      ctx.globalAlpha = 0.4;
    }

    const lastPoint = points[points.length - 1];
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const handlePointerUp = () => {
    if (currentPath && currentPath.points.length > 1) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const getCursor = () => {
    if (!isActive) return 'default';
    switch (tool) {
      case 'pen':return 'crosshair';
      case 'highlighter':return 'crosshair';
      case 'eraser':return 'cell';
      case 'laser':return 'none';
      default:return 'default';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        cursor: getCursor(),
        pointerEvents: isActive && (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') ? 'auto' : 'none',
        zIndex: 10
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp} />);


};
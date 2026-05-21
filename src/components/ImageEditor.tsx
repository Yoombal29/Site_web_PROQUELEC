
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Save, RotateCw, Undo, Wand2 } from 'lucide-react';
import Konva from 'konva';

interface ImageEditorProps {
  imageUrl: string;
  fileName: string;
  onSave?: (newFile: File) => void;
  onClose: () => void;
}

const FilterControls = ({ label, value, onChange, min, max, step }: unknown) =>
<div className="space-y-1">
        <div className="flex justify-between text-xs">
            <Label>{label}</Label>
            <span className="text-slate-500">{value}</span>
        </div>
        <Slider
    value={[value]}
    min={min}
    max={max}
    step={step}
    onValueChange={(vals) => onChange(vals[0])} />
  
    </div>;


export function ImageEditor({ imageUrl, fileName, onSave, onClose }: ImageEditorProps) {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);

  // Load image manually to avoid use-image dependency
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // Edit States
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (image) {
      // Calculate aspect ratio to fit in window (max 800x600)
      const maxW = 800;
      const maxH = 600;
      let w = image.width;
      let h = image.height;
      const ratio = w / h;

      if (w > maxW) {
        w = maxW;
        h = w / ratio;
      }
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      setDimensions({ width: w, height: h });
    }
  }, [image]);

  // Apply filters when values change
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
    }
  }, [image, brightness, contrast, blur]);

  const handleDownload = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `edited-${fileName}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (!stageRef.current || !onSave) return;

    // Convert stage to blob/file
    const uri = stageRef.current.toDataURL();
    // Helper to convert dataURL to File would go here
    // For now, we will just download as MVP or trigger callback with URI
    handleDownload(); // Default to download for now
    onClose();
  };

  if (!image) return <div className="flex items-center justify-center h-96">Chargement de l'image...</div>;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Canvas Area */}
                <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner p-4 min-h-[400px]">
                    {dimensions.width > 0 &&
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            ref={stageRef}
            className="shadow-lg">
            
                            <Layer>
                                <KonvaImage
                image={image}
                width={dimensions.width}
                height={dimensions.height}
                ref={imageRef}
                filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Blur]}
                brightness={brightness}
                contrast={contrast}
                blurRadius={blur}
                rotation={rotation}
                x={rotation ? dimensions.width / 2 : 0}
                y={rotation ? dimensions.height / 2 : 0}
                offsetX={rotation ? dimensions.width / 2 : 0}
                offsetY={rotation ? dimensions.height / 2 : 0} />
              
                            </Layer>
                        </Stage>
          }
                </div>

                {/* Controls Area */}
                <div className="w-full lg:w-72 space-y-6 p-1">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-slate-700 pb-2 border-b">
                            <Wand2 className="w-4 h-4" />
                            Outils de Retouche
                        </div>

                        <FilterControls
              label="Luminosité"
              value={brightness}
              onChange={setBrightness}
              min={-1} max={1} step={0.05} />
            
                        <FilterControls
              label="Contraste"
              value={contrast}
              onChange={setContrast}
              min={-100} max={100} step={1} />
            
                        <FilterControls
              label="Flou Artistique"
              value={blur}
              onChange={setBlur}
              min={0} max={20} step={1} />
            

                        <div className="pt-2">
                            <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setRotation((r) => r + 90)}>
                
                                <RotateCw className="w-4 h-4 mr-2" />
                                Pivoter 90°
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                        <Button className="flex-1" variant="outline" onClick={async () => {
              setBrightness(0);setContrast(0);setBlur(0);setRotation(0);
            }}>
                            <Undo className="w-4 h-4 mr-2" />
                            Réinitialiser
                        </Button>
                        <Button className="flex-1 bg-proqblue hover:bg-blue-700" onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            </div>
        </div>);

}
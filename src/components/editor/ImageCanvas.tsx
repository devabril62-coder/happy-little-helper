import { useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCanvasProps {
  original: string | null;
  edited: string | null;
  isLoading: boolean;
  loadingMessage: string;
  onDownload: (type: 'original' | 'edited') => void;
}

export function ImageCanvas({
  original,
  edited,
  isLoading,
  loadingMessage,
  onDownload,
}: ImageCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [showComparison, setShowComparison] = useState(true);
  const [viewMode, setViewMode] = useState<'comparison' | 'original' | 'edited'>('comparison');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  if (!original) {
    return (
      <div className="flex items-center justify-center h-full bg-editor-canvas rounded-xl border border-border">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Nenhuma imagem carregada</p>
          <p className="text-sm">Faça upload de uma imagem para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-editor-canvas rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          {edited && (
            <>
              <Button
                variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('comparison')}
              >
                Comparar
              </Button>
              <Button
                variant={viewMode === 'original' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('original')}
              >
                Original
              </Button>
              <Button
                variant={viewMode === 'edited' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('edited')}
              >
                Editada
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleResetZoom}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload('original')}
          >
            <Download className="w-4 h-4 mr-1" />
            Original
          </Button>
          {edited && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownload('edited')}
              className="glow-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Editada
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto p-4">
        <div 
          className="relative mx-auto transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse">{loadingMessage}</p>
            </div>
          )}

          {edited && viewMode === 'comparison' ? (
            <div className="rounded-lg overflow-hidden editor-shadow">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={original}
                    alt="Original"
                    style={{ objectFit: 'contain' }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={edited}
                    alt="Edited"
                    style={{ objectFit: 'contain' }}
                    className="checkerboard"
                  />
                }
                position={50}
                style={{
                  height: 'auto',
                  maxHeight: '70vh',
                }}
              />
            </div>
          ) : (
            <div className={cn(
              "rounded-lg overflow-hidden editor-shadow",
              !edited && "checkerboard"
            )}>
              <img
                src={viewMode === 'edited' && edited ? edited : original}
                alt={viewMode === 'edited' ? 'Edited' : 'Original'}
                className="max-h-[70vh] w-auto mx-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
        <span>
          {edited ? 'Original + Editada' : 'Apenas Original'}
        </span>
        <span>
          Arraste o slider para comparar
        </span>
      </div>
    </div>
  );
}

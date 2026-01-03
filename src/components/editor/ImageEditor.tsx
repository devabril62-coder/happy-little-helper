import { useState } from 'react';
import { Header } from './Header';
import { ImageUploader } from './ImageUploader';
import { ImageCanvas } from './ImageCanvas';
import { ToolPanel } from './ToolPanel';
import { VariationsPanel } from './VariationsPanel';
import { useImageEditor } from '@/hooks/use-image-editor';

export function ImageEditor() {
  const {
    imageState,
    uploadImage,
    removeImageBackground,
    changeScene,
    changeStyle,
    changeClothing,
    changePose,
    generateVariations,
    applyCustomEdit,
    selectVariation,
    downloadImage,
    reset,
  } = useImageEditor();

  const [showVariations, setShowVariations] = useState(false);

  const handleGenerateVariations = async (count: number, prompt?: string) => {
    await generateVariations(count, prompt);
    setShowVariations(true);
  };

  const handleSelectVariation = (index: number) => {
    selectVariation(index);
    setShowVariations(false);
  };

  const hasImage = !!imageState.original;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onReset={reset} hasImage={hasImage} />

      <main className="flex-1 flex overflow-hidden">
        {!hasImage ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <ImageUploader
                onUpload={uploadImage}
                disabled={imageState.isLoading}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Canvas Area */}
            <div className="flex-1 p-4 overflow-hidden">
              <ImageCanvas
                original={imageState.original}
                edited={imageState.edited}
                isLoading={imageState.isLoading}
                loadingMessage={imageState.loadingMessage}
                onDownload={downloadImage}
              />
            </div>

            {/* Tool Panel */}
            <div className="w-80 p-4 border-l border-border">
              <ToolPanel
                onRemoveBackground={removeImageBackground}
                onChangeScene={changeScene}
                onChangeStyle={changeStyle}
                onChangeClothing={changeClothing}
                onChangePose={changePose}
                onGenerateVariations={handleGenerateVariations}
                onCustomEdit={applyCustomEdit}
                disabled={imageState.isLoading}
                hasImage={hasImage}
              />
            </div>
          </>
        )}
      </main>

      {/* Variations Modal */}
      {showVariations && imageState.variations.length > 0 && (
        <VariationsPanel
          variations={imageState.variations}
          onSelect={handleSelectVariation}
          onDownload={(index) => downloadImage('variation', index)}
          onClose={() => setShowVariations(false)}
        />
      )}
    </div>
  );
}

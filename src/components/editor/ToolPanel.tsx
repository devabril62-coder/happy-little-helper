import { useState, useRef } from 'react';
import { 
  Eraser, 
  Image, 
  Sparkles, 
  Copy, 
  Wand2,
  Shirt,
  User,
  Mountain,
  Building2,
  Waves,
  TreePine,
  Send,
  Upload,
  Camera,
  Palette,
  Sun,
  Sunset,
  Stars
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { imageToBase64 } from '@/lib/image-processing';

interface ToolPanelProps {
  onRemoveBackground: () => void;
  onChangeScene: (prompt: string) => void;
  onChangeStyle: (prompt: string) => void;
  onChangeClothing: (description: string, clothingImage?: string) => void;
  onChangePose: (description: string, poseImage?: string) => void;
  onGenerateVariations: (count: number, prompt?: string) => void;
  onCustomEdit: (prompt: string) => void;
  disabled?: boolean;
  hasImage: boolean;
}

const scenePresets = [
  { id: 'beach', label: 'Praia Tropical', icon: Waves, prompt: 'Beautiful tropical beach with crystal clear turquoise water, white sand, and palm trees swaying in the breeze at golden hour sunset' },
  { id: 'forest', label: 'Floresta Encantada', icon: TreePine, prompt: 'Mystical enchanted forest with soft golden sunlight filtering through ancient trees, magical atmosphere with subtle mist' },
  { id: 'city', label: 'Cidade Noturna', icon: Building2, prompt: 'Glamorous modern city skyline at night with sparkling lights, luxurious urban atmosphere, professional photography' },
  { id: 'mountain', label: 'Montanhas', icon: Mountain, prompt: 'Majestic snow-capped mountain landscape with dramatic clouds and epic lighting, breathtaking natural scenery' },
  { id: 'studio', label: 'Estúdio Pro', icon: Camera, prompt: 'Professional photography studio with clean seamless backdrop, perfect soft lighting, high-end fashion photography setup' },
  { id: 'sunset', label: 'Pôr do Sol', icon: Sunset, prompt: 'Stunning golden hour sunset with warm orange and pink tones, romantic and dreamy atmosphere' },
];

const stylePresets = [
  { id: 'cinematic', label: 'Cinematográfico', icon: Camera, prompt: 'Cinematic Hollywood movie color grading, dramatic lighting, film-like atmosphere, professional cinematography' },
  { id: 'editorial', label: 'Editorial Fashion', icon: Sparkles, prompt: 'High-end Vogue fashion editorial style, professional studio lighting, luxury fashion photography' },
  { id: 'vintage', label: 'Vintage Retrô', icon: Palette, prompt: 'Vintage 1970s film photography aesthetic, warm nostalgic tones, subtle film grain, retro vibes' },
  { id: 'artistic', label: 'Artístico', icon: Stars, prompt: 'Fine art photography style, dramatic chiaroscuro lighting, museum-quality artistic composition' },
  { id: 'bright', label: 'Bright & Airy', icon: Sun, prompt: 'Bright and airy photography style, soft natural lighting, clean and fresh aesthetic, Instagram-worthy' },
  { id: 'moody', label: 'Moody Dark', icon: Sunset, prompt: 'Moody and dramatic dark aesthetic, rich shadows, intense atmosphere, editorial mood lighting' },
];

const clothingPresets = [
  { id: 'elegant-dress', label: 'Vestido Elegante', prompt: 'Elegant flowing evening gown dress in deep burgundy or navy blue, sophisticated and luxurious' },
  { id: 'casual-chic', label: 'Casual Chic', prompt: 'Stylish casual outfit with designer jeans and beautiful blouse, modern and trendy' },
  { id: 'formal-suit', label: 'Terno Formal', prompt: 'Tailored professional business suit, elegant and sophisticated, perfect fit' },
  { id: 'summer-dress', label: 'Vestido Verão', prompt: 'Light and breezy summer dress with floral patterns, fresh and feminine' },
  { id: 'lingerie', label: 'Lingerie Elegante', prompt: 'Elegant and tasteful lingerie set, sophisticated lace details, classy and refined' },
  { id: 'sportswear', label: 'Esportivo', prompt: 'Modern athletic sportswear, sleek and stylish fitness outfit' },
];

const posePresets = [
  { id: 'standing', label: 'Em Pé Elegante', prompt: 'Elegant standing pose with confident posture, one hand on hip, fashion model stance' },
  { id: 'sitting', label: 'Sentado(a)', prompt: 'Relaxed sitting pose on a chair or sofa, natural and comfortable, casual elegance' },
  { id: 'walking', label: 'Caminhando', prompt: 'Dynamic walking pose, confident stride, captured mid-motion, editorial style' },
  { id: 'leaning', label: 'Apoiado(a)', prompt: 'Casually leaning against a wall or surface, relaxed and cool, lifestyle pose' },
  { id: 'profile', label: 'Perfil Artístico', prompt: 'Side profile pose, artistic composition, elegant silhouette, fashion photography' },
  { id: 'dynamic', label: 'Pose Dinâmica', prompt: 'Dynamic action pose with movement, energetic and expressive, editorial fashion' },
];

export function ToolPanel({
  onRemoveBackground,
  onChangeScene,
  onChangeStyle,
  onChangeClothing,
  onChangePose,
  onGenerateVariations,
  onCustomEdit,
  disabled,
  hasImage,
}: ToolPanelProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'scene' | 'style' | 'clothing' | 'pose' | 'variations' | 'custom'>('background');
  const [customScenePrompt, setCustomScenePrompt] = useState('');
  const [customStylePrompt, setCustomStylePrompt] = useState('');
  const [customClothingPrompt, setCustomClothingPrompt] = useState('');
  const [customPosePrompt, setCustomPosePrompt] = useState('');
  const [variationCount, setVariationCount] = useState([3]);
  const [variationPrompt, setVariationPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const clothingInputRef = useRef<HTMLInputElement>(null);
  const poseInputRef = useRef<HTMLInputElement>(null);

  const handleClothingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await imageToBase64(file);
      onChangeClothing('Use this clothing reference image', base64);
    }
  };

  const handlePoseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await imageToBase64(file);
      onChangePose('Copy the pose from this reference image', base64);
    }
  };

  const tabs = [
    { id: 'background' as const, label: 'Fundo', icon: Eraser },
    { id: 'clothing' as const, label: 'Roupa', icon: Shirt },
    { id: 'pose' as const, label: 'Pose', icon: User },
    { id: 'scene' as const, label: 'Cenário', icon: Image },
    { id: 'style' as const, label: 'Estilo', icon: Sparkles },
    { id: 'variations' as const, label: 'Variações', icon: Copy },
    { id: 'custom' as const, label: 'Livre', icon: Wand2 },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!hasImage}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
              !hasImage && 'opacity-50 cursor-not-allowed'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'background' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center py-6">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                <Eraser className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Remover Fundo</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Remove o fundo da imagem com IA profissional, preservando bordas precisas.
              </p>
              <Button
                onClick={onRemoveBackground}
                disabled={disabled || !hasImage}
                size="lg"
                className="glow-sm w-full"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Remover Fundo com IA
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'clothing' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Roupas Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {clothingPresets.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  onClick={() => onChangeClothing(item.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 px-2 text-center hover:bg-primary/10 hover:border-primary"
                >
                  <span className="text-xs leading-tight">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Roupa Personalizada
              </h3>
              
              <Button
                variant="outline"
                onClick={() => clothingInputRef.current?.click()}
                disabled={disabled || !hasImage}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Foto de Roupa
              </Button>
              <input
                ref={clothingInputRef}
                type="file"
                accept="image/*"
                onChange={handleClothingImageUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Descreva a roupa desejada..."
                  value={customClothingPrompt}
                  onChange={(e) => setCustomClothingPrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customClothingPrompt.trim()) {
                      onChangeClothing(customClothingPrompt);
                      setCustomClothingPrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customClothingPrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pose' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Poses Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {posePresets.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  onClick={() => onChangePose(item.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 px-2 text-center hover:bg-primary/10 hover:border-primary"
                >
                  <span className="text-xs leading-tight">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pose Personalizada
              </h3>
              
              <Button
                variant="outline"
                onClick={() => poseInputRef.current?.click()}
                disabled={disabled || !hasImage}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Foto de Referência
              </Button>
              <input
                ref={poseInputRef}
                type="file"
                accept="image/*"
                onChange={handlePoseImageUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Descreva a pose desejada..."
                  value={customPosePrompt}
                  onChange={(e) => setCustomPosePrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customPosePrompt.trim()) {
                      onChangePose(customPosePrompt);
                      setCustomPosePrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customPosePrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scene' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Cenários Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {scenePresets.map((scene) => (
                <Button
                  key={scene.id}
                  variant="outline"
                  onClick={() => onChangeScene(scene.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <scene.icon className="w-5 h-5" />
                  <span className="text-xs">{scene.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Cenário Personalizado
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva o novo cenário..."
                  value={customScenePrompt}
                  onChange={(e) => setCustomScenePrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customScenePrompt.trim()) {
                      onChangeScene(customScenePrompt);
                      setCustomScenePrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customScenePrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Estilos Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.map((style) => (
                <Button
                  key={style.id}
                  variant="outline"
                  onClick={() => onChangeStyle(style.prompt)}
                  disabled={disabled || !hasImage}
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary"
                >
                  <style.icon className="w-5 h-5" />
                  <span className="text-xs">{style.label}</span>
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Estilo Personalizado
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Descreva o estilo desejado..."
                  value={customStylePrompt}
                  onChange={(e) => setCustomStylePrompt(e.target.value)}
                  disabled={disabled || !hasImage}
                />
                <Button
                  onClick={() => {
                    if (customStylePrompt.trim()) {
                      onChangeStyle(customStylePrompt);
                      setCustomStylePrompt('');
                    }
                  }}
                  disabled={disabled || !hasImage || !customStylePrompt.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quantidade de Variações
              </h3>
              <div className="space-y-4">
                <Slider
                  value={variationCount}
                  onValueChange={setVariationCount}
                  min={1}
                  max={5}
                  step={1}
                  disabled={disabled || !hasImage}
                />
                <div className="text-center text-2xl font-bold text-primary">
                  {variationCount[0]}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Direção das Variações (opcional)
              </h3>
              <Textarea
                placeholder="Ex: Diferentes iluminações, poses sutis, expressões variadas..."
                value={variationPrompt}
                onChange={(e) => setVariationPrompt(e.target.value)}
                disabled={disabled || !hasImage}
                rows={2}
                className="resize-none"
              />
            </div>

            <Button
              onClick={() => onGenerateVariations(variationCount[0], variationPrompt || undefined)}
              disabled={disabled || !hasImage}
              className="w-full glow-sm"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              Gerar {variationCount[0]} Variações
            </Button>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center py-2">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-3">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Edição Livre</h3>
              <p className="text-sm text-muted-foreground">
                Descreva qualquer alteração que você deseja fazer na imagem.
              </p>
            </div>
            
            <Textarea
              placeholder="Ex: Trocar o cabelo para loiro, adicionar óculos de sol, mudar a expressão para sorriso, adicionar maquiagem glamourosa..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={disabled || !hasImage}
              rows={5}
              className="resize-none"
            />
            <Button
              onClick={() => {
                if (customPrompt.trim()) {
                  onCustomEdit(customPrompt);
                  setCustomPrompt('');
                }
              }}
              disabled={disabled || !hasImage || !customPrompt.trim()}
              className="w-full glow-sm"
              size="lg"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Aplicar Edição com IA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

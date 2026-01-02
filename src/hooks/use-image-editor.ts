import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage, imageToBase64, blobToBase64 } from '@/lib/image-processing';
import { toast } from 'sonner';

export interface ImageState {
  original: string | null;
  edited: string | null;
  variations: string[];
  isLoading: boolean;
  loadingMessage: string;
}

export type EditOperation = 
  | 'remove-background'
  | 'change-scene'
  | 'change-style'
  | 'generate-variations';

export function useImageEditor() {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    edited: null,
    variations: [],
    isLoading: false,
    loadingMessage: '',
  });

  const setLoading = (isLoading: boolean, message = '') => {
    setImageState(prev => ({ ...prev, isLoading, loadingMessage: message }));
  };

  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true, 'Carregando imagem...');
      const base64 = await imageToBase64(file);
      setImageState(prev => ({
        ...prev,
        original: base64,
        edited: null,
        variations: [],
        isLoading: false,
        loadingMessage: '',
      }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
      setLoading(false);
    }
  }, []);

  const removeImageBackground = useCallback(async () => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Removendo fundo... (carregando modelo de IA)');
      
      const img = new Image();
      img.src = imageState.original;
      await new Promise((resolve) => { img.onload = resolve; });
      
      setLoading(true, 'Processando imagem...');
      const resultBlob = await removeBackground(img);
      const resultBase64 = await blobToBase64(resultBlob);
      
      setImageState(prev => ({
        ...prev,
        edited: resultBase64,
        isLoading: false,
        loadingMessage: '',
      }));
      toast.success('Fundo removido com sucesso!');
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Erro ao remover fundo. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const changeScene = useCallback(async (scenePrompt: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Alterando cenário com IA...');
      
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          image: imageState.original,
          prompt: `Change the background/scene to: ${scenePrompt}. Keep the main subject exactly the same, preserve their identity, pose, and proportions perfectly. Only change the background environment.`,
          operation: 'change-scene',
        },
      });

      if (error) throw error;
      
      if (data?.editedImage) {
        setImageState(prev => ({
          ...prev,
          edited: data.editedImage,
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success('Cenário alterado com sucesso!');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Error changing scene:', error);
      toast.error('Erro ao alterar cenário. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const changeStyle = useCallback(async (stylePrompt: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Aplicando estilo com IA...');
      
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          image: imageState.original,
          prompt: `Apply this visual style to the image: ${stylePrompt}. Preserve the subject's identity and composition.`,
          operation: 'change-style',
        },
      });

      if (error) throw error;
      
      if (data?.editedImage) {
        setImageState(prev => ({
          ...prev,
          edited: data.editedImage,
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success('Estilo aplicado com sucesso!');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Error changing style:', error);
      toast.error('Erro ao aplicar estilo. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const generateVariations = useCallback(async (count: number = 3, variationPrompt?: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, `Gerando ${count} variações...`);
      
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          image: imageState.original,
          prompt: variationPrompt || 'Create a variation of this image with slightly different lighting and atmosphere, but preserve the subject exactly.',
          operation: 'generate-variations',
          count,
        },
      });

      if (error) throw error;
      
      if (data?.variations && Array.isArray(data.variations)) {
        setImageState(prev => ({
          ...prev,
          variations: data.variations,
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success(`${data.variations.length} variações geradas!`);
      } else if (data?.editedImage) {
        setImageState(prev => ({
          ...prev,
          variations: [data.editedImage],
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success('Variação gerada!');
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error('Erro ao gerar variações. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const applyCustomEdit = useCallback(async (customPrompt: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Aplicando edição personalizada...');
      
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          image: imageState.original,
          prompt: customPrompt,
          operation: 'custom',
        },
      });

      if (error) throw error;
      
      if (data?.editedImage) {
        setImageState(prev => ({
          ...prev,
          edited: data.editedImage,
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success('Edição aplicada com sucesso!');
      }
    } catch (error) {
      console.error('Error applying custom edit:', error);
      toast.error('Erro ao aplicar edição. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const selectVariation = useCallback((index: number) => {
    if (imageState.variations[index]) {
      setImageState(prev => ({
        ...prev,
        edited: prev.variations[index],
      }));
      toast.success('Variação selecionada!');
    }
  }, [imageState.variations]);

  const reset = useCallback(() => {
    setImageState({
      original: null,
      edited: null,
      variations: [],
      isLoading: false,
      loadingMessage: '',
    });
  }, []);

  const downloadImage = useCallback((type: 'original' | 'edited' | 'variation', index?: number) => {
    let imageUrl: string | null = null;
    let filename = 'image';

    switch (type) {
      case 'original':
        imageUrl = imageState.original;
        filename = 'original';
        break;
      case 'edited':
        imageUrl = imageState.edited;
        filename = 'edited';
        break;
      case 'variation':
        if (index !== undefined && imageState.variations[index]) {
          imageUrl = imageState.variations[index];
          filename = `variation-${index + 1}`;
        }
        break;
    }

    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download iniciado!');
    }
  }, [imageState]);

  return {
    imageState,
    uploadImage,
    removeImageBackground,
    changeScene,
    changeStyle,
    generateVariations,
    applyCustomEdit,
    selectVariation,
    downloadImage,
    reset,
  };
}

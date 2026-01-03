import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { imageToBase64 } from '@/lib/image-processing';
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
  | 'change-clothing'
  | 'change-pose'
  | 'generate-variations'
  | 'custom-edit';

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
      setLoading(true, 'Removendo fundo com IA profissional...');
      
      const { data, error } = await supabase.functions.invoke('remove-background', {
        body: { image: imageState.original },
      });

      if (error) throw error;
      
      if (data?.editedImage) {
        setImageState(prev => ({
          ...prev,
          edited: data.editedImage,
          isLoading: false,
          loadingMessage: '',
        }));
        toast.success('Fundo removido com sucesso!');
      } else {
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error removing background:', error);
      toast.error(error?.message || 'Erro ao remover fundo. Tente novamente.');
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
          prompt: scenePrompt,
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
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error changing scene:', error);
      toast.error(error?.message || 'Erro ao alterar cenário. Tente novamente.');
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
          prompt: stylePrompt,
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
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error changing style:', error);
      toast.error(error?.message || 'Erro ao aplicar estilo. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const changeClothing = useCallback(async (clothingDescription: string, clothingImage?: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Trocando roupa com IA...');
      
      const { data, error } = await supabase.functions.invoke('change-clothing', {
        body: {
          image: imageState.original,
          clothingDescription,
          clothingImage,
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
        toast.success('Roupa alterada com sucesso!');
      } else {
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error changing clothing:', error);
      toast.error(error?.message || 'Erro ao trocar roupa. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const changePose = useCallback(async (poseDescription: string, poseImage?: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, 'Alterando pose com IA...');
      
      const { data, error } = await supabase.functions.invoke('change-pose', {
        body: {
          image: imageState.original,
          poseDescription,
          poseImage,
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
        toast.success('Pose alterada com sucesso!');
      } else {
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error changing pose:', error);
      toast.error(error?.message || 'Erro ao alterar pose. Tente novamente.');
      setLoading(false);
    }
  }, [imageState.original]);

  const generateVariations = useCallback(async (count: number = 3, variationPrompt?: string) => {
    if (!imageState.original) {
      toast.error('Nenhuma imagem carregada');
      return;
    }

    try {
      setLoading(true, `Gerando ${count} variações com IA...`);
      
      const { data, error } = await supabase.functions.invoke('generate-variations', {
        body: {
          image: imageState.original,
          count,
          prompt: variationPrompt,
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
      } else {
        throw new Error(data?.error || 'No variations returned');
      }
    } catch (error: any) {
      console.error('Error generating variations:', error);
      toast.error(error?.message || 'Erro ao gerar variações. Tente novamente.');
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
          operation: 'custom-edit',
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
      } else {
        throw new Error(data?.error || 'No image returned');
      }
    } catch (error: any) {
      console.error('Error applying custom edit:', error);
      toast.error(error?.message || 'Erro ao aplicar edição. Tente novamente.');
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
    changeClothing,
    changePose,
    generateVariations,
    applyCustomEdit,
    selectVariation,
    downloadImage,
    reset,
  };
}

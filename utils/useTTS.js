// useTTS.js
import * as Speech from 'expo-speech';
import { useCallback } from 'react';

export default function useTTS() {

  const speak = useCallback((text, options = {}) => {
    if (!text) return;

    const defaultVoice = 'pt-BR-standard-A';  // <-- ESCOLHA AQUI!
    // ou outra voz que você viu no getAvailableVoicesAsync()

    Speech.speak(text, {
      language: 'pt-BR',
      voice: defaultVoice,
      pitch: 1.0,      // 0.5 = mais grave, 1.5 = mais agudo
      rate: 0.95,      // menos = mais lento (melhor pros seus usuários)
      ...options
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop };
}

import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { useCallback, useEffect, useState } from 'react';

export const useNativeSpeech = () => {
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // リソース解放（メモリリーク対策）
        // 音声認識エンジンは消費電力が大きくメモリを占有するため、
        // コンポーネントのアンマウント時に必ず Voice.destroy() と Voice.removeAllListeners() を実行する。
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechEnd = onSpeechEnd;

        return () => {
            Voice.destroy().then(() => Voice.removeAllListeners());
        };
    }, []);

    const onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            setTranscription(e.value[0]);
        }
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
        setError(e.error?.message || 'Unknown error occurred');
        setIsRecognizing(false);
    };

    const onSpeechEnd = () => {
        setIsRecognizing(false);
    };

    const startRecognizing = useCallback(async () => {
        // 排他制御
        // 認識中に再度開始しようとするとネイティブ側でエラーが発生するため、
        // isRecognizing フラグを用いて二重起動を厳密に防止する。
        if (isRecognizing) {
            return;
        }

        try {
            setError(null);
            setTranscription('');
            setIsRecognizing(true);
            await Voice.start('ja-JP');
        } catch (e: any) {
            setError(e.message || 'Failed to start recognizing');
            setIsRecognizing(false);
        }
    }, [isRecognizing]);

    const stopRecognizing = useCallback(async () => {
        if (!isRecognizing) return;
        try {
            await Voice.stop();
            setIsRecognizing(false);
        } catch (e: any) {
            setError(e.message || 'Failed to stop recognizing');
        }
    }, [isRecognizing]);

    return {
        startRecognizing,
        stopRecognizing,
        transcription,
        isRecognizing,
        error,
    };
};

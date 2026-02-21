import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useNativeSpeech } from '../hooks/useNativeSpeech';

export const AudioTranscriber = () => {
    const { startRecognizing, stopRecognizing, transcription, isRecognizing, error } = useNativeSpeech();
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            if (Platform.OS === 'ios') {
                const micPermission = await check(PERMISSIONS.IOS.MICROPHONE);
                const speechPermission = await check(PERMISSIONS.IOS.SPEECH_RECOGNITION);

                if (micPermission !== RESULTS.GRANTED) {
                    await request(PERMISSIONS.IOS.MICROPHONE);
                }
                if (speechPermission !== RESULTS.GRANTED) {
                    await request(PERMISSIONS.IOS.SPEECH_RECOGNITION);
                }

                const finalMic = await check(PERMISSIONS.IOS.MICROPHONE);
                const finalSpeech = await check(PERMISSIONS.IOS.SPEECH_RECOGNITION);

                if (finalMic === RESULTS.GRANTED && finalSpeech === RESULTS.GRANTED) {
                    setPermissionsGranted(true);
                } else {
                    setPermissionsGranted(false);
                }
            } else {
                // For Android, just set it to true for now, though Android would need its own permissions (RECORD_AUDIO)
                setPermissionsGranted(true);
            }
        };

        checkPermissions();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ネイティブ音声認識</Text>

            {!permissionsGranted && (
                <Text style={styles.errorText}>マイクまたは音声認識の権限が必要です。</Text>
            )}

            {error && (
                <Text style={styles.errorText}>エラー: {error}</Text>
            )}

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    状態: {isRecognizing ? '🎤 認識中...' : '待機中'}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title={isRecognizing ? "認識停止" : "認識開始"}
                    onPress={isRecognizing ? stopRecognizing : startRecognizing}
                    disabled={!permissionsGranted}
                    color={isRecognizing ? "#ff4444" : "#007AFF"}
                />
            </View>

            <View style={styles.transcriptionContainer}>
                <Text style={styles.transcriptionLabel}>リアルタイム認識結果:</Text>
                <Text style={styles.transcriptionText}>{transcription || '（ここに結果が表示されます）'}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    statusContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        marginBottom: 30,
    },
    transcriptionContainer: {
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        minHeight: 150,
    },
    transcriptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#666',
    },
    transcriptionText: {
        fontSize: 18,
        lineHeight: 24,
        color: '#000',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    },
});

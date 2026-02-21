# iOS ネイティブ音声認識実装指示書（React Native）

## 1. 目的
`whisper.rn` によるローカル推論から、Appleの `Speech` フレームワークを使用したネイティブ音声認識（SFSpeechRecognizer）へ移行し、リアルタイム性とバッテリー効率を向上させる。

## 2. 技術選定
- **ライブラリ**: `@react-native-voice/voice`
- **権限管理**: `react-native-permissions`
- **ターゲット**: iOS (Native Speech Framework)
- **選定理由**: JS層から単一のAPIでネイティブの音声認識エンジン（iOS/Android）を叩けるデファクトスタンダードであり、バックエンド側から見たデータ構造の標準化が容易になるため。

## 3. 実装詳細ルール
コードを生成・修正する際は、バックエンドエンジニアの視点から以下の3点を必ず含めてください。

### ① 使用ライブラリとその意味・動作
- **@react-native-voice/voice**: Appleの `SFSpeechRecognizer` をJS層から制御するためのブリッジとして動作し、ネイティブの認識結果を非同期イベントとしてJS側に伝達する。
- **react-native-permissions**: iOSの `Info.plist` に定義されたマイクと音声認識の権限をユーザーに要求し、その許諾状態を管理する。

### ② 必要な基礎知識
- **SFSpeechRecognizer**: Appleが提供する音声認識エンジン。オンデバイス学習とサーバーベースのハイブリッドで動作する。連続認識には約1分の制限がある場合があるため留意すること。
- **Privacy Manifest (Info.plist)**: iOSでは音声認識（`NSSpeechRecognitionUsageDescription`）とマイク（`NSMicrophoneUsageDescription`）の利用目的を記述しないと、実行時にアプリがクラッシュする仕様となっている。

### ③ バックエンドエンジニアに必要な詳細・理由
- **リソース解放（メモリリーク対策）**: 音声認識エンジンは消費電力が大きくメモリを占有するため、コンポーネントのアンマウント時（`useEffect` のクリーンアップ関数）で必ず `Voice.destroy()` と `Voice.removeAllListeners()` を実行し、ネイティブリソースを解放すること。
- **排他制御**: 認識中に再度開始（`start`）しようとするとネイティブ側でエラーが発生するため、状態フラグ（`isRecognizing`）を用いて二重起動を厳密に防止するロジックを組むこと。

---

## 4. 具体的なタスク

### Task 1: ネイティブ設定の更新
`app.json` (Expoの場合) または `ios/プロジェクト名/Info.plist` に以下の記述を追加してください。
- `NSSpeechRecognitionUsageDescription`: 「音声をテキストに変換するために音声認識を使用します。」
- `NSMicrophoneUsageDescription`: 「音声認識のためにマイクを使用します。」

### Task 2: `useNativeSpeech.ts` (新規Hook) の作成
既存の `useLocalWhisper.ts` を参考に、以下のインターフェースを持つHookを作成してください。
- `startRecognizing()`: `Voice.start('ja-JP')` を呼び出し、認識を開始する。
- `stopRecognizing()`: `Voice.stop()` を呼び出し、認識を終了する。
- `transcription`: `onSpeechResults` から取得した最新の文字列（配列の先頭要素など）を保持する。
- `isRecognizing`: 現在の動作状態を `boolean` で管理する。
- `error`: エラー発生時の内容を保持する。

### Task 3: UIコンポーネントの修正
`AudioTranscriber.tsx` を修正し、以下の挙動に変更してください。
- Whisperモデルのロード待ち（`isInitializing`）のUIを削除。
- 録音完了後の「解析中」ステートを、ネイティブの「リアルタイム認識結果」を逐次表示するUIへ置き換え。

---

## 5. コミットメッセージ案
- 機能、修正、ドキュメントごとコミットすること
- コミットメッセージは簡潔に日本語で記述すること

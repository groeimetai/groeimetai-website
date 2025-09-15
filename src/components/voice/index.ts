export { VoiceInput } from './VoiceInput';
export { VoiceRecordingButton } from './VoiceRecordingButton';
export { VoiceActivityIndicator } from './VoiceActivityIndicator';

export type {
  VoiceRecognitionOptions,
  VoiceRecognitionResult,
  VoiceRecognitionState,
  VoiceRecognitionActions,
} from '@/hooks/useVoiceRecognition';

export type {
  CloudSTTProvider,
  CloudSTTOptions,
  CloudSTTResult,
  CloudSTTError,
} from '@/services/cloudSpeechToText';
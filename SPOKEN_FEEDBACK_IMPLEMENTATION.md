# Spoken Interviewer Feedback Implementation

## Overview
This implementation adds text-to-speech capability to the interview feedback display using the browser's native Web Speech API. When users complete an interview session, they can now click a "Hear interviewer feedback" button to have the detailed feedback text spoken aloud.

## How It Works

### Integration Point
The feature is integrated into the **FeedbackPanel component** (`src/components/FeedbackPanel.tsx`), which displays the final interview feedback. The `detailedFeedback` text is the content being spoken.

### Data Flow
1. User completes interview session → clicks "End Session"
2. `InterviewPanel` calls `/api/end-session` endpoint
3. Backend generates `SessionFeedback` object (including `detailedFeedback` text)
4. `FeedbackPanel` receives and displays the feedback
5. **New:** User can click the speaker button to hear the feedback spoken aloud

### Key Features
- **100% Client-Side**: Uses the browser's native `SpeechSynthesisUtterance` API
- **Free**: No additional API calls or paid services
- **User Control**: Toggle button to start/stop audio playback
- **Voice Selection**: Automatically selects an English voice if available
- **Slower Speech Rate**: Set to 0.9x speed for better clarity and comprehension
- **Visual Feedback**: Button changes color (red) and icon (stop square) while speaking

## Technical Details

### Implementation in FeedbackPanel.tsx

#### 1. **State Management**
```typescript
const [isSpeaking, setIsSpeaking] = useState(false);
```
Tracks whether audio is currently playing.

#### 2. **Speech Handler**
```typescript
const handleSpeakFeedback = () => {
  if (isSpeaking) {
    // Stop ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  } else {
    // Start speaking
    const utterance = new SpeechSynthesisUtterance(feedback.detailedFeedback);
    utterance.rate = 0.9;        // Slower for clarity
    utterance.lang = 'en-US';    // English language
    
    // Select English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Handle completion
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Start speech
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }
};
```

#### 3. **UI Button**
Located next to the `detailedFeedback` text:
- **Icon**: Speaker icon (Volume2) when not speaking, Stop square (Square) when speaking
- **Color**: Gray background normally, red (#ff6b6b) when speaking
- **Tooltip**: Shows "Hear interviewer feedback" or "Stop listening"
- **Behavior**: Toggle on/off with a single click

## Browser Compatibility

The Web Speech API is supported on:
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ✅ Opera 27+
- ⚠️ Firefox (limited support, uses fallback engines)

For unsupported browsers, the button will still appear but may not produce audio.

## No Backend Changes Required

This implementation is **completely client-side**:
- No changes to API endpoints
- No changes to feedback generation logic
- No new backend dependencies
- No database modifications

The `SessionFeedback` data structure remains unchanged.

## Customization

To adjust the spoken feedback behavior, modify these values in `FeedbackPanel.tsx`:

```typescript
utterance.rate = 0.9;        // Change speech speed (0.1 - 10, default 1)
utterance.lang = 'en-US';    // Change language/locale
utterance.pitch = 1.0;       // Add pitch adjustment if desired
utterance.volume = 1.0;      // Adjust volume (0-1)
```

## Removal

To completely remove this feature, simply:
1. Remove the `Volume2, Square` imports from lucide-react
2. Remove the `isSpeaking` state
3. Remove the `handleSpeakFeedback` function
4. Replace the detailed-feedback div with the original simple `<p>{feedback.detailedFeedback}</p>`

The feature is isolated and has minimal coupling with the rest of the component.

## Testing

To test the feature:
1. Run `npm run dev`
2. Complete an interview session
3. Click the speaker button next to the detailed feedback
4. The feedback text should be spoken aloud
5. Click again (now showing red stop icon) to cancel

## Future Enhancements (Optional)

Potential additions without backend changes:
- Adjust playback speed slider
- Choose between male/female voices
- Add playback controls (pause, resume)
- Speak entire feedback sections (not just detailed feedback)
- Export feedback as audio file (using MediaRecorder API)

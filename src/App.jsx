import * as tts from '@diffusionstudio/vits-web';
import { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [voiceloading, setVoiceLoading] = useState(false);

  const onClick = async () => {
    if (!text) return;

    setVoiceLoading(true);
    const wav = await tts.predict({
      text,
      voiceId: 'ru_RU-dmitri-medium',
    });

    const audio = new Audio();
    audio.src = URL.createObjectURL(wav);
    await audio.play();

    setVoiceLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
      <textarea
        onChange={(e) => setText(e.currentTarget.value)}
        style={{ height: '200px', width: '30vw' }}
      ></textarea>
      <button onClick={onClick} disabled={!text || voiceloading}>
        {voiceloading ? 'Loading...' : 'Generate speech'}
      </button>
    </div>
  );
}

export default App;

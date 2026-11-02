// Multi-layered crisp realistic paper page turn sound effect generator using Web Audio API
export const playPageFlipSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Layer 1: High frequency paper friction sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.2); // 200ms duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      // Exponential decay envelope with subtle paper texture noise
      const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 2.5);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to simulate paper rustle resonance (1500Hz -> 800Hz sweep)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    filter.Q.value = 2.0;

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime); // Crisp audible volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    // Layer 2: Subtle low frequency paper thump (page landing)
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch (e) {}
    }, 60);

  } catch (e) {
    // Ignore audio policy restrictions if muted
  }
};

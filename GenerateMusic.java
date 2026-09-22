import java.io.ByteArrayInputStream;
import java.io.File;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Random;
import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;

public class GenerateMusic {
    static final int SAMPLE_RATE = 44100;
    static final double BPM = 52.0;
    static final double BEAT_SEC = 60.0 / BPM;

    // Pentatonic scale frequencies in Hz (D minor pentatonic / D Yu Mode: D3, F3, G3, A3, C4, D4, F4, G4, A4, C5, D5, F5, G5, A5)
    static final double D2 = 73.42, A2 = 110.0, D3 = 146.83, F3 = 174.61, G3 = 196.0, A3 = 220.0, C4 = 261.63;
    static final double D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, C5 = 523.25;
    static final double D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00, C6 = 1046.50;

    static double[] bufferLeft;
    static double[] bufferRight;
    static int totalSamples;

    public static void main(String[] args) throws Exception {
        // Total duration: 32 bars of 4 beats = 128 beats (~147 seconds)
        int totalBeats = 128;
        double totalSeconds = totalBeats * BEAT_SEC + 4.0;
        totalSamples = (int) (totalSeconds * SAMPLE_RATE);
        bufferLeft = new double[totalSamples];
        bufferRight = new double[totalSamples];

        System.out.println("Composing Ancient Zen Masterpiece (" + (int)totalSeconds + "s)...");

        // 1. Compose Guzheng Plucked Strings (Karplus-Strong physical modeling)
        composeGuzheng();

        // 2. Compose Bamboo Xiao / Flute Melody
        composeFlute();

        // 3. Compose Ambient Singing Bowl & Water Chimes
        composeChimesAndDrone();

        // 4. Master and apply Stereo Reverb (Comb filter + Allpass)
        applyReverb();

        // 5. Normalize and export to 16-bit Stereo WAV
        saveWav("go_game/bgm_ancient.wav");
        System.out.println("Exported successfully to go_game/bgm_ancient.wav");
    }

    static void composeGuzheng() {
        // Guzheng chord progressions and arpeggios
        double[][] bars = {
            // Intro: Gentle ripples
            {D3, A3, D4, F4}, {C4, G4, C5, D5}, {G3, D4, G4, A4}, {A3, E4, A4, C5},
            {D3, F4, A4, D5}, {C4, E4, G4, C5}, {G3, D4, G4, A4}, {D3, A3, D4, A4},

            // Theme A: Poetic unfolding
            {D3, A3, D4, F4}, {F3, C4, F4, A4}, {G3, D4, G4, C5}, {A3, E4, A4, D5},
            {D3, A3, D4, F4}, {C4, G4, C5, E5}, {G3, D4, G4, A4}, {D3, A3, D4, F4},

            // Theme B: Deep contemplation
            {A2, E3, A3, C4}, {G3, D4, G4, B4}, {F3, C4, F4, A4}, {D3, A3, D4, F4},
            {G3, D4, G4, C5}, {A3, E4, A4, D5}, {C4, G4, C5, E5}, {D3, A3, D4, A4},

            // Outro: Quiet lingering mist
            {D3, A3, D4, F4}, {C4, G4, C5, D5}, {G3, D4, G4, A4}, {A3, E4, A4, C5},
            {D3, A3, D4, F4}, {G3, D4, G4, A4}, {A3, E4, A4, C5}, {D2, A2, D3, A3}
        };

        for (int b = 0; b < bars.length; b++) {
            double barStart = b * 4 * BEAT_SEC;
            double[] notes = bars[b];

            // Bass root note on beat 1
            addPluck(barStart, notes[0], 0.75, 4.0, -0.3);

            // Arpeggio figures on beats 1.5, 2.0, 2.5, 3.0, 3.5, 4.0
            for (int step = 0; step < 6; step++) {
                double time = barStart + (1.0 + step * 0.5) * BEAT_SEC;
                double freq = notes[(step % (notes.length - 1)) + 1];
                double pan = (step % 2 == 0) ? -0.25 : 0.25;
                double vel = (step == 0 || step == 3) ? 0.5 : 0.35;
                addPluck(time, freq, vel, 2.8, pan);
            }

            // Occasional delicate glissando ornament
            if (b % 4 == 3) {
                double[] gliss = {A4, C5, D5, F5, A5};
                for (int g = 0; g < gliss.length; g++) {
                    double gTime = barStart + (2.8 + g * 0.12) * BEAT_SEC;
                    addPluck(gTime, gliss[g], 0.3, 1.8, 0.4 + g * 0.08);
                }
            }
        }
    }

    static void composeFlute() {
        // Expressive Bamboo Flute (Xiao) melody floating over the bars
        // [startBeat, durationBeats, freq, volume]
        double[][] fluteMelody = {
            // Bar 5 - 12 (Flute enters)
            {16, 3.0, A4, 0.35}, {19, 1.0, G4, 0.30}, {20, 4.0, D5, 0.40},
            {24, 2.5, C5, 0.35}, {26.5, 1.5, D5, 0.32}, {28, 4.0, A4, 0.38},
            {32, 3.0, F4, 0.32}, {35, 1.0, G4, 0.30}, {36, 4.0, A4, 0.35},
            {40, 2.0, G4, 0.32}, {42, 2.0, F4, 0.30}, {44, 4.0, D4, 0.38},

            // Bar 13 - 20 (Higher expressive octave)
            {48, 3.0, D5, 0.40}, {51, 1.0, F5, 0.38}, {52, 4.0, A5, 0.42},
            {56, 2.5, G5, 0.38}, {58.5, 1.5, F5, 0.35}, {60, 4.0, D5, 0.40},
            {64, 3.0, C5, 0.36}, {67, 1.0, D5, 0.34}, {68, 4.0, F5, 0.38},
            {72, 2.0, E5, 0.32}, {74, 2.0, C5, 0.30}, {76, 4.0, D5, 0.38},

            // Bar 21 - 28 (Theme B resolution)
            {80, 3.0, A4, 0.35}, {83, 1.0, C5, 0.32}, {84, 4.0, D5, 0.38},
            {88, 2.5, F4, 0.32}, {90.5, 1.5, G4, 0.30}, {92, 4.0, A4, 0.35},
            {96, 3.0, G4, 0.32}, {99, 1.0, F4, 0.28}, {100, 4.0, D4, 0.38},
            {104, 3.0, C4, 0.30}, {107, 1.0, D4, 0.32}, {108, 6.0, D4, 0.35}
        };

        for (double[] note : fluteMelody) {
            double startSec = note[0] * BEAT_SEC;
            double durSec = note[1] * BEAT_SEC;
            double freq = note[2];
            double vol = note[3];
            addFluteNote(startSec, freq, durSec, vol, 0.05);
        }
    }

    static void composeChimesAndDrone() {
        // Singing Bowl / Bell chime on every 8 bars
        for (int b = 0; b < 32; b += 8) {
            double time = b * 4 * BEAT_SEC;
            addBowlChime(time, D3, 0.45);
        }

        // Warm subtle warm mountain drone in D
        int samples = totalSamples;
        for (int i = 0; i < samples; i++) {
            double t = (double) i / SAMPLE_RATE;
            double drone = Math.sin(2 * Math.PI * 73.42 * t) * 0.04
                         + Math.sin(2 * Math.PI * 110.0 * t) * 0.025
                         + Math.sin(2 * Math.PI * 146.83 * t) * 0.015;
            // Gentle swelling envelope
            double env = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * t);
            bufferLeft[i] += drone * env * 0.8;
            bufferRight[i] += drone * env * 0.8;
        }
    }

    // Karplus-Strong string physical synthesis
    static void addPluck(double startSec, double freq, double volume, double decaySec, double pan) {
        int startSample = (int) (startSec * SAMPLE_RATE);
        int period = (int) (SAMPLE_RATE / freq);
        if (period <= 2) return;

        double[] ring = new double[period];
        Random rnd = new Random((long)(freq * 1000 + startSec * 100));
        for (int i = 0; i < period; i++) {
            ring[i] = (rnd.nextDouble() * 2.0 - 1.0);
        }

        int noteSamples = (int) (decaySec * SAMPLE_RATE);
        double decayFactor = 0.992 - (freq / 4000.0) * 0.015;
        double panL = Math.cos((pan + 1.0) * Math.PI / 4.0);
        double panR = Math.sin((pan + 1.0) * Math.PI / 4.0);

        int ringIdx = 0;
        double prev = 0;
        for (int i = 0; i < noteSamples; i++) {
            int outIdx = startSample + i;
            if (outIdx >= totalSamples) break;

            double current = ring[ringIdx];
            double sample = 0.5 * (current + prev) * decayFactor;
            ring[ringIdx] = sample;
            prev = sample;
            ringIdx = (ringIdx + 1) % period;

            // Attack smoothing
            double attack = (i < 80) ? (i / 80.0) : 1.0;
            double out = sample * volume * attack * 0.8;

            bufferLeft[outIdx] += out * panL;
            bufferRight[outIdx] += out * panR;
        }
    }

    // Bamboo Flute synthesis with breath noise, vibrato and warm harmonics
    static void addFluteNote(double startSec, double freq, double durationSec, double volume, double pan) {
        int startSample = (int) (startSec * SAMPLE_RATE);
        int noteSamples = (int) ((durationSec + 0.3) * SAMPLE_RATE);
        double panL = Math.cos((pan + 1.0) * Math.PI / 4.0);
        double panR = Math.sin((pan + 1.0) * Math.PI / 4.0);

        Random rnd = new Random((long)(freq * 777 + startSec * 333));

        for (int i = 0; i < noteSamples; i++) {
            int outIdx = startSample + i;
            if (outIdx >= totalSamples) break;

            double t = (double) i / SAMPLE_RATE;
            // Vibrato (5 Hz, starts after 0.2s)
            double vibAmp = (t > 0.2) ? Math.min(1.0, (t - 0.2) * 2.0) * 0.018 * freq : 0;
            double instantFreq = freq + Math.sin(2 * Math.PI * 5.2 * t) * vibAmp;

            // Harmonics (Odd harmonics dominant like closed flute tube)
            double wave = Math.sin(2 * Math.PI * instantFreq * t) * 0.70
                        + Math.sin(2 * Math.PI * instantFreq * 2 * t) * 0.15
                        + Math.sin(2 * Math.PI * instantFreq * 3 * t) * 0.25
                        + Math.sin(2 * Math.PI * instantFreq * 4 * t) * 0.05
                        + Math.sin(2 * Math.PI * instantFreq * 5 * t) * 0.08;

            // Breath turbulence
            double breath = (rnd.nextDouble() * 2.0 - 1.0) * 0.035;

            // Envelope (Soft attack 0.15s, sustain, gentle release 0.25s)
            double env;
            if (t < 0.15) {
                env = Math.sin((t / 0.15) * Math.PI / 2.0);
            } else if (t < durationSec) {
                env = 1.0;
            } else {
                double relT = (t - durationSec) / 0.3;
                env = Math.max(0, 1.0 - relT);
            }

            double out = (wave + breath) * volume * env;
            bufferLeft[outIdx] += out * panL;
            bufferRight[outIdx] += out * panR;
        }
    }

    // Tibetan Singing Bowl / Temple Chime
    static void addBowlChime(double startSec, double fundamental, double volume) {
        int startSample = (int) (startSec * SAMPLE_RATE);
        int chimeSamples = (int) (8.0 * SAMPLE_RATE);

        double[] partials = {fundamental, fundamental * 2.76, fundamental * 5.4, fundamental * 8.9};
        double[] amps = {0.6, 0.3, 0.12, 0.06};
        double[] decays = {7.5, 5.0, 3.2, 1.8};

        for (int p = 0; p < partials.length; p++) {
            double f = partials[p];
            double a = amps[p] * volume;
            double d = decays[p];
            for (int i = 0; i < chimeSamples; i++) {
                int outIdx = startSample + i;
                if (outIdx >= totalSamples) break;
                double t = (double) i / SAMPLE_RATE;
                double env = Math.exp(-t * (4.0 / d));
                double wave = Math.sin(2 * Math.PI * f * t) * a * env;
                bufferLeft[outIdx] += wave * 0.55;
                bufferRight[outIdx] += wave * 0.55;
            }
        }
    }

    // Freeverb-style stereo comb/allpass reverb for ancient hall resonance
    static void applyReverb() {
        int[] delaysL = {1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116};
        int[] delaysR = {1557 + 23, 1617 - 19, 1491 + 31, 1422 - 17, 1277 + 29, 1356 - 21, 1188 + 15, 1116 - 27};
        double feedback = 0.82;

        double[] wetL = new double[totalSamples];
        double[] wetR = new double[totalSamples];

        for (int d = 0; d < delaysL.length; d++) {
            int dl = delaysL[d];
            int dr = delaysR[d];
            double[] combL = new double[dl];
            double[] combR = new double[dr];
            int idxL = 0, idxR = 0;

            for (int i = 0; i < totalSamples; i++) {
                double outL = combL[idxL];
                combL[idxL] = bufferLeft[i] + outL * feedback;
                wetL[i] += outL * 0.12;
                idxL = (idxL + 1) % dl;

                double outR = combR[idxR];
                combR[idxR] = bufferRight[i] + outR * feedback;
                wetR[i] += outR * 0.12;
                idxR = (idxR + 1) % dr;
            }
        }

        // Mix dry + wet (65% dry, 35% wet)
        for (int i = 0; i < totalSamples; i++) {
            bufferLeft[i] = bufferLeft[i] * 0.65 + wetL[i] * 0.35;
            bufferRight[i] = bufferRight[i] * 0.65 + wetR[i] * 0.35;
        }
    }

    static void saveWav(String outputPath) throws Exception {
        // Find peak for clean normalization
        double peak = 0;
        for (int i = 0; i < totalSamples; i++) {
            peak = Math.max(peak, Math.abs(bufferLeft[i]));
            peak = Math.max(peak, Math.abs(bufferRight[i]));
        }

        double normGain = (peak > 0) ? (0.88 / peak) : 1.0;

        byte[] pcmData = new byte[totalSamples * 4];
        ByteBuffer bb = ByteBuffer.wrap(pcmData).order(ByteOrder.LITTLE_ENDIAN);

        for (int i = 0; i < totalSamples; i++) {
            short sL = (short) Math.max(-32767, Math.min(32767, bufferLeft[i] * normGain * 32767));
            short sR = (short) Math.max(-32767, Math.min(32767, bufferRight[i] * normGain * 32767));
            bb.putShort(sL);
            bb.putShort(sR);
        }

        AudioFormat format = new AudioFormat(SAMPLE_RATE, 16, 2, true, false);
        ByteArrayInputStream bais = new ByteArrayInputStream(pcmData);
        AudioInputStream ais = new AudioInputStream(bais, format, totalSamples);

        File outFile = new File(outputPath);
        AudioSystem.write(ais, AudioFileFormat.Type.WAVE, outFile);
    }
}

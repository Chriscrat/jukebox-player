import { computed } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import type { StyleId, StylePreset } from '../types/audio'

const T = true
const F = false

/**
 * Canonical list of all available style presets.
 * Exported as a named constant so both `useStyles()` and `useAudioEngine()` share
 * the same source of truth — `useAudioEngine` uses it for per-tick note resolution.
 */
export const STYLE_PRESETS: readonly StylePreset[] = [
    {
        id: 'lo-fi',
        label: 'LO-FI',
        bpm: 75,
        effects: { reverbWet: 0.6, delayWet: 0.3 },
        notes: { kick: 'C1', snare: 'E3', bass: 'A1', lead: 'G4' },
        synthConfig: {
            kick:  { pitchDecay: 0.10, octaves: 4,  envelope: { attack: 0.001, decay: 0.4,  sustain: 0,   release: 0.20 } },
            snare: { harmonicity: 3,  modulationIndex: 10, resonance: 2000, octaves: 0.8, envelope: { attack: 0.001, decay: 0.30, release: 0.15 } },
            bass:  { synthType: 'synth', envelope: { attack: 0.05,  decay: 0.5,  sustain: 0.3, release: 0.80 } },
            lead:  { synthType: 'synth', envelope: { attack: 0.08,  decay: 0.4,  sustain: 0.2, release: 1.00 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,F, T,F,F,F, T,F,F,F, T,F,F,F], params: { volume: 0.7, decay: 0.4, oscillatorType: 'sine' } },
            snare: { steps: [F,F,F,F, T,F,F,F, F,F,F,F, T,F,F,F], params: { volume: 0.5, decay: 0.3, oscillatorType: 'triangle' } },
            bass:  { steps: [T,F,F,F, F,F,T,F, F,F,F,F, F,F,T,F], params: { volume: 0.6, decay: 0.5, oscillatorType: 'sine' } },
            lead:  { steps: [F,F,T,F, F,F,F,F, F,F,T,F, F,F,F,F], params: { volume: 0.4, decay: 0.4, oscillatorType: 'triangle' } },
        },
    },
    {
        id: 'metal',
        label: 'METAL',
        bpm: 165,
        effects: { reverbWet: 0.1, delayWet: 0.05 },
        notes: { kick: 'B0', snare: 'C3', bass: 'E1', lead: 'D3' },
        synthConfig: {
            kick:  { pitchDecay: 0.03, octaves: 10, envelope: { attack: 0.001, decay: 0.15, sustain: 0,   release: 0.05 } },
            snare: { harmonicity: 12, modulationIndex: 50, resonance: 8000, octaves: 2.0, envelope: { attack: 0.001, decay: 0.10, release: 0.05 } },
            bass:  { synthType: 'fm',    envelope: { attack: 0.001, decay: 0.10, sustain: 0.6, release: 0.10 } },
            lead:  { synthType: 'fm',    envelope: { attack: 0.001, decay: 0.08, sustain: 0.4, release: 0.05 } },
        },
        tracks: {
            kick:  { steps: [T,F,T,F, T,F,T,F, T,F,T,F, T,F,T,F], params: { volume: 0.9, decay: 0.15, oscillatorType: 'sawtooth' } },
            snare: { steps: [F,F,F,F, T,F,F,F, F,F,F,F, T,F,F,F], params: { volume: 0.8, decay: 0.2, oscillatorType: 'square' } },
            bass:  { steps: [T,T,F,T, T,F,T,T, F,T,T,F, T,T,F,T], params: { volume: 0.8, decay: 0.15, oscillatorType: 'sawtooth' } },
            lead:  { steps: [T,T,F,T, T,F,T,F, T,T,F,T, T,F,T,F], params: { volume: 0.7, decay: 0.1, oscillatorType: 'square' } },
        },
    },
    {
        id: 'punk',
        label: 'PUNK',
        bpm: 150,
        effects: { reverbWet: 0.05, delayWet: 0.05 },
        notes: { kick: 'C1', snare: 'A3', bass: 'G1', lead: 'A3' },
        synthConfig: {
            kick:  { pitchDecay: 0.05, octaves: 6,  envelope: { attack: 0.001, decay: 0.20, sustain: 0,   release: 0.08 } },
            snare: { harmonicity: 6,  modulationIndex: 30, resonance: 5000, octaves: 1.5, envelope: { attack: 0.001, decay: 0.15, release: 0.06 } },
            bass:  { synthType: 'synth', envelope: { attack: 0.001, decay: 0.2,  sustain: 0.5, release: 0.10 } },
            lead:  { synthType: 'synth', envelope: { attack: 0.001, decay: 0.1,  sustain: 0.4, release: 0.05 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,F, T,F,F,F, T,F,F,F, T,F,F,F], params: { volume: 0.9, decay: 0.2, oscillatorType: 'square' } },
            snare: { steps: [F,F,F,F, T,F,F,F, F,F,F,F, T,F,F,F], params: { volume: 0.8, decay: 0.15, oscillatorType: 'sawtooth' } },
            bass:  { steps: [T,F,T,F, T,F,T,F, T,F,T,F, T,F,T,F], params: { volume: 0.8, decay: 0.2, oscillatorType: 'square' } },
            lead:  { steps: [T,T,T,T, T,T,T,T, T,T,T,T, T,T,T,T], params: { volume: 0.6, decay: 0.1, oscillatorType: 'sawtooth' } },
        },
    },
    {
        id: 'cyberpunk',
        label: 'CYBERPUNK',
        bpm: 130,
        effects: { reverbWet: 0.4, delayWet: 0.5 },
        notes: { kick: 'C1', snare: 'F3', bass: 'F1', lead: 'F4' },
        synthConfig: {
            kick:  { pitchDecay: 0.05, octaves: 8,  envelope: { attack: 0.001, decay: 0.25, sustain: 0,   release: 0.10 } },
            snare: { harmonicity: 8,  modulationIndex: 40, resonance: 6000, octaves: 1.8, envelope: { attack: 0.001, decay: 0.20, release: 0.08 } },
            bass:  { synthType: 'fm',    envelope: { attack: 0.010, decay: 0.3,  sustain: 0.4, release: 0.20 } },
            lead:  { synthType: 'fm',    envelope: { attack: 0.001, decay: 0.2,  sustain: 0.3, release: 0.15 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,T, F,F,T,F, F,F,T,F, F,T,F,F], params: { volume: 0.85, decay: 0.25, oscillatorType: 'square' } },
            snare: { steps: [F,F,T,F, F,F,T,F, F,T,F,F, F,F,T,F], params: { volume: 0.7, decay: 0.2, oscillatorType: 'sawtooth' } },
            bass:  { steps: [T,F,F,F, T,F,F,T, F,F,T,F, F,F,F,T], params: { volume: 0.8, decay: 0.3, oscillatorType: 'sawtooth' } },
            lead:  { steps: [F,T,F,T, F,F,T,F, T,F,F,T, F,T,F,F], params: { volume: 0.65, decay: 0.2, oscillatorType: 'square' } },
        },
    },
    {
        id: 'dubstep',
        label: 'DUBSTEP',
        bpm: 70,
        effects: { reverbWet: 0.5, delayWet: 0.6 },
        notes: { kick: 'C1', snare: 'D3', bass: 'C1', lead: 'Bb3' },
        synthConfig: {
            kick:  { pitchDecay: 0.08, octaves: 8,  envelope: { attack: 0.001, decay: 0.50, sustain: 0,   release: 0.20 } },
            snare: { harmonicity: 5,  modulationIndex: 25, resonance: 4500, octaves: 1.5, envelope: { attack: 0.001, decay: 0.25, release: 0.10 } },
            bass:  { synthType: 'am',    envelope: { attack: 0.010, decay: 0.6,  sustain: 0.6, release: 0.40 } },
            lead:  { synthType: 'am',    envelope: { attack: 0.050, decay: 0.3,  sustain: 0.2, release: 0.30 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,F, F,F,T,F, T,F,F,F, F,F,F,F], params: { volume: 0.9, decay: 0.3, oscillatorType: 'sine' } },
            snare: { steps: [F,F,F,F, F,F,F,F, T,F,F,F, F,F,F,F], params: { volume: 0.85, decay: 0.25, oscillatorType: 'sawtooth' } },
            bass:  { steps: [T,F,T,F, F,F,T,F, T,F,T,F, F,F,T,F], params: { volume: 0.9, decay: 0.5, oscillatorType: 'sawtooth' } },
            lead:  { steps: [F,F,F,T, F,F,F,T, F,F,F,F, T,F,F,F], params: { volume: 0.6, decay: 0.3, oscillatorType: 'square' } },
        },
    },
    {
        id: 'jazz',
        label: 'JAZZ',
        bpm: 95,
        effects: { reverbWet: 0.7, delayWet: 0.2 },
        notes: { kick: 'C1', snare: 'A2', bass: 'F2', lead: 'Eb4' },
        synthConfig: {
            kick:  { pitchDecay: 0.07, octaves: 5,  envelope: { attack: 0.001, decay: 0.35, sustain: 0,   release: 0.15 } },
            snare: { harmonicity: 4,  modulationIndex: 15, resonance: 3000, octaves: 1.2, envelope: { attack: 0.001, decay: 0.25, release: 0.12 } },
            bass:  { synthType: 'synth', envelope: { attack: 0.08,  decay: 0.45, sustain: 0.4, release: 1.20 } },
            lead:  { synthType: 'poly',  envelope: { attack: 0.10,  decay: 0.40, sustain: 0.3, release: 1.50 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,F, F,F,T,F, F,F,F,F, T,F,F,F], params: { volume: 0.65, decay: 0.35, oscillatorType: 'sine' } },
            snare: { steps: [F,F,F,F, T,F,F,F, F,F,F,F, T,F,F,F], params: { volume: 0.55, decay: 0.25, oscillatorType: 'triangle' } },
            bass:  { steps: [T,F,F,T, F,F,T,F, F,T,F,F, T,F,F,F], params: { volume: 0.7, decay: 0.45, oscillatorType: 'sine' } },
            lead:  { steps: [F,F,T,F, F,T,F,F, F,T,F,F, F,F,T,F], params: { volume: 0.5, decay: 0.4, oscillatorType: 'triangle' } },
        },
    },
    {
        id: 'psytrance',
        label: 'PSYTRANCE',
        bpm: 145,
        effects: { reverbWet: 0.5, delayWet: 0.4 },
        notes: { kick: 'C1', snare: 'G3', bass: 'A1', lead: 'B4' },
        synthConfig: {
            kick:  { pitchDecay: 0.05, octaves: 7,  envelope: { attack: 0.001, decay: 0.20, sustain: 0,   release: 0.10 } },
            snare: { harmonicity: 7,  modulationIndex: 35, resonance: 6500, octaves: 1.8, envelope: { attack: 0.001, decay: 0.20, release: 0.08 } },
            bass:  { synthType: 'fm',    envelope: { attack: 0.001, decay: 0.2,  sustain: 0.5, release: 0.10 } },
            lead:  { synthType: 'fm',    envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.08 } },
        },
        tracks: {
            kick:  { steps: [T,F,F,F, T,F,F,F, T,F,F,F, T,F,F,F], params: { volume: 0.9, decay: 0.2, oscillatorType: 'sine' } },
            snare: { steps: [F,F,T,F, F,F,T,F, F,F,T,F, F,F,T,F], params: { volume: 0.7, decay: 0.2, oscillatorType: 'sawtooth' } },
            bass:  { steps: [T,F,T,F, T,F,T,F, T,F,T,F, T,F,T,F], params: { volume: 0.8, decay: 0.2, oscillatorType: 'sawtooth' } },
            lead:  { steps: [T,F,F,T, F,F,T,F, F,F,T,F, F,T,F,F], params: { volume: 0.65, decay: 0.15, oscillatorType: 'square' } },
        },
    },
]

/**
 * Provides the list of musical style presets and controls to apply or reset them.
 * Stops Tone.js transport automatically before any style change.
 * `STYLE_PRESETS` is also available as a named export for consumers that only need the data.
 *
 * @returns {readonly StylePreset[]} styles - All 7 available style presets (read-only).
 * @returns {ComputedRef<StyleId | null>} activeStyleId - The currently active style, or null when none is selected.
 * @returns {Function} applyStyle - Loads a preset by id. No-op if the style is already active.
 * @returns {Function} resetStyle - Clears the active style and restores sequencer defaults.
 *
 * @example
 * const { styles, activeStyleId, applyStyle, resetStyle } = useStyles()
 * applyStyle('lo-fi')
 */
export function useStyles() {
    const store = useSequencerStore()

    const activeStyleId = computed(() => store.state.activeStyleId)

    function stopIfPlaying(): void {
        if (!store.state.isPlaying) return
        try {
            Tone.getTransport().stop()
            store.setCurrentStep(-1)
            store.setPlaying(false)
        } catch (err) {
            console.error('Stop failed during style change:', err)
        }
    }

    function applyStyle(id: StyleId): void {
        if (store.state.activeStyleId === id) return
        stopIfPlaying()
        const preset = STYLE_PRESETS.find((p) => p.id === id)
        if (!preset) return
        store.applyPreset(preset)
    }

    function resetStyle(): void {
        stopIfPlaying()
        store.resetStyle()
    }

    return { styles: STYLE_PRESETS, activeStyleId, applyStyle, resetStyle }
}

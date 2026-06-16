import { computed } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import type { StyleId, StylePreset } from '../types/audio'

const T = true
const F = false

const STYLE_PRESETS: readonly StylePreset[] = [
    {
        id: 'lo-fi',
        label: 'LO-FI',
        bpm: 75,
        effects: { reverbWet: 0.6, delayWet: 0.3 },
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

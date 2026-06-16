import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { SequencerState, StyleId, StylePreset, Track, TrackId } from '../types/audio'

const STEP_COUNT = 16

function createTrack(id: TrackId, label: string): Track {
    return {
        id,
        label,
        steps: Array.from({ length: STEP_COUNT }, () => ({ active: false })),
        params: {
            volume: 0.8,
            decay: 0.3,
            oscillatorType: 'sine',
        },
    }
}

export const useSequencerStore = defineStore('sequencer', () => {
    const state = reactive<SequencerState>({
        tracks: [
            createTrack('kick', 'KICK'),
            createTrack('snare', 'SNARE'),
            createTrack('bass', 'BASS'),
            createTrack('lead', 'LEAD'),
        ],
        bpm: 120,
        isPlaying: false,
        isAudioReady: false,
        currentStep: -1,
        effects: {
            reverbWet: 0.2,
            delayWet: 0.1,
        },
        activeStyleId: null as StyleId | null,
    })

    function toggleStep(trackId: TrackId, stepIndex: number): void {
        const track = state.tracks.find((t) => t.id === trackId)
        if (!track) return
        track.steps[stepIndex].active = !track.steps[stepIndex].active
    }

    function setBpm(value: number): void {
        state.bpm = Math.min(180, Math.max(60, value))
    }

    function setPlaying(value: boolean): void {
        state.isPlaying = value
    }

    function setAudioReady(value: boolean): void {
        state.isAudioReady = value
    }

    function setCurrentStep(index: number): void {
        state.currentStep = index
    }

    function setTrackVolume(trackId: TrackId, value: number): void {
        const track = state.tracks.find((t) => t.id === trackId)
        if (!track) return
        track.params.volume = value
    }

    function setTrackDecay(trackId: TrackId, value: number): void {
        const track = state.tracks.find((t) => t.id === trackId)
        if (!track) return
        track.params.decay = value
    }

    function setTrackOscillator(trackId: TrackId, value: string): void {
        const track = state.tracks.find((t) => t.id === trackId)
        if (!track) return
        const valid = ['sine', 'square', 'sawtooth', 'triangle'] as const
        if (valid.includes(value as (typeof valid)[number])) {
            track.params.oscillatorType = value as (typeof valid)[number]
        }
    }

    function setReverbWet(value: number): void {
        state.effects.reverbWet = value
    }

    function setDelayWet(value: number): void {
        state.effects.delayWet = value
    }

    /** Replaces a track's step pattern from a flat boolean array. */
    function setTrackSteps(trackId: TrackId, steps: boolean[]): void {
        const track = state.tracks.find((t) => t.id === trackId)
        if (!track) return
        track.steps = steps.map((active) => ({ active }))
    }

    /** Applies a full StylePreset: bpm, effects, all track steps and params, then marks the active style. */
    function applyPreset(preset: StylePreset): void {
        setBpm(preset.bpm)
        setReverbWet(preset.effects.reverbWet)
        setDelayWet(preset.effects.delayWet)
        const trackIds: TrackId[] = ['kick', 'snare', 'bass', 'lead']
        for (const id of trackIds) {
            const tp = preset.tracks[id]
            setTrackSteps(id, tp.steps)
            setTrackVolume(id, tp.params.volume)
            setTrackDecay(id, tp.params.decay)
            setTrackOscillator(id, tp.params.oscillatorType)
        }
        setCurrentStep(-1)
        state.activeStyleId = preset.id
    }

    /** Restores all tracks, bpm, and effects to their factory defaults and clears activeStyleId. */
    function resetStyle(): void {
        setBpm(120)
        setReverbWet(0.2)
        setDelayWet(0.1)
        const trackIds: TrackId[] = ['kick', 'snare', 'bass', 'lead']
        for (const id of trackIds) {
            setTrackSteps(id, Array<boolean>(16).fill(false))
            setTrackVolume(id, 0.8)
            setTrackDecay(id, 0.3)
            setTrackOscillator(id, 'sine')
        }
        setCurrentStep(-1)
        state.activeStyleId = null
    }

    return {
        state,
        toggleStep,
        setBpm,
        setPlaying,
        setAudioReady,
        setCurrentStep,
        setTrackVolume,
        setTrackDecay,
        setTrackOscillator,
        setReverbWet,
        setDelayWet,
        setTrackSteps,
        applyPreset,
        resetStyle,
    }
})

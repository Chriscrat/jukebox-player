export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle'

export type TrackId = 'kick' | 'snare' | 'bass' | 'lead'

export type StyleId = 'lo-fi' | 'metal' | 'punk' | 'cyberpunk' | 'dubstep' | 'jazz' | 'psytrance'

export interface Step {
    active: boolean
}

export interface TrackParams {
    volume: number
    decay: number
    oscillatorType: OscillatorType
}

export interface Track {
    id: TrackId
    label: string
    steps: Step[]
    params: TrackParams
}

export interface EffectsState {
    reverbWet: number
    delayWet: number
}

/** Step pattern and synth parameters for one track within a style preset. */
export interface TrackPreset {
    /** 16-step boolean pattern — true means the step is active. */
    steps: boolean[]
    params: TrackParams
}

/** Full definition of a musical style preset applied to the sequencer. */
export interface StylePreset {
    id: StyleId
    label: string
    bpm: number
    /** Per-track patterns and synth params keyed by TrackId. */
    tracks: Record<TrackId, TrackPreset>
    effects: EffectsState
}

export interface SequencerState {
    tracks: Track[]
    bpm: number
    isPlaying: boolean
    isAudioReady: boolean
    currentStep: number
    effects: EffectsState
    activeStyleId: StyleId | null
}

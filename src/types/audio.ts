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

/** Tone.js MembraneSynth parameters for kick drum character per style. */
export interface KickSynthConfig {
    pitchDecay: number
    octaves: number
    envelope: { attack: number; decay: number; sustain: number; release: number }
}

/** Tone.js MetalSynth parameters for snare drum character per style. */
export interface SnareSynthConfig {
    harmonicity: number
    modulationIndex: number
    resonance: number
    octaves: number
    envelope: { attack: number; decay: number; release: number }
}

/** Selects which Tone.js synth class drives the bass and lead tracks. */
export type MelodicSynthType = 'synth' | 'fm' | 'am' | 'poly'

/** Synth class and ADSR envelope for one melodic track (bass or lead) within a style. */
export interface MelodicSynthConfig {
    synthType: MelodicSynthType
    envelope: { attack: number; decay: number; sustain: number; release: number }
}

/** Aggregates all four track synth configs that define the sonic identity of a style preset. */
export interface StyleSynthConfig {
    kick: KickSynthConfig
    snare: SnareSynthConfig
    bass: MelodicSynthConfig
    lead: MelodicSynthConfig
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
    /** Tone.js note string for each track when this style is active. */
    notes: Record<TrackId, string>
    /** Synth type and envelope configuration for each track. */
    synthConfig: StyleSynthConfig
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

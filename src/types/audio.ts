import type { InstrumentId } from './instruments-registry';

export type { InstrumentId };

type Db = number;
type Duration = '8n' | '4n' | '2n' | '1n';

export interface Step<TNote extends string = string> {
    step: number;
    active?: boolean;
    /** Overrides Instrument.defaultNote when present. */
    note?: TNote;
}

export interface EffectsState {
    reverbWet: number;
    delayWet: number;
}

/**
 * Describes a sampler instrument as defined in a preset ambiance.
 * TNote constrains which sample notes are valid — differs freely between ambiances.
 */
export interface Instrument<
    TId extends InstrumentId = InstrumentId,
    TNote extends string = string
> {
    id: TId;
    name: string;
    /** Tone.Sampler map — note string to .wav path, e.g. { 'E2': '/samples/...' }. */
    samples: Record<TNote, string>;
    /** Note played when a step carries no note override. Must be one of the sample notes. */
    defaultNote: TNote;
    /** If true, a new trigger restarts the sample instead of layering. */
    retrigger: boolean;
    /** Hard playback cap in Tone.js notation, e.g. '4n'. */
    maxDuration: Duration;
    /** Volume in dB. 0 = unity gain. */
    volume: Db;
}

/** Live sequencer state for one instrument — mutable by the user during a session. */
export interface InstrumentSequence {
    instrumentId: string;
    steps: Step[];
    /** Volume override in dB. Initialized from Instrument.volume on preset load. */
    volume: number;
    /** User-adjustable playback duration, 0–1 fraction of maxDuration. */
    decay: number;
}

/**
 * A sequencer track — binds an instrument to its step events.
 * TNote is intentionally local to this track: two tracks with the same TId
 * can use completely different note sets across ambiances.
 */
export type Track<
    TId extends InstrumentId = InstrumentId,
    TNote extends string = string
> = {
    instrument: Instrument<TId, TNote>;
    muted?: boolean;
    solo?: boolean;
    events: Step<TNote>[];
};

/** A track with any valid instrument ID and unconstrained notes — used at runtime boundaries. */
export type AnyTrack = Track;

export interface Ambiance {
    id: string;
    name: string;
    steps: number;
    tracks: AnyTrack[];
}

/** Full style preset definition. Steps are NOT stored here — they live in InstrumentSequence. */
export interface StylePreset {
    id: string;
    name: string;
    bpm: number;
    effects: EffectsState;
    ambiances: Ambiance[];
}

export interface SequencerState {
    sequences: InstrumentSequence[];
    bpm: number;
    isPlaying: boolean;
    isAudioReady: boolean;
    currentStep: number;
    effects: EffectsState;
    activePresetId: string | null;
    activeAmbianceId: string | null;
}

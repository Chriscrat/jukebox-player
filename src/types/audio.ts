import type { InstrumentRegistry } from './instruments-registry';

type Db = number;
type Duration = '8n' | '4n' | '2n' | '1n';
export type InstrumentId = keyof InstrumentRegistry;
export type NotesOf<T extends InstrumentId> = InstrumentRegistry[T]['notes'];
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

/** Describes a sampler instrument as defined in a style preset. Immutable — no steps here. */
export interface Instrument<
    TId extends InstrumentId,
    TNote extends string = string
> {
    id: TId;
    name: string;
    /** Tone.Sampler map — note string to .wav path, e.g. { 'E2': '/samples/...' }. */
    samples: Record<TNote, string>;
    /** Note played when a step carries no note override. */
    defaultNote: string;
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

export type Track<T extends InstrumentId> = {
    instrument: Instrument<T, NotesOf<T>>;
    muted?: boolean;
    solo?: boolean;
    events: Step<NotesOf<T>>[];
};

export type AnyTrack = {
    [K in InstrumentId]: Track<K>;
}[InstrumentId];

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

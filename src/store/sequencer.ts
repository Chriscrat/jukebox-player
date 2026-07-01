import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type {
    Ambiance,
    InstrumentSequence,
    SequencerState,
    StylePreset,
    AnyTrack
} from '../types/audio';

const STEP_COUNT = 16;

function createSequence(track: AnyTrack): InstrumentSequence {
    const steps = Array.from({ length: STEP_COUNT }, (_, index) => {
        const event = track.events.find((event) => event.step === index);
        return {
            step: index,
            active: !!event,
            note: event?.note ?? track.instrument.defaultNote,
        }
    });
    return {
        instrumentId: track.instrument.id,
        steps: steps,
        volume: track.instrument.volume,
        decay: 0.5,
    };
}

export const useSequencerStore = defineStore('sequencer', () => {
    const state = reactive<SequencerState>({
        sequences: [],
        bpm: 120,
        isPlaying: false,
        isAudioReady: false,
        currentStep: -1,
        effects: {
            reverbWet: 0.2,
            delayWet: 0.1,
        },
        activePresetId: null,
        activeAmbianceId: null,
    });

    function toggleStep(instrumentId: string, stepIndex: number): void {
        const seq = state.sequences.find((s) => s.instrumentId === instrumentId);
        if (!seq) return;
        seq.steps[stepIndex].active = !seq.steps[stepIndex].active;
    }

    function setStepNote(instrumentId: string, stepIndex: number, note: string | undefined): void {
        const seq = state.sequences.find((s) => s.instrumentId === instrumentId);
        if (!seq) return;
        seq.steps[stepIndex].note = note;
    }

    function setBpm(value: number): void {
        state.bpm = Math.min(180, Math.max(60, value));
    }

    function setPlaying(value: boolean): void {
        state.isPlaying = value;
    }

    function setAudioReady(value: boolean): void {
        state.isAudioReady = value;
    }

    function setCurrentStep(index: number): void {
        state.currentStep = index;
    }

    function setInstrumentVolume(instrumentId: string, value: number): void {
        const seq = state.sequences.find((s) => s.instrumentId === instrumentId);
        if (!seq) return;
        seq.volume = value;
    }

    function setInstrumentDecay(instrumentId: string, value: number): void {
        const seq = state.sequences.find((s) => s.instrumentId === instrumentId);
        if (!seq) return;
        seq.decay = value;
    }

    function setReverbWet(value: number): void {
        state.effects.reverbWet = value;
    }

    function setDelayWet(value: number): void {
        state.effects.delayWet = value;
    }

    function applyPreset(preset: StylePreset, ambiance: Ambiance): void {
        setBpm(preset.bpm);
        setReverbWet(preset.effects.reverbWet);
        setDelayWet(preset.effects.delayWet);
        state.sequences = ambiance?.tracks.map(createSequence);
        setCurrentStep(-1);
        state.activePresetId = preset.id;
        state.activeAmbianceId = ambiance.id;
    }

    function resetPreset(): void {
        setBpm(120);
        setReverbWet(0.2);
        setDelayWet(0.1);
        state.sequences = [];
        setCurrentStep(-1);
        state.activePresetId = null;
        state.activeAmbianceId = null;
    }

    return {
        state,
        toggleStep,
        setStepNote,
        setBpm,
        setPlaying,
        setAudioReady,
        setCurrentStep,
        setInstrumentVolume,
        setInstrumentDecay,
        setReverbWet,
        setDelayWet,
        applyPreset,
        resetPreset,
    };
});

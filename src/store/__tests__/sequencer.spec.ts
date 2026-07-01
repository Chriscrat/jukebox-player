import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSequencerStore } from '../sequencer'
import type { Ambiance, StylePreset } from '../../types/audio'

vi.mock('tone', () => ({
    getTransport: () => ({ stop: vi.fn() }),
}))

const MINIMAL_AMBIANCE: Ambiance = {
    id: 'test-ambiance',
    name: 'Test Ambiance',
    steps: 16,
    tracks: [
        {
            instrument: {
                id: 'kick',
                name: 'Kick',
                samples: { 'D#4': '/samples/dubstep/kick.wav' },
                defaultNote: 'D#4',
                retrigger: true,
                maxDuration: '8n',
                volume: -3,
            },
            events: [],
        },
        {
            instrument: {
                id: 'bass',
                name: 'Bass',
                samples: { 'F3': '/samples/dubstep/bass.wav' },
                defaultNote: 'F3',
                retrigger: true,
                maxDuration: '4n',
                volume: 0,
            },
            events: [],
        },
    ],
}

const MINIMAL_PRESET: StylePreset = {
    id: 'dubstep',
    name: 'Dubstep',
    bpm: 70,
    effects: { reverbWet: 0.5, delayWet: 0.6 },
    ambiances: [MINIMAL_AMBIANCE],
}

describe('useSequencerStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setActivePinia(createPinia())
    })

    describe('initial state', () => {
        it('should start with empty sequences', () => {
            const store = useSequencerStore()

            expect(store.state.sequences).toHaveLength(0)
        })

        it('should start with null activePresetId', () => {
            const store = useSequencerStore()

            expect(store.state.activePresetId).toBeNull()
        })

        it('should start with null activeAmbianceId', () => {
            const store = useSequencerStore()

            expect(store.state.activeAmbianceId).toBeNull()
        })
    })

    describe('applyPreset', () => {
        it('should create one InstrumentSequence per track', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            expect(store.state.sequences).toHaveLength(2)
            expect(store.state.sequences[0].instrumentId).toBe('kick')
            expect(store.state.sequences[1].instrumentId).toBe('bass')
        })

        it('should initialise each sequence with 16 steps, inactive when no event', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            const kick = store.state.sequences.find((s) => s.instrumentId === 'kick')
            expect(kick!.steps).toHaveLength(16)
            expect(kick!.steps.every((s) => s.active === false)).toBe(true)
        })

        it('should activate steps that match ambiance events', () => {
            const ambianceWithEvents: Ambiance = {
                ...MINIMAL_AMBIANCE,
                tracks: [
                    {
                        ...MINIMAL_AMBIANCE.tracks[0],
                        events: [{ step: 0 }, { step: 8 }],
                    },
                    MINIMAL_AMBIANCE.tracks[1],
                ],
            }

            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, ambianceWithEvents)

            const kick = store.state.sequences.find((s) => s.instrumentId === 'kick')
            expect(kick!.steps[0].active).toBe(true)
            expect(kick!.steps[8].active).toBe(true)
            expect(kick!.steps[4].active).toBe(false)
        })

        it('should copy volume from Instrument', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            const bass = store.state.sequences.find((s) => s.instrumentId === 'bass')
            expect(bass!.volume).toBe(0)

            const kick = store.state.sequences.find((s) => s.instrumentId === 'kick')
            expect(kick!.volume).toBe(-3)
        })

        it('should set bpm, reverbWet and delayWet from preset', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            expect(store.state.bpm).toBe(70)
            expect(store.state.effects.reverbWet).toBe(0.5)
            expect(store.state.effects.delayWet).toBe(0.6)
        })

        it('should set activePresetId to the preset id', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            expect(store.state.activePresetId).toBe('dubstep')
        })

        it('should set activeAmbianceId to the ambiance id', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            expect(store.state.activeAmbianceId).toBe('test-ambiance')
        })

        it('should reset currentStep to -1', () => {
            const store = useSequencerStore()
            store.setCurrentStep(8)

            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            expect(store.state.currentStep).toBe(-1)
        })
    })

    describe('resetPreset', () => {
        it('should clear all sequences', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.resetPreset()

            expect(store.state.sequences).toHaveLength(0)
        })

        it('should set activePresetId to null', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.resetPreset()

            expect(store.state.activePresetId).toBeNull()
        })

        it('should restore bpm, effects and currentStep to defaults', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.resetPreset()

            expect(store.state.bpm).toBe(120)
            expect(store.state.effects.reverbWet).toBe(0.2)
            expect(store.state.effects.delayWet).toBe(0.1)
            expect(store.state.currentStep).toBe(-1)
        })
    })

    describe('toggleStep', () => {
        it('should toggle a step from false to true', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.toggleStep('kick', 0)

            expect(store.state.sequences.find((s) => s.instrumentId === 'kick')!.steps[0].active).toBe(true)
        })

        it('should toggle a step from true back to false', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)
            store.toggleStep('kick', 0)

            store.toggleStep('kick', 0)

            expect(store.state.sequences.find((s) => s.instrumentId === 'kick')!.steps[0].active).toBe(false)
        })

        it('should not affect other instruments when toggling one', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.toggleStep('kick', 3)

            const bass = store.state.sequences.find((s) => s.instrumentId === 'bass')
            expect(bass!.steps.every((s) => s.active === false)).toBe(true)
        })

        it('should do nothing when instrumentId does not exist', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.toggleStep('unknown', 0)

            store.state.sequences.forEach((seq) => {
                expect(seq.steps.every((s) => s.active === false)).toBe(true)
            })
        })
    })

    describe('setStepNote', () => {
        it('should set a note override on a step', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.setStepNote('bass', 2, 'F#2')

            const step = store.state.sequences.find((s) => s.instrumentId === 'bass')!.steps[2]
            expect(step.note).toBe('F#2')
        })

        it('should allow clearing a note override with undefined', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)
            store.setStepNote('bass', 2, 'F#2')

            store.setStepNote('bass', 2, undefined)

            const step = store.state.sequences.find((s) => s.instrumentId === 'bass')!.steps[2]
            expect(step.note).toBeUndefined()
        })
    })

    describe('setInstrumentVolume / setInstrumentDecay', () => {
        it('should update volume for the matching instrument', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.setInstrumentVolume('bass', -6)

            expect(store.state.sequences.find((s) => s.instrumentId === 'bass')!.volume).toBe(-6)
        })

        it('should update decay for the matching instrument', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET, MINIMAL_AMBIANCE)

            store.setInstrumentDecay('kick', 0.8)

            expect(store.state.sequences.find((s) => s.instrumentId === 'kick')!.decay).toBe(0.8)
        })
    })
})

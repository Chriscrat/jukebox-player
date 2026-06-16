import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSequencerStore } from '../sequencer'
import type { StylePreset, TrackId } from '../../types/audio'

vi.mock('tone', () => ({
    getTransport: () => ({ stop: vi.fn() }),
}))

// Preset minimal utilisé dans plusieurs tests
const MINIMAL_PRESET: StylePreset = {
    id: 'lo-fi',
    label: 'LO-FI',
    bpm: 75,
    effects: { reverbWet: 0.6, delayWet: 0.3 },
    tracks: {
        kick:  { steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], params: { volume: 0.7, decay: 0.4, oscillatorType: 'sine' } },
        snare: { steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], params: { volume: 0.5, decay: 0.3, oscillatorType: 'triangle' } },
        bass:  { steps: [true, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], params: { volume: 0.6, decay: 0.5, oscillatorType: 'sine' } },
        lead:  { steps: [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false], params: { volume: 0.4, decay: 0.4, oscillatorType: 'triangle' } },
    },
}

describe('useSequencerStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setActivePinia(createPinia())
    })

    describe('setTrackSteps', () => {
        it('should map boolean[] to { active: boolean }[] correctly', () => {
            const store = useSequencerStore()
            const trackId: TrackId = 'kick'
            const boolSteps: boolean[] = [true, false, true, false, false, true, false, false, true, false, false, false, true, false, false, false]

            store.setTrackSteps(trackId, boolSteps)

            const kick = store.state.tracks.find((t) => t.id === trackId)
            expect(kick).toBeDefined()
            expect(kick!.steps).toHaveLength(16)
            expect(kick!.steps[0]).toEqual({ active: true })
            expect(kick!.steps[1]).toEqual({ active: false })
            expect(kick!.steps[2]).toEqual({ active: true })
            expect(kick!.steps[5]).toEqual({ active: true })
        })

        it('should not affect other tracks when setting steps on one track', () => {
            const store = useSequencerStore()
            const allFalse = Array<boolean>(16).fill(false)
            const allTrue = Array<boolean>(16).fill(true)

            store.setTrackSteps('kick', allTrue)
            store.setTrackSteps('snare', allFalse)

            const snare = store.state.tracks.find((t) => t.id === 'snare')
            expect(snare!.steps.every((s) => s.active === false)).toBe(true)

            const kick = store.state.tracks.find((t) => t.id === 'kick')
            expect(kick!.steps.every((s) => s.active === true)).toBe(true)
        })

        it('should do nothing when trackId does not exist', () => {
            const store = useSequencerStore()
            const stepsBefore = store.state.tracks.map((t) => ({ id: t.id, steps: [...t.steps] }))

            // Cast volontaire pour simuler un id invalide sans violer TypeScript
            store.setTrackSteps('unknown' as TrackId, Array<boolean>(16).fill(true))

            store.state.tracks.forEach((track, i) => {
                expect(track.steps).toEqual(stepsBefore[i].steps)
            })
        })
    })

    describe('applyPreset', () => {
        it('should set bpm from preset', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET)

            expect(store.state.bpm).toBe(75)
        })

        it('should set reverbWet and delayWet from preset effects', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET)

            expect(store.state.effects.reverbWet).toBe(0.6)
            expect(store.state.effects.delayWet).toBe(0.3)
        })

        it('should map track steps correctly for each track', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET)

            const kick = store.state.tracks.find((t) => t.id === 'kick')
            expect(kick!.steps[0]).toEqual({ active: true })
            expect(kick!.steps[1]).toEqual({ active: false })
            expect(kick!.steps[4]).toEqual({ active: true })

            const snare = store.state.tracks.find((t) => t.id === 'snare')
            expect(snare!.steps[4]).toEqual({ active: true })
            expect(snare!.steps[0]).toEqual({ active: false })
        })

        it('should set activeStyleId to the preset id', () => {
            const store = useSequencerStore()

            store.applyPreset(MINIMAL_PRESET)

            expect(store.state.activeStyleId).toBe('lo-fi')
        })

        it('should reset currentStep to -1', () => {
            const store = useSequencerStore()
            store.setCurrentStep(8)

            store.applyPreset(MINIMAL_PRESET)

            expect(store.state.currentStep).toBe(-1)
        })
    })

    describe('resetStyle', () => {
        it('should set bpm back to 120', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET)

            store.resetStyle()

            expect(store.state.bpm).toBe(120)
        })

        it('should set activeStyleId to null', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET)

            store.resetStyle()

            expect(store.state.activeStyleId).toBeNull()
        })

        it('should set all track steps to false', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET)

            store.resetStyle()

            store.state.tracks.forEach((track) => {
                expect(track.steps.every((s) => s.active === false)).toBe(true)
            })
        })

        it('should reset effects to default values', () => {
            const store = useSequencerStore()
            store.applyPreset(MINIMAL_PRESET)

            store.resetStyle()

            expect(store.state.effects.reverbWet).toBe(0.2)
            expect(store.state.effects.delayWet).toBe(0.1)
        })

        it('should reset currentStep to -1', () => {
            const store = useSequencerStore()
            store.setCurrentStep(5)

            store.resetStyle()

            expect(store.state.currentStep).toBe(-1)
        })
    })
})

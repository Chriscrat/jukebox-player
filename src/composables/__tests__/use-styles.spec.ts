import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStyles } from '../use-styles'
import { useSequencerStore } from '../../store/sequencer'

vi.mock('tone', () => ({
    getTransport: () => ({ stop: vi.fn() }),
}))

describe('useStyles', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setActivePinia(createPinia())
    })

    describe('styles', () => {
        it('should expose at least one preset', () => {
            const { styles } = useStyles()

            expect(styles.length).toBeGreaterThan(0)
        })

        it('should expose a dubstep preset', () => {
            const { styles } = useStyles()

            expect(styles.find((s) => s.id === 'dubstep')).toBeDefined()
        })

        it('should expose presets with at least one ambiance each', () => {
            const { styles } = useStyles()

            styles.forEach((preset) => {
                expect(preset.ambiances.length).toBeGreaterThan(0)
            })
        })
    })

    describe('applyStyle — idempotence', () => {
        it('should not call store.applyPreset when the same preset and ambiance are already active', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')
            const { applyStyle } = useStyles()

            applyStyle('dubstep', 'raptor')
            applyStyle('dubstep', 'raptor')

            expect(applyPresetSpy).toHaveBeenCalledTimes(1)
        })

        it('should call store.applyPreset again when a different ambiance is passed', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')
            const { applyStyle } = useStyles()

            applyStyle('dubstep', 'raptor')
            applyStyle('dubstep', null)

            expect(applyPresetSpy).toHaveBeenCalledTimes(2)
        })
    })

    describe('applyStyle — application du preset', () => {
        it('should apply dubstep preset bpm from the preset definition', () => {
            const store = useSequencerStore()
            const { styles, applyStyle } = useStyles()

            applyStyle('dubstep')

            const dubstepBpm = styles.find((s) => s.id === 'dubstep')!.bpm
            expect(store.state.bpm).toBe(dubstepBpm)
        })

        it('should apply dubstep effects', () => {
            const store = useSequencerStore()
            const { applyStyle } = useStyles()

            applyStyle('dubstep')

            expect(store.state.effects.reverbWet).toBe(0.5)
            expect(store.state.effects.delayWet).toBe(0.6)
        })

        it('should set activePresetId after applying', () => {
            const { applyStyle, activePresetId } = useStyles()

            applyStyle('dubstep')

            expect(activePresetId.value).toBe('dubstep')
        })

        it('should set activeAmbianceId to the first ambiance when none specified', () => {
            const { styles, applyStyle, activeAmbianceId } = useStyles()

            applyStyle('dubstep')

            const firstAmbianceId = styles.find((s) => s.id === 'dubstep')!.ambiances[0].id
            expect(activeAmbianceId.value).toBe(firstAmbianceId)
        })

        it('should set activeAmbianceId to the specified ambiance when provided', () => {
            const { applyStyle, activeAmbianceId } = useStyles()

            applyStyle('dubstep', 'raptor')

            expect(activeAmbianceId.value).toBe('raptor')
        })

        it('should create sequences for all tracks in the ambiance', () => {
            const store = useSequencerStore()
            const { applyStyle } = useStyles()

            applyStyle('dubstep', 'raptor')

            expect(store.state.sequences.length).toBeGreaterThan(0)
        })

        it('should do nothing when presetId does not match any preset', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')
            const { applyStyle } = useStyles()

            applyStyle('unknown-style')

            expect(applyPresetSpy).not.toHaveBeenCalled()
            expect(store.state.activePresetId).toBeNull()
        })

        it('should do nothing when the ambiance does not exist in the preset', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')
            const { applyStyle } = useStyles()

            applyStyle('dubstep', 'nonexistent-ambiance')

            expect(applyPresetSpy).not.toHaveBeenCalled()
        })
    })

    describe('applyFirstStyle', () => {
        it('should apply the first available preset', () => {
            const store = useSequencerStore()
            const { applyFirstStyle } = useStyles()

            applyFirstStyle()

            expect(store.state.activePresetId).toBe('dubstep')
        })

        it('should populate sequences after applying the first style', () => {
            const store = useSequencerStore()
            const { applyFirstStyle } = useStyles()

            applyFirstStyle()

            expect(store.state.sequences.length).toBeGreaterThan(0)
        })
    })

    describe('resetStyle', () => {
        it('should set activePresetId to null', () => {
            const { applyStyle, resetStyle, activePresetId } = useStyles()

            applyStyle('dubstep')
            resetStyle()

            expect(activePresetId.value).toBeNull()
        })

        it('should set activeAmbianceId to null', () => {
            const { applyStyle, resetStyle, activeAmbianceId } = useStyles()

            applyStyle('dubstep')
            resetStyle()

            expect(activeAmbianceId.value).toBeNull()
        })

        it('should reset bpm to 120', () => {
            const store = useSequencerStore()
            const { styles, applyStyle, resetStyle } = useStyles()

            applyStyle('dubstep')
            expect(store.state.bpm).toBe(styles.find((s) => s.id === 'dubstep')!.bpm)

            resetStyle()

            expect(store.state.bpm).toBe(120)
        })

        it('should clear all sequences', () => {
            const store = useSequencerStore()
            const { applyStyle, resetStyle } = useStyles()

            applyStyle('dubstep')
            expect(store.state.sequences.length).toBeGreaterThan(0)

            resetStyle()

            expect(store.state.sequences).toHaveLength(0)
        })

        it('should call store.resetPreset', () => {
            const store = useSequencerStore()
            const resetPresetSpy = vi.spyOn(store, 'resetPreset')
            const { resetStyle } = useStyles()

            resetStyle()

            expect(resetPresetSpy).toHaveBeenCalledTimes(1)
        })
    })
})

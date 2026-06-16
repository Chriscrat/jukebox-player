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

    describe('applyStyle — idempotence', () => {
        it('should not call store.applyPreset when the same styleId is already active', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')

            const { applyStyle } = useStyles()

            // Premier appel : applique le style
            applyStyle('lo-fi')
            expect(applyPresetSpy).toHaveBeenCalledTimes(1)

            // Deuxième appel avec le même id : doit être ignoré
            applyStyle('lo-fi')
            expect(applyPresetSpy).toHaveBeenCalledTimes(1)
        })

        it('should call store.applyPreset again when a different styleId is passed', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')

            const { applyStyle } = useStyles()

            applyStyle('lo-fi')
            applyStyle('metal')

            expect(applyPresetSpy).toHaveBeenCalledTimes(2)
        })
    })

    describe('applyStyle — application du preset', () => {
        it('should apply lo-fi preset with bpm 75 and reverbWet 0.6', () => {
            const store = useSequencerStore()
            const { applyStyle } = useStyles()

            applyStyle('lo-fi')

            expect(store.state.bpm).toBe(75)
            expect(store.state.effects.reverbWet).toBe(0.6)
            expect(store.state.activeStyleId).toBe('lo-fi')
        })

        it('should apply lo-fi kick steps correctly (on beats 1, 5, 9, 13)', () => {
            const store = useSequencerStore()
            const { applyStyle } = useStyles()

            applyStyle('lo-fi')

            const kick = store.state.tracks.find((t) => t.id === 'kick')
            expect(kick!.steps[0]).toEqual({ active: true })
            expect(kick!.steps[4]).toEqual({ active: true })
            expect(kick!.steps[8]).toEqual({ active: true })
            expect(kick!.steps[12]).toEqual({ active: true })
            // Les steps intermédiaires doivent être inactifs
            expect(kick!.steps[1]).toEqual({ active: false })
            expect(kick!.steps[2]).toEqual({ active: false })
            expect(kick!.steps[3]).toEqual({ active: false })
        })

        it('should apply metal preset with bpm 165 and reverbWet 0.1', () => {
            const store = useSequencerStore()
            const { applyStyle } = useStyles()

            applyStyle('metal')

            expect(store.state.bpm).toBe(165)
            expect(store.state.effects.reverbWet).toBe(0.1)
            expect(store.state.effects.delayWet).toBe(0.05)
            expect(store.state.activeStyleId).toBe('metal')
        })

        it('should do nothing when styleId does not match any preset', () => {
            const store = useSequencerStore()
            const applyPresetSpy = vi.spyOn(store, 'applyPreset')
            const { applyStyle } = useStyles()

            applyStyle('unknown-style' as Parameters<typeof applyStyle>[0])

            expect(applyPresetSpy).not.toHaveBeenCalled()
            expect(store.state.activeStyleId).toBeNull()
        })

        it('should update activeStyleId computed ref after applying a style', () => {
            const { applyStyle, activeStyleId } = useStyles()

            expect(activeStyleId.value).toBeNull()

            applyStyle('jazz')

            expect(activeStyleId.value).toBe('jazz')
        })
    })

    describe('resetStyle', () => {
        it('should set activeStyleId to null after reset', () => {
            const { applyStyle, resetStyle, activeStyleId } = useStyles()

            applyStyle('punk')
            expect(activeStyleId.value).toBe('punk')

            resetStyle()

            expect(activeStyleId.value).toBeNull()
        })

        it('should reset bpm to 120 after reset', () => {
            const store = useSequencerStore()
            const { applyStyle, resetStyle } = useStyles()

            applyStyle('metal')
            expect(store.state.bpm).toBe(165)

            resetStyle()

            expect(store.state.bpm).toBe(120)
        })

        it('should reset all steps to false after reset', () => {
            const store = useSequencerStore()
            const { applyStyle, resetStyle } = useStyles()

            applyStyle('punk')
            resetStyle()

            store.state.tracks.forEach((track) => {
                expect(track.steps.every((s) => s.active === false)).toBe(true)
            })
        })

        it('should call store.resetStyle via the composable resetStyle', () => {
            const store = useSequencerStore()
            const resetStyleSpy = vi.spyOn(store, 'resetStyle')
            const { resetStyle } = useStyles()

            resetStyle()

            expect(resetStyleSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('styles — liste des presets', () => {
        it('should expose 7 style presets', () => {
            const { styles } = useStyles()

            expect(styles).toHaveLength(7)
        })

        it('should expose presets with expected ids', () => {
            const { styles } = useStyles()
            const ids = styles.map((s) => s.id)

            expect(ids).toContain('lo-fi')
            expect(ids).toContain('metal')
            expect(ids).toContain('punk')
            expect(ids).toContain('cyberpunk')
            expect(ids).toContain('dubstep')
            expect(ids).toContain('jazz')
            expect(ids).toContain('psytrance')
        })
    })
})

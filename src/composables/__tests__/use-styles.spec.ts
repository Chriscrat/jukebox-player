import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStyles, STYLE_PRESETS } from '../use-styles'
import { useSequencerStore } from '../../store/sequencer'
import type { TrackId } from '../../types/audio'

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

const TRACK_IDS: TrackId[] = ['kick', 'snare', 'bass', 'lead']

const VALID_MELODIC_SYNTH_TYPES = ['synth', 'fm', 'am', 'poly'] as const

describe('STYLE_PRESETS — synthConfig shape validation', () => {
    it('should have a synthConfig field on every preset', () => {
        STYLE_PRESETS.forEach((preset) => {
            expect(preset.synthConfig).toBeDefined()
            expect(typeof preset.synthConfig).toBe('object')
        })
    })

    it('should have exactly the 4 track keys in every synthConfig', () => {
        STYLE_PRESETS.forEach((preset) => {
            const keys = Object.keys(preset.synthConfig).sort()
            expect(keys).toEqual([...TRACK_IDS].sort())
        })
    })

    describe('kick config', () => {
        it('should have a positive pitchDecay on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.kick.pitchDecay).toBeGreaterThan(0)
            })
        })

        it('should have a positive octaves on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.kick.octaves).toBeGreaterThan(0)
            })
        })

        it('should have a kick envelope with attack, decay and release all positive', () => {
            STYLE_PRESETS.forEach((preset) => {
                const env = preset.synthConfig.kick.envelope
                expect(env.attack).toBeGreaterThan(0)
                expect(env.decay).toBeGreaterThan(0)
                expect(env.release).toBeGreaterThan(0)
            })
        })

        it('should have sustain equal to 0 on kick envelope for every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.kick.envelope.sustain).toBe(0)
            })
        })
    })

    describe('snare config', () => {
        it('should have positive harmonicity on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.snare.harmonicity).toBeGreaterThan(0)
            })
        })

        it('should have positive modulationIndex on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.snare.modulationIndex).toBeGreaterThan(0)
            })
        })

        it('should have positive resonance on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.snare.resonance).toBeGreaterThan(0)
            })
        })

        it('should have positive octaves on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(preset.synthConfig.snare.octaves).toBeGreaterThan(0)
            })
        })

        it('should have a snare envelope with attack, decay and release all positive', () => {
            STYLE_PRESETS.forEach((preset) => {
                const env = preset.synthConfig.snare.envelope
                expect(env.attack).toBeGreaterThan(0)
                expect(env.decay).toBeGreaterThan(0)
                expect(env.release).toBeGreaterThan(0)
            })
        })

        it('should have no sustain field on snare envelope', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect('sustain' in preset.synthConfig.snare.envelope).toBe(false)
            })
        })
    })

    describe('bass and lead synthType', () => {
        it('should have a valid MelodicSynthType for bass on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(VALID_MELODIC_SYNTH_TYPES).toContain(preset.synthConfig.bass.synthType)
            })
        })

        it('should have a valid MelodicSynthType for lead on every preset', () => {
            STYLE_PRESETS.forEach((preset) => {
                expect(VALID_MELODIC_SYNTH_TYPES).toContain(preset.synthConfig.lead.synthType)
            })
        })
    })

    describe('specific preset assignments', () => {
        it('should assign synthType fm to metal bass', () => {
            const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!
            expect(metal.synthConfig.bass.synthType).toBe('fm')
        })

        it('should assign synthType poly to jazz lead', () => {
            const jazz = STYLE_PRESETS.find((p) => p.id === 'jazz')!
            expect(jazz.synthConfig.lead.synthType).toBe('poly')
        })

        it('should assign synthType am to dubstep bass', () => {
            const dubstep = STYLE_PRESETS.find((p) => p.id === 'dubstep')!
            expect(dubstep.synthConfig.bass.synthType).toBe('am')
        })

        it('should assign synthType synth to lo-fi bass', () => {
            const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
            expect(loFi.synthConfig.bass.synthType).toBe('synth')
        })
    })

    describe('sonic diversity between lo-fi and metal', () => {
        it('should have different kick pitchDecay between lo-fi and metal', () => {
            const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
            const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!
            expect(loFi.synthConfig.kick.pitchDecay).not.toBe(metal.synthConfig.kick.pitchDecay)
        })

        it('should have different kick octaves between lo-fi and metal', () => {
            const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
            const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!
            expect(loFi.synthConfig.kick.octaves).not.toBe(metal.synthConfig.kick.octaves)
        })

        it('should have different kick envelope decay between lo-fi and metal', () => {
            const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
            const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!
            expect(loFi.synthConfig.kick.envelope.decay).not.toBe(metal.synthConfig.kick.envelope.decay)
        })
    })
})

describe('STYLE_PRESETS — shape validation', () => {
    it('should have exactly 7 presets', () => {
        expect(STYLE_PRESETS).toHaveLength(7)
    })

    it('should have a notes field on every preset', () => {
        STYLE_PRESETS.forEach((preset) => {
            expect(preset.notes).toBeDefined()
            expect(typeof preset.notes).toBe('object')
        })
    })

    it('should have exactly the 4 track keys in every notes object', () => {
        STYLE_PRESETS.forEach((preset) => {
            const noteKeys = Object.keys(preset.notes).sort()
            expect(noteKeys).toEqual([...TRACK_IDS].sort())
        })
    })

    it('should have a non-empty string for every note value in every preset', () => {
        STYLE_PRESETS.forEach((preset) => {
            TRACK_IDS.forEach((trackId) => {
                const note = preset.notes[trackId]
                expect(typeof note).toBe('string')
                expect(note.length).toBeGreaterThan(0)
            })
        })
    })

    it('should have distinct lead notes between lo-fi and metal', () => {
        const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
        const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!

        expect(loFi.notes.lead).not.toBe(metal.notes.lead)
    })

    it('should have distinct kick notes between lo-fi and metal', () => {
        const loFi = STYLE_PRESETS.find((p) => p.id === 'lo-fi')!
        const metal = STYLE_PRESETS.find((p) => p.id === 'metal')!

        expect(loFi.notes.kick).not.toBe(metal.notes.kick)
    })

    it('should match the documented note values for each preset', () => {
        const expected: Record<string, Record<TrackId, string>> = {
            'lo-fi':     { kick: 'C1', snare: 'E3', bass: 'A1', lead: 'G4' },
            'metal':     { kick: 'B0', snare: 'C3', bass: 'E1', lead: 'D3' },
            'punk':      { kick: 'C1', snare: 'A3', bass: 'G1', lead: 'A3' },
            'cyberpunk': { kick: 'C1', snare: 'F3', bass: 'F1', lead: 'F4' },
            'dubstep':   { kick: 'C1', snare: 'D3', bass: 'C1', lead: 'Bb3' },
            'jazz':      { kick: 'C1', snare: 'A2', bass: 'F2', lead: 'Eb4' },
            'psytrance': { kick: 'C1', snare: 'G3', bass: 'A1', lead: 'B4' },
        }

        STYLE_PRESETS.forEach((preset) => {
            TRACK_IDS.forEach((trackId) => {
                expect(preset.notes[trackId]).toBe(expected[preset.id][trackId])
            })
        })
    })
})

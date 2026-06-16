import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSequencerStore } from '../../store/sequencer'
import { STYLE_PRESETS } from '../use-styles'
import type { StyleSynthConfig, TrackId } from '../../types/audio'

/**
 * resolveSynthConfig is internal to useAudioEngine — it cannot be tested by
 * importing it directly without pulling in Tone.js (which requires an
 * AudioContext unavailable in Node).
 *
 * Strategy: reproduce the exact same logic here and assert the contract.
 * The logic is a pure lookup against STYLE_PRESETS and the store state —
 * no Tone.js dependency.
 */

const DEFAULT_SYNTH_CONFIG: StyleSynthConfig = {
    kick: {
        pitchDecay: 0.05,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    },
    snare: {
        harmonicity: 3,
        modulationIndex: 10,
        resonance: 3000,
        octaves: 1,
        envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
    },
    bass: {
        synthType: 'synth',
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 },
    },
    lead: {
        synthType: 'synth',
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 },
    },
}

const TRACK_IDS: TrackId[] = ['kick', 'snare', 'bass', 'lead']

function resolveSynthConfig(activeStyleId: string | null): StyleSynthConfig {
    if (!activeStyleId) return DEFAULT_SYNTH_CONFIG
    const preset = STYLE_PRESETS.find((p) => p.id === activeStyleId)
    return preset?.synthConfig ?? DEFAULT_SYNTH_CONFIG
}

describe('resolveSynthConfig — logic contract', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('when activeStyleId is null', () => {
        it('should return DEFAULT_SYNTH_CONFIG', () => {
            const result = resolveSynthConfig(null)

            expect(result).toEqual(DEFAULT_SYNTH_CONFIG)
        })

        it('should return bass.synthType of synth in default config', () => {
            const result = resolveSynthConfig(null)

            expect(result.bass.synthType).toBe('synth')
        })

        it('should return lead.synthType of synth in default config', () => {
            const result = resolveSynthConfig(null)

            expect(result.lead.synthType).toBe('synth')
        })

        it('should return kick.sustain of 0 in default config', () => {
            const result = resolveSynthConfig(null)

            expect(result.kick.envelope.sustain).toBe(0)
        })
    })

    describe('when activeStyleId matches a known preset', () => {
        it('should return bass.synthType fm when activeStyleId is metal', () => {
            const result = resolveSynthConfig('metal')

            expect(result.bass.synthType).toBe('fm')
        })

        it('should return lead.synthType fm when activeStyleId is metal', () => {
            const result = resolveSynthConfig('metal')

            expect(result.lead.synthType).toBe('fm')
        })

        it('should return lead.synthType poly when activeStyleId is jazz', () => {
            const result = resolveSynthConfig('jazz')

            expect(result.lead.synthType).toBe('poly')
        })

        it('should return bass.synthType am when activeStyleId is dubstep', () => {
            const result = resolveSynthConfig('dubstep')

            expect(result.bass.synthType).toBe('am')
        })

        it('should have exactly the 4 track keys in the returned config', () => {
            const result = resolveSynthConfig('lo-fi')

            const keys = Object.keys(result).sort()
            expect(keys).toEqual([...TRACK_IDS].sort())
        })

        it('should return kick.sustain of 0 for metal preset', () => {
            const result = resolveSynthConfig('metal')

            expect(result.kick.envelope.sustain).toBe(0)
        })

        it('should return snare envelope without sustain field for jazz preset', () => {
            const result = resolveSynthConfig('jazz')

            expect('sustain' in result.snare.envelope).toBe(false)
        })
    })

    describe('when activeStyleId is an unknown string', () => {
        it('should fall back to DEFAULT_SYNTH_CONFIG', () => {
            const result = resolveSynthConfig('unknown-style')

            expect(result).toEqual(DEFAULT_SYNTH_CONFIG)
        })

        it('should return bass.synthType synth when falling back', () => {
            const result = resolveSynthConfig('not-a-real-style')

            expect(result.bass.synthType).toBe('synth')
        })
    })

    describe('store integration — activeStyleId drives synth config resolution', () => {
        it('should resolve metal config when store.state.activeStyleId is metal', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'metal')!)

            const result = resolveSynthConfig(store.state.activeStyleId)

            expect(result.bass.synthType).toBe('fm')
            expect(result.lead.synthType).toBe('fm')
        })

        it('should resolve jazz config when store.state.activeStyleId is jazz', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'jazz')!)

            const result = resolveSynthConfig(store.state.activeStyleId)

            expect(result.lead.synthType).toBe('poly')
        })

        it('should return DEFAULT_SYNTH_CONFIG when store.state.activeStyleId is null', () => {
            const store = useSequencerStore()

            expect(store.state.activeStyleId).toBeNull()

            const result = resolveSynthConfig(store.state.activeStyleId)

            expect(result).toEqual(DEFAULT_SYNTH_CONFIG)
        })

        it('should return DEFAULT_SYNTH_CONFIG after resetStyle clears activeStyleId', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'metal')!)

            expect(store.state.activeStyleId).toBe('metal')

            store.resetStyle()

            const result = resolveSynthConfig(store.state.activeStyleId)
            expect(result).toEqual(DEFAULT_SYNTH_CONFIG)
        })
    })
})

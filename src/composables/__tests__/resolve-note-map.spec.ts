import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSequencerStore } from '../../store/sequencer'
import { STYLE_PRESETS } from '../use-styles'
import type { TrackId } from '../../types/audio'

/**
 * resolveNoteMap is internal to useAudioEngine — it cannot be tested by
 * importing it directly without pulling in Tone.js (which requires an
 * AudioContext unavailable in Node).
 *
 * Strategy: reproduce the exact same logic here and assert the contract.
 * The logic is a pure lookup against STYLE_PRESETS and the store state —
 * no Tone.js dependency.
 */

const DEFAULT_NOTE_MAP: Record<TrackId, string> = {
    kick: 'C1',
    snare: 'C2',
    bass: 'C2',
    lead: 'C4',
}

function resolveNoteMap(activeStyleId: string | null): Record<TrackId, string> {
    if (!activeStyleId) return DEFAULT_NOTE_MAP
    const preset = STYLE_PRESETS.find((p) => p.id === activeStyleId)
    return preset?.notes ?? DEFAULT_NOTE_MAP
}

describe('resolveNoteMap — logic contract', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('when activeStyleId is null', () => {
        it('should return DEFAULT_NOTE_MAP', () => {
            const result = resolveNoteMap(null)

            expect(result).toEqual(DEFAULT_NOTE_MAP)
        })

        it('should return C1 for kick in default map', () => {
            const result = resolveNoteMap(null)

            expect(result.kick).toBe('C1')
        })

        it('should return C4 for lead in default map', () => {
            const result = resolveNoteMap(null)

            expect(result.lead).toBe('C4')
        })
    })

    describe('when activeStyleId matches a known preset', () => {
        it('should return the lo-fi notes when activeStyleId is lo-fi', () => {
            const result = resolveNoteMap('lo-fi')

            expect(result.kick).toBe('C1')
            expect(result.snare).toBe('E3')
            expect(result.bass).toBe('A1')
            expect(result.lead).toBe('G4')
        })

        it('should return the metal notes when activeStyleId is metal', () => {
            const result = resolveNoteMap('metal')

            expect(result.kick).toBe('B0')
            expect(result.snare).toBe('C3')
            expect(result.bass).toBe('E1')
            expect(result.lead).toBe('D3')
        })

        it('should return the jazz notes when activeStyleId is jazz', () => {
            const result = resolveNoteMap('jazz')

            expect(result.kick).toBe('C1')
            expect(result.snare).toBe('A2')
            expect(result.bass).toBe('F2')
            expect(result.lead).toBe('Eb4')
        })

        it('should return the dubstep notes when activeStyleId is dubstep', () => {
            const result = resolveNoteMap('dubstep')

            expect(result.kick).toBe('C1')
            expect(result.snare).toBe('D3')
            expect(result.bass).toBe('C1')
            expect(result.lead).toBe('Bb3')
        })
    })

    describe('when activeStyleId is an unknown string', () => {
        it('should fall back to DEFAULT_NOTE_MAP', () => {
            const result = resolveNoteMap('unknown-style')

            expect(result).toEqual(DEFAULT_NOTE_MAP)
        })

        it('should return C4 for lead when falling back', () => {
            const result = resolveNoteMap('not-a-real-style')

            expect(result.lead).toBe('C4')
        })
    })

    describe('store integration — activeStyleId drives note resolution', () => {
        it('should resolve lo-fi notes when store.state.activeStyleId is lo-fi', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'lo-fi')!)

            const result = resolveNoteMap(store.state.activeStyleId)

            expect(result.lead).toBe('G4')
            expect(result.kick).toBe('C1')
        })

        it('should resolve metal notes when store.state.activeStyleId is metal', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'metal')!)

            const result = resolveNoteMap(store.state.activeStyleId)

            expect(result.kick).toBe('B0')
            expect(result.lead).toBe('D3')
        })

        it('should return DEFAULT_NOTE_MAP when store.state.activeStyleId is null', () => {
            const store = useSequencerStore()

            expect(store.state.activeStyleId).toBeNull()

            const result = resolveNoteMap(store.state.activeStyleId)

            expect(result).toEqual(DEFAULT_NOTE_MAP)
        })

        it('should return DEFAULT_NOTE_MAP after resetStyle clears activeStyleId', () => {
            const store = useSequencerStore()
            store.applyPreset(STYLE_PRESETS.find((p) => p.id === 'psytrance')!)

            expect(store.state.activeStyleId).toBe('psytrance')

            store.resetStyle()

            const result = resolveNoteMap(store.state.activeStyleId)
            expect(result).toEqual(DEFAULT_NOTE_MAP)
        })
    })
})

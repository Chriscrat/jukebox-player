import { computed } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import { STYLE_PRESETS } from '../presets';

/**
 * Provides style preset list and controls to apply or reset them.
 * Stops Tone.js transport automatically before any preset change.
 */
export function useStyles() {
    const store = useSequencerStore()

    const activePresetId = computed(() => store.state.activePresetId)
    const activeAmbianceId = computed(() => store.state.activeAmbianceId)

    function stopIfPlaying(): void {
        if (!store.state.isPlaying) return
        try {
            Tone.getTransport().stop()
            store.setCurrentStep(-1)
            store.setPlaying(false)
        } catch (err) {
            console.error('Stop failed during style change:', err)
            return
        }
    }

    function applyStyle(presetId: string, ambianceId: string | null = null): void {
        if (store.state.activePresetId === presetId && store.state.activeAmbianceId === ambianceId) return
        stopIfPlaying()
        const preset = STYLE_PRESETS.find((p) => p.id === presetId)
        if (!preset) return

        const firstAmbiance = preset.ambiances[0];
        const selectedAmbiance = ambianceId ? preset.ambiances.find(ambiance => ambiance.id === ambianceId) : firstAmbiance;
        if (!selectedAmbiance) return

        // Guard dev
        if (import.meta.env.DEV) {
            const instruments = selectedAmbiance.tracks.map(track => track.instrument);
            instruments.forEach(inst => {
                if (!inst.samples[inst.defaultNote]) {
                    console.warn(`[useStyles] defaultNote "${inst.defaultNote}" absent des samples de "${inst.id}"`)
                }
            })
        }
        store.applyPreset(preset, selectedAmbiance)
    }

    function applyFirstStyle(): void {
        const firstPresetId = STYLE_PRESETS[0].id;
        applyStyle(firstPresetId);
    }

    function resetStyle(): void {
        stopIfPlaying()
        store.resetPreset()
    }

    return { styles: STYLE_PRESETS, activePresetId, activeAmbianceId, applyFirstStyle, applyStyle, resetStyle }
}

<template>
    <section class="grid">
        <div
            v-for="seq in store.state.sequences"
            :key="seq.instrumentId"
            class="grid__instrument"
        >
            <div class="grid__row">
                <div class="grid__label">{{ instrumentLabel(seq.instrumentId) }}</div>

                <div class="grid__steps">
                    <button
                        v-for="(step, index) in seq.steps"
                        :key="index"
                        class="step"
                        :class="{
                            'step--active': step.active,
                            'step--current': store.state.currentStep === index && store.state.isPlaying,
                            'step--beat': index % 4 === 0,
                        }"
                        @click="store.toggleStep(seq.instrumentId, index)"
                    />
                </div>

                <TrackControls :sequence="seq" />
            </div>

            <div
                v-if="hasMultipleSamples(seq.instrumentId)"
                class="grid__row grid__row--notes"
            >
                <div class="grid__label"></div>

                <div class="grid__steps">
                    <div
                        v-for="(step, index) in seq.steps"
                        :key="index"
                        class="note-cell"
                    >
                        <button
                            v-if="step.active"
                            class="note-btn"
                            :title="`Clic pour changer de note`"
                            @click="cycleNote(seq.instrumentId, index)"
                        >
                            {{ resolveStepNote(seq, index) }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSequencerStore } from '../store/sequencer'
import { useStyles } from '../composables/use-styles'
import TrackControls from './TrackControls.vue'
import type { Instrument, InstrumentId, InstrumentSequence } from '../types/audio'

const store = useSequencerStore()
const { styles } = useStyles()

const activePreset = computed(() =>
    styles.find((p) => p.id === store.state.activePresetId)
)

const activeAmbiance = computed(() =>
    activePreset.value?.ambiances?.find((ambiance) => ambiance.id === store.state.activeAmbianceId)
)

function instrumentConfig(instrumentId: string): Instrument<InstrumentId> | undefined {
    const instruments = activeAmbiance.value?.tracks.map(track => track.instrument)
    return instruments?.find((inst) => inst.id === instrumentId)
}

function instrumentLabel(instrumentId: string): string {
    return instrumentConfig(instrumentId)?.name ?? instrumentId.toUpperCase()
}

function hasMultipleSamples(instrumentId: string): boolean {
    const config = instrumentConfig(instrumentId)
    return config ? Object.keys(config.samples).length > 1 : false
}

function resolveStepNote(seq: InstrumentSequence, stepIndex: number): string {
    return seq.steps[stepIndex].note ?? instrumentConfig(seq.instrumentId)?.defaultNote ?? ''
}

function cycleNote(instrumentId: string, stepIndex: number): void {
    const config = instrumentConfig(instrumentId)
    if (!config) return
    const notes = Object.keys(config.samples)
    const seq = store.state.sequences.find((s) => s.instrumentId === instrumentId)
    if (!seq) return
    const current = resolveStepNote(seq, stepIndex)
    const next = notes[(notes.indexOf(current) + 1) % notes.length]
    store.setStepNote(instrumentId, stepIndex, next)
}
</script>

<style scoped>
.grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.grid__instrument {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.grid__row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.grid__row--notes {
    align-items: flex-start;
}

.grid__label {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    width: 3rem;
    flex-shrink: 0;
    text-align: right;
}

.grid__steps {
    display: flex;
    gap: 4px;
    flex: 1;
}

.step {
    width: 44px;
    height: 44px;
    border-radius: 3px;
    border: 1px solid rgba(0, 255, 255, 0.2);
    background: rgba(0, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.08s ease;
    flex-shrink: 0;
    padding: 0;
}

.step--beat {
    border-color: rgba(0, 255, 255, 0.35);
}

.step:hover {
    border-color: var(--neon-cyan);
    background: rgba(0, 255, 255, 0.1);
}

.step--active {
    background: var(--neon-cyan);
    border-color: var(--neon-cyan);
    box-shadow:
        0 0 8px var(--neon-cyan),
        0 0 20px rgba(0, 255, 255, 0.4);
}

.step--current {
    outline: 2px solid var(--neon-magenta);
    outline-offset: 2px;
    box-shadow:
        0 0 8px var(--neon-cyan),
        0 0 20px rgba(0, 255, 255, 0.4),
        0 0 12px var(--neon-magenta);
}

.note-cell {
    width: 44px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.note-btn {
    width: 100%;
    height: 100%;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.5rem;
    letter-spacing: 0.05em;
    color: var(--neon-violet);
    border: 1px solid rgba(160, 32, 240, 0.4);
    background: rgba(160, 32, 240, 0.08);
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
    padding: 0;
}

.note-btn:hover {
    background: rgba(160, 32, 240, 0.22);
    border-color: var(--neon-violet);
    box-shadow: 0 0 6px rgba(160, 32, 240, 0.4);
}
</style>

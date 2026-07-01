<template>
    <div class="track-controls">
        <div class="control">
            <label class="label">VOL</label>
            <input
                type="range"
                min="-24"
                max="6"
                step="0.5"
                :value="sequence.volume"
                class="slider slider--violet"
                @input="(e) => store.setInstrumentVolume(sequence.instrumentId, Number((e.target as HTMLInputElement).value))"
            />
            <span class="value">{{ sequence.volume > 0 ? '+' : '' }}{{ sequence.volume }}dB</span>
        </div>

        <div class="control">
            <label class="label">DCY</label>
            <input
                type="range"
                min="0.05"
                max="1"
                step="0.01"
                :value="sequence.decay"
                class="slider slider--violet"
                @input="(e) => store.setInstrumentDecay(sequence.instrumentId, Number((e.target as HTMLInputElement).value))"
            />
            <span class="value">{{ sequence.decay.toFixed(2) }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSequencerStore } from '../store/sequencer'
import type { InstrumentSequence } from '../types/audio'

defineProps<{ sequence: InstrumentSequence }>()

const store = useSequencerStore()
</script>

<style scoped>
.track-controls {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0 0.5rem;
    min-width: 100px;
}

.control {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.label {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    width: 2rem;
    flex-shrink: 0;
}

.value {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.6rem;
    color: var(--neon-violet);
    width: 3.5rem;
    text-align: right;
}
</style>

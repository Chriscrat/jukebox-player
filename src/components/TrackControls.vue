<template>
    <div class="track-controls">
        <div class="control">
            <label class="label">VOL</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="track.params.volume"
                class="slider slider--violet"
                @input="(e) => store.setTrackVolume(track.id, Number((e.target as HTMLInputElement).value))"
            />
            <span class="value">{{ Math.round(track.params.volume * 100) }}</span>
        </div>

        <div class="control">
            <label class="label">DCY</label>
            <input
                type="range"
                min="0.05"
                max="1"
                step="0.01"
                :value="track.params.decay"
                class="slider slider--violet"
                @input="(e) => store.setTrackDecay(track.id, Number((e.target as HTMLInputElement).value))"
            />
            <span class="value">{{ track.params.decay.toFixed(2) }}</span>
        </div>

        <div v-if="track.id === 'bass' || track.id === 'lead'" class="control control--select">
            <label class="label">OSC</label>
            <select
                class="select"
                :value="track.params.oscillatorType"
                @change="(e) => store.setTrackOscillator(track.id, (e.target as HTMLSelectElement).value)"
            >
                <option value="sine">SIN</option>
                <option value="square">SQR</option>
                <option value="sawtooth">SAW</option>
                <option value="triangle">TRI</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSequencerStore } from '../store/sequencer'
import type { Track } from '../types/audio'

defineProps<{ track: Track }>()

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
    width: 2.5rem;
    text-align: right;
}

.select {
    background: transparent;
    border: 1px solid var(--neon-violet);
    color: var(--neon-violet);
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.65rem;
    padding: 0.1rem 0.3rem;
    border-radius: 2px;
    cursor: pointer;
    outline: none;
}

.select:focus {
    box-shadow: 0 0 6px var(--neon-violet);
}

.select option {
    background: #010106;
}
</style>

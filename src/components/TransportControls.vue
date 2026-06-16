<template>
    <section class="transport">
        <div class="transport__buttons">
            <button
                class="btn btn--play"
                :class="{ 'btn--active': store.state.isPlaying }"
                :disabled="!store.state.isAudioReady || store.state.isPlaying"
                @click="emit('play')"
            >
                ▶ PLAY
            </button>
            <button
                class="btn btn--stop"
                :disabled="!store.state.isPlaying"
                @click="emit('stop')"
            >
                ■ STOP
            </button>
        </div>

        <div class="transport__bpm">
            <label class="label" for="bpm-slider">
                BPM <span class="value">{{ store.state.bpm }}</span>
            </label>
            <input
                id="bpm-slider"
                type="range"
                min="60"
                max="180"
                step="1"
                :value="store.state.bpm"
                class="slider slider--cyan"
                @input="handleBpm"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
import { useSequencerStore } from '../store/sequencer'

const store = useSequencerStore()
const emit = defineEmits<{ play: []; stop: [] }>()

function handleBpm(event: Event): void {
    const input = event.target as HTMLInputElement
    store.setBpm(Number(input.value))
}
</script>

<style scoped>
.transport {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    padding: 1rem 1.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.transport__buttons {
    display: flex;
    gap: 0.75rem;
}

.transport__bpm {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 200px;
}

.btn {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    padding: 0.6rem 1.2rem;
    border-radius: 3px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.15s ease;
    background: transparent;
}

.btn--play {
    color: var(--neon-cyan);
    border-color: var(--neon-cyan);
}

.btn--play:not(:disabled):hover,
.btn--play.btn--active {
    background: var(--neon-cyan);
    color: #010106;
    box-shadow: 0 0 12px var(--neon-cyan);
}

.btn--stop {
    color: var(--neon-magenta);
    border-color: var(--neon-magenta);
}

.btn--stop:not(:disabled):hover {
    background: var(--neon-magenta);
    color: #010106;
    box-shadow: 0 0 12px var(--neon-magenta);
}

.btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.label {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-transform: uppercase;
}

.value {
    color: var(--neon-cyan);
    text-shadow: 0 0 6px var(--neon-cyan);
    margin-left: 0.5rem;
}
</style>

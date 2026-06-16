<template>
    <section class="effects">
        <h2 class="effects__title">FX</h2>

        <div class="effects__controls">
            <div class="effect">
                <label class="label" for="reverb">
                    REVERB <span class="value">{{ Math.round(store.state.effects.reverbWet * 100) }}%</span>
                </label>
                <input
                    id="reverb"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="store.state.effects.reverbWet"
                    class="slider slider--magenta"
                    @input="(e) => store.setReverbWet(Number((e.target as HTMLInputElement).value))"
                />
            </div>

            <div class="effect">
                <label class="label" for="delay">
                    DELAY <span class="value">{{ Math.round(store.state.effects.delayWet * 100) }}%</span>
                </label>
                <input
                    id="delay"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="store.state.effects.delayWet"
                    class="slider slider--magenta"
                    @input="(e) => store.setDelayWet(Number((e.target as HTMLInputElement).value))"
                />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useSequencerStore } from '../store/sequencer'

const store = useSequencerStore()
</script>

<style scoped>
.effects {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 1.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.effects__title {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    margin: 0;
}

.effects__controls {
    display: flex;
    gap: 2rem;
    flex: 1;
}

.effect {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
}

.label {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.value {
    color: var(--neon-magenta);
    text-shadow: 0 0 6px var(--neon-magenta);
}
</style>

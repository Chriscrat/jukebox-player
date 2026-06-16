<template>
    <section class="grid">
        <div
            v-for="track in store.state.tracks"
            :key="track.id"
            class="grid__row"
        >
            <div class="grid__label">{{ track.label }}</div>

            <div class="grid__steps">
                <button
                    v-for="(step, index) in track.steps"
                    :key="index"
                    class="step"
                    :class="{
                        'step--active': step.active,
                        'step--current': store.state.currentStep === index && store.state.isPlaying,
                        'step--beat': index % 4 === 0,
                    }"
                    @click="store.toggleStep(track.id, index)"
                />
            </div>

            <TrackControls :track="track" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { useSequencerStore } from '../store/sequencer'
import TrackControls from './TrackControls.vue'

const store = useSequencerStore()
</script>

<style scoped>
.grid {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem 1.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.grid__row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
</style>

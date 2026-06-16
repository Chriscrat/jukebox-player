<template>
    <StartOverlay
        v-if="!store.state.isAudioReady"
        @start="handleStart"
    />

    <main
        v-else
        class="app"
    >
        <header class="app__header">
            <h1 class="app__title">JUKEBOX</h1>
            <span class="app__sub">BEAT SEQUENCER</span>
        </header>

        <div class="app__body">
            <TransportControls
                @play="engine.play"
                @stop="engine.stop"
            />
            <StyleSelector
                @apply-style="handleApplyStyle"
                @reset-style="handleResetStyle"
            />
            <SequencerGrid />
            <EffectsPanel />
        </div>

        <footer class="app__footer">
            <span>16-STEP // 4 TRACKS // TONE.JS</span>
        </footer>
    </main>
</template>

<script setup lang="ts">
    import { useSequencerStore } from './store/sequencer';
    import { useAudioEngine } from './composables/use-audio-engine';
    import { useStyles } from './composables/use-styles';
    import StartOverlay from './components/StartOverlay.vue';
    import TransportControls from './components/TransportControls.vue';
    import SequencerGrid from './components/SequencerGrid.vue';
    import EffectsPanel from './components/EffectsPanel.vue';
    import StyleSelector from './components/StyleSelector.vue';
    import type { StyleId } from './types/audio';

    const store = useSequencerStore();
    const engine = useAudioEngine();
    const { applyStyle, resetStyle } = useStyles();

    async function handleStart(): Promise<void> {
        await engine.startAudio();
    }

    function handleApplyStyle(id: StyleId): void {
        if (store.state.isPlaying) engine.stop();
        applyStyle(id);
    }

    function handleResetStyle(): void {
        if (store.state.isPlaying) engine.stop();
        resetStyle();
    }
</script>

<style scoped>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 2rem;
        max-width: 1100px;
        margin: 0 auto;
        width: 100%;
    }

    .app__header {
        display: flex;
        align-items: baseline;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .app__title {
        font-size: 2rem;
        letter-spacing: 0.4em;
        color: var(--neon-cyan);
        text-shadow:
            0 0 10px var(--neon-cyan),
            0 0 30px rgba(0, 255, 255, 0.4);
        font-weight: 400;
    }

    .app__sub {
        font-size: 0.75rem;
        letter-spacing: 0.3em;
        color: var(--text-muted);
    }

    .app__body {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
    }

    .app__footer {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.65rem;
        letter-spacing: 0.3em;
        color: var(--text-muted);
        opacity: 0.5;
    }
</style>

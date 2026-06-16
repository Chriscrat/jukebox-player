<template>
    <div class="overlay" @click="handleStart">
        <div class="overlay__content">
            <div class="overlay__glitch">JUKEBOX</div>
            <p class="overlay__sub">tap to start</p>
            <div class="overlay__pulse" />
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ start: [] }>()

function handleStart(): void {
    emit('start')
}
</script>

<style scoped>
.overlay {
    position: fixed;
    inset: 0;
    background: #010106;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
}

.overlay__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.overlay__glitch {
    font-size: clamp(3rem, 10vw, 6rem);
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    color: var(--neon-cyan);
    text-shadow:
        0 0 10px var(--neon-cyan),
        0 0 30px var(--neon-cyan),
        0 0 60px var(--neon-cyan);
    letter-spacing: 0.3em;
    animation: flicker 4s infinite;
}

.overlay__sub {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    color: var(--neon-magenta);
    font-size: 1.1rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    text-shadow: 0 0 8px var(--neon-magenta);
    animation: blink 1.2s step-end infinite;
}

.overlay__pulse {
    width: 60px;
    height: 60px;
    border: 2px solid var(--neon-cyan);
    border-radius: 50%;
    box-shadow: 0 0 12px var(--neon-cyan);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes flicker {
    0%, 95%, 100% { opacity: 1; }
    96% { opacity: 0.4; }
    97% { opacity: 1; }
    98% { opacity: 0.2; }
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.3); opacity: 1; }
}
</style>

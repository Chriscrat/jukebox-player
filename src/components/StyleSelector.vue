<template>
    <section class="style-selector">
        <span class="style-selector__label">STYLE</span>
        <div class="style-selector__list">
            <button
                v-for="style in styles"
                :key="style.id"
                :class="['style-btn', { 'style-btn--active': activeStyleId === style.id }]"
                @click="emit('apply-style', style.id)"
            >
                {{ style.label }}
            </button>
            <button class="style-btn style-btn--reset" @click="emit('reset-style')">
                RESET
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useStyles } from '../composables/use-styles'
import type { StyleId } from '../types/audio'

const { styles, activeStyleId } = useStyles()

const emit = defineEmits<{
    'apply-style': [id: StyleId]
    'reset-style': []
}>()
</script>

<style scoped>
.style-selector {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.75rem 1rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
}

.style-selector__label {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
}

.style-selector__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.style-btn {
    background: transparent;
    border: 1px solid rgba(0, 255, 255, 0.2);
    color: var(--text-muted);
    font-family: inherit;
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
    transition:
        color 0.15s,
        border-color 0.15s,
        box-shadow 0.15s,
        background 0.15s;
}

.style-btn:hover {
    color: var(--neon-cyan);
    border-color: rgba(0, 255, 255, 0.5);
}

.style-btn--active {
    color: var(--neon-cyan);
    border-color: var(--neon-cyan);
    background: rgba(0, 255, 255, 0.06);
    box-shadow:
        0 0 8px rgba(0, 255, 255, 0.3),
        inset 0 0 8px rgba(0, 255, 255, 0.05);
}

.style-btn--reset {
    border-color: rgba(255, 0, 255, 0.2);
    color: rgba(255, 0, 255, 0.45);
    margin-left: 0.25rem;
}

.style-btn--reset:hover {
    color: var(--neon-magenta);
    border-color: rgba(255, 0, 255, 0.5);
}
</style>

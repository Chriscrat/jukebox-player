<template>
    <section class="style-selector">
        <span class="style-selector__label">STYLE</span>
        <div class="style-selector__list">
            <button
                v-for="style in styles"
                :key="style.id"
                :class="['style-btn', { 'style-btn--active': activePresetId === style.id }]"
                @click="emit('apply-style', style.id)"
            >
                {{ style.name }}
            </button>
            <div v-if="ambiances && activePresetId" class="ambiance-selector__list">
                <span class="ambiance-selector__label">AMBIANCE</span>
                <button
                    v-for="ambiance in ambiances"
                    :key="ambiance.id"
                    :class="['ambiance-btn', { 'style-btn--active': activeAmbianceId === ambiance.id }]"
                    @click="emit('apply-style', activePresetId, ambiance.id)"
                >
                    {{ ambiance.name }}
                </button>
                <button class="style-btn style-btn--reset" @click="emit('reset-style')">
                    RESET
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStyles } from '../composables/use-styles'
const { styles, activePresetId, activeAmbianceId } = useStyles()

const ambiances = computed(() =>
    activePresetId.value ? styles.find(s => s.id === activePresetId.value)?.ambiances : []
)

const emit = defineEmits<{
    (event: 'apply-style', presetId: string, ambianceId?: string | null): void
    (event: 'reset-style'): void
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

.style-selector__label,
.ambiance-selector__label  {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
}

.style-selector__list,
.ambiance-selector__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.ambiance-selector__list {
    align-items: center;
    margin-left: 4rem;
}

.style-btn,
.ambiance-btn {
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

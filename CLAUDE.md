# Groovebox — CLAUDE.md

## Stack
Vue 3 + TypeScript + Vite + Tone.js + Pinia

## Objectif V1
Séquenceur 16 steps browser-only, sampler-based (.wav),
aesthetic dark/minimal synth. Pas de backend.

## Règles audio
- Toute interaction Tone.js est dans les composables — jamais dans les composants
- useSampler = chargement + déclenchement d'UN instrument
- useSequencer = loop Tone.js uniquement, délègue le son à useSampler
- Ne pas mélanger scheduling et UI dans le même fichier

## Règles de state
- useSequencerStore : steps[], bpm, isPlaying
- useSynthStore : theme actif, instruments chargés
- Les composants ne lisent que le store — jamais d'état local dupliqué

## Conventions
- Appliquer vue-standards (script setup, Composition API, pas de mutation de props)
- InstrumentConfig est la source de vérité d'un instrument
- Un thème = un fichier dans src/presets/themes/

## Commandes
- npm dev
- npm build
- npm test:unit
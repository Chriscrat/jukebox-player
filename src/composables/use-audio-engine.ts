import { watch, onUnmounted } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import { STYLE_PRESETS } from './use-styles'
import type { MelodicSynthConfig, OscillatorType, StyleSynthConfig, TrackId } from '../types/audio'

type MelodicSynthNode = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.PolySynth
type SynthNode = Tone.MembraneSynth | Tone.MetalSynth | MelodicSynthNode

interface TrackSynth {
    id: TrackId
    synth: SynthNode
}

export function useAudioEngine() {
    const store = useSequencerStore()

    let reverb: Tone.Reverb | null = null
    let delay: Tone.FeedbackDelay | null = null
    let sequence: Tone.Sequence<number> | null = null
    const synths: TrackSynth[] = []

    const DEFAULT_SYNTH_CONFIG: StyleSynthConfig = {
        kick:  { pitchDecay: 0.07, octaves: 6,  envelope: { attack: 0.001, decay: 0.30, sustain: 0,   release: 0.10 } },
        snare: { harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, envelope: { attack: 0.001, decay: 0.15, release: 0.05 } },
        bass:  { synthType: 'synth', envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.30 } },
        lead:  { synthType: 'synth', envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.50 } },
    }

    /** Fallback notes used when no style preset is active. */
    const DEFAULT_NOTE_MAP: Record<TrackId, string> = {
        kick: 'C1',
        snare: 'C2',
        bass: 'C2',
        lead: 'C4',
    }

    /** Reads `activeStyleId` from the store and returns the matching preset's synth config, falling back to `DEFAULT_SYNTH_CONFIG`. */
    function resolveSynthConfig(): StyleSynthConfig {
        const styleId = store.state.activeStyleId
        if (!styleId) return DEFAULT_SYNTH_CONFIG
        const preset = STYLE_PRESETS.find((p) => p.id === styleId)
        return preset?.synthConfig ?? DEFAULT_SYNTH_CONFIG
    }

    /**
     * Reads `activeStyleId` from the store and returns the matching preset's note map.
     * Falls back to `DEFAULT_NOTE_MAP` when no style is active or the id is unrecognised.
     */
    function resolveNoteMap(): Record<TrackId, string> {
        const styleId = store.state.activeStyleId
        if (!styleId) return DEFAULT_NOTE_MAP
        const preset = STYLE_PRESETS.find((p) => p.id === styleId)
        return preset?.notes ?? DEFAULT_NOTE_MAP
    }

    /** Factory that instantiates the correct Tone.js synth class (Synth / FMSynth / AMSynth / PolySynth) from a MelodicSynthConfig. */
    function createMelodicSynth(config: MelodicSynthConfig, oscillatorType: OscillatorType): MelodicSynthNode {
        const { synthType, envelope } = config
        switch (synthType) {
            case 'fm':
                return new Tone.FMSynth({ oscillator: { type: oscillatorType }, envelope })
            case 'am':
                return new Tone.AMSynth({ oscillator: { type: oscillatorType }, envelope })
            case 'poly':
                return new Tone.PolySynth(Tone.Synth, { oscillator: { type: oscillatorType }, envelope })
            default:
                return new Tone.Synth({ oscillator: { type: oscillatorType }, envelope })
        }
    }

    /** Creates reverb and delay effects and connects them to the master output. Called once at audio init. */
    function buildEffects(): void {
        reverb = new Tone.Reverb({
            decay: 2.5,
            wet: store.state.effects.reverbWet,
        })
        reverb.toDestination()

        delay = new Tone.FeedbackDelay({
            delayTime: '8n',
            feedback: 0.3,
            wet: store.state.effects.delayWet,
        })
        delay.toDestination()
    }

    function buildSynths(): void {
        const sc = resolveSynthConfig()
        const tracks = store.state.tracks

        const kickSynth = new Tone.MembraneSynth({
            pitchDecay: sc.kick.pitchDecay,
            octaves: sc.kick.octaves,
            envelope: sc.kick.envelope,
        })
        kickSynth.volume.value = Tone.gainToDb(tracks[0].params.volume)
        kickSynth.toDestination()

        const snareSynth = new Tone.MetalSynth({
            harmonicity: sc.snare.harmonicity,
            modulationIndex: sc.snare.modulationIndex,
            resonance: sc.snare.resonance,
            octaves: sc.snare.octaves,
            envelope: sc.snare.envelope,
        })
        snareSynth.volume.value = Tone.gainToDb(tracks[1].params.volume)
        snareSynth.connect(reverb!)

        const bassSynth = createMelodicSynth(sc.bass, tracks[2].params.oscillatorType)
        bassSynth.volume.value = Tone.gainToDb(tracks[2].params.volume)
        bassSynth.connect(delay!)

        const leadSynth = createMelodicSynth(sc.lead, tracks[3].params.oscillatorType)
        leadSynth.volume.value = Tone.gainToDb(tracks[3].params.volume)
        leadSynth.connect(reverb!)

        synths.push(
            { id: 'kick', synth: kickSynth },
            { id: 'snare', synth: snareSynth },
            { id: 'bass', synth: bassSynth },
            { id: 'lead', synth: leadSynth },
        )
    }

    /** Disposes existing synths and rebuilds them from the current style config. Effects are preserved. */
    function rebuildSynths(): void {
        synths.forEach(({ synth }) => synth.dispose())
        synths.length = 0
        buildSynths()
    }

    function buildSequence(): void {
        const steps = Array.from({ length: 16 }, (_, i) => i)

        sequence = new Tone.Sequence(
            (time, step) => {
                store.setCurrentStep(step as number)

                const noteMap = resolveNoteMap()
                store.state.tracks.forEach((track) => {
                    if (!track.steps[step as number].active) return
                    const entry = synths.find((s) => s.id === track.id)
                    if (!entry) return
                    const note = noteMap[track.id]
                    const dur = `${track.params.decay}n` as Tone.Unit.Time
                    try {
                        entry.synth.triggerAttackRelease(note, dur, time)
                    } catch {
                        // synth may not be ready yet
                    }
                })
            },
            steps,
            '16n',
        )
    }

    async function startAudio(): Promise<void> {
        try {
            await Tone.start()
            store.setAudioReady(true)
            buildEffects()
            buildSynths()
            buildSequence()
            Tone.getTransport().bpm.value = store.state.bpm
        } catch (err) {
            console.error('AudioContext init failed:', err)
        }
    }

    async function play(): Promise<void> {
        if (!store.state.isAudioReady) return
        try {
            sequence?.start(0)
            Tone.getTransport().start()
            store.setPlaying(true)
        } catch (err) {
            console.error('Play failed:', err)
        }
    }

    function stop(): void {
        try {
            Tone.getTransport().stop()
            sequence?.stop()
            store.setCurrentStep(-1)
            store.setPlaying(false)
        } catch (err) {
            console.error('Stop failed:', err)
        }
    }

    function disposeAll(): void {
        try {
            stop()
            sequence?.dispose()
            synths.forEach(({ synth }) => synth.dispose())
            reverb?.dispose()
            delay?.dispose()
            synths.length = 0
            sequence = null
            reverb = null
            delay = null
        } catch (err) {
            console.error('Dispose failed:', err)
        }
    }

    watch(
        () => store.state.bpm,
        (bpm) => {
            Tone.getTransport().bpm.value = bpm
        },
    )

    watch(
        () => store.state.effects.reverbWet,
        (wet) => {
            if (reverb) reverb.wet.value = wet
        },
    )

    watch(
        () => store.state.effects.delayWet,
        (wet) => {
            if (delay) delay.wet.value = wet
        },
    )

    watch(
        () => store.state.tracks[2].params.volume,
        (vol) => {
            const entry = synths.find((s) => s.id === 'bass')
            if (entry) entry.synth.volume.value = Tone.gainToDb(vol)
        },
    )

    watch(
        () => store.state.tracks[3].params.volume,
        (vol) => {
            const entry = synths.find((s) => s.id === 'lead')
            if (entry) entry.synth.volume.value = Tone.gainToDb(vol)
        },
    )

    watch(
        () => store.state.activeStyleId,
        () => {
            if (!store.state.isAudioReady) return
            rebuildSynths()
        },
    )

    onUnmounted(() => {
        disposeAll()
    })

    return { startAudio, play, stop }
}

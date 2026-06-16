import { watch, onUnmounted } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import type { TrackId } from '../types/audio'

type SynthNode =
    | Tone.MembraneSynth
    | Tone.MetalSynth
    | Tone.Synth
    | Tone.Synth

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

    function buildSynths(): void {
        reverb = new Tone.Reverb({
            decay: 2.5,
            wet: store.state.effects.reverbWet,
        })

        delay = new Tone.FeedbackDelay({
            delayTime: '8n',
            feedback: 0.3,
            wet: store.state.effects.delayWet,
        })

        const kickSynth = new Tone.MembraneSynth({
            pitchDecay: 0.07,
            octaves: 6,
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
        })
        kickSynth.volume.value = Tone.gainToDb(store.state.tracks[0].params.volume)
        kickSynth.toDestination()

        const snareSynth = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        })
        snareSynth.volume.value = Tone.gainToDb(store.state.tracks[1].params.volume)
        snareSynth.connect(reverb)
        reverb.toDestination()

        const bassSynth = new Tone.Synth({
            oscillator: { type: store.state.tracks[2].params.oscillatorType },
            envelope: { attack: 0.01, decay: store.state.tracks[2].params.decay, sustain: 0.2, release: 0.3 },
        })
        bassSynth.volume.value = Tone.gainToDb(store.state.tracks[2].params.volume)
        bassSynth.connect(delay)
        delay.toDestination()

        const leadSynth = new Tone.Synth({
            oscillator: { type: store.state.tracks[3].params.oscillatorType },
            envelope: { attack: 0.01, decay: store.state.tracks[3].params.decay, sustain: 0.3, release: 0.5 },
        })
        leadSynth.volume.value = Tone.gainToDb(store.state.tracks[3].params.volume)
        leadSynth.connect(reverb)

        synths.push(
            { id: 'kick', synth: kickSynth },
            { id: 'snare', synth: snareSynth },
            { id: 'bass', synth: bassSynth },
            { id: 'lead', synth: leadSynth },
        )
    }

    const NOTE_MAP: Record<TrackId, string> = {
        kick: 'C1',
        snare: 'C2',
        bass: 'C2',
        lead: 'C4',
    }

    function buildSequence(): void {
        const steps = Array.from({ length: 16 }, (_, i) => i)

        sequence = new Tone.Sequence(
            (time, step) => {
                store.setCurrentStep(step as number)

                store.state.tracks.forEach((track) => {
                    if (!track.steps[step as number].active) return
                    const entry = synths.find((s) => s.id === track.id)
                    if (!entry) return
                    const note = NOTE_MAP[track.id]
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

    onUnmounted(() => {
        disposeAll()
    })

    return { startAudio, play, stop }
}

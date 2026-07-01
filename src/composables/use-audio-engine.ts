import { watch, onUnmounted } from 'vue'
import * as Tone from 'tone'
import { useSequencerStore } from '../store/sequencer'
import { STYLE_PRESETS } from '../presets';
import type { Instrument, InstrumentId } from '../types/audio'

interface LoadedInstrument {
    id: string
    sampler: Tone.Sampler
    config: Instrument<InstrumentId, string>
}

export function useAudioEngine() {
    const store = useSequencerStore()

    let reverb: Tone.Reverb | null = null
    let delay: Tone.FeedbackDelay | null = null
    let sequence: Tone.Sequence<number> | null = null
    const instruments: LoadedInstrument[] = []

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

    function resolveInstrumentConfigs(): Instrument<InstrumentId>[] {
        const preset = STYLE_PRESETS.find((p) => p.id === store.state.activePresetId)
        const ambiance = preset?.ambiances.find((a) => a.id === store.state.activeAmbianceId)
        const instruments = ambiance?.tracks.map(track => track.instrument)
        return instruments ?? []
    }

    async function loadInstruments(): Promise<void> {
        const configs = resolveInstrumentConfigs()
        await Promise.all(
            configs.map(
                (config) =>
                    new Promise<void>((resolve) => {
                        const sampler = new Tone.Sampler(config.samples, {
                            onload: resolve,
                        })
                        sampler.volume.value = config.volume
                        sampler.toDestination()
                        instruments.push({ id: config.id, sampler, config })
                    }),
            ),
        )
    }

    function disposeInstruments(): void {
        instruments.forEach(({ sampler }) => sampler.dispose())
        instruments.length = 0
    }

    async function reloadInstruments(): Promise<void> {
        disposeInstruments()
        await loadInstruments()
    }

    function buildSequence(): void {
        const steps = Array.from({ length: 16 }, (_, i) => i)

        sequence = new Tone.Sequence(
            (time, step) => {
                store.setCurrentStep(step as number)

                store.state.sequences.forEach((seq) => {
                    const stepData = seq.steps[step as number]
                    if (!stepData.active) return

                    const entry = instruments.find((inst) => inst.id === seq.instrumentId)

                    if (!entry) return

                    const note = stepData.note ?? entry.config.defaultNote
                    // decay is a 0–1 fraction of maxDuration
                    const dur = Tone.Time(entry.config.maxDuration).toSeconds() * seq.decay
                    entry.sampler.volume.value = seq.volume

                    try {
                        if (entry.config.retrigger) {
                            entry.sampler.triggerAttackRelease(note, dur, time)
                        } else {
                            entry.sampler.triggerAttack(note, time)
                        }
                    } catch {
                        // sampler may still be loading
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
            await loadInstruments()
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
            disposeInstruments()
            reverb?.dispose()
            delay?.dispose()
            sequence = null
            reverb = null
            delay = null
        } catch (err) {
            console.error('Dispose failed:', err)
        }
    }

    watch(
        () => store.state.bpm,
        (bpm) => { Tone.getTransport().bpm.value = bpm },
    )

    watch(
        () => store.state.effects.reverbWet,
        (wet) => { if (reverb) reverb.wet.value = wet },
    )

    watch(
        () => store.state.effects.delayWet,
        (wet) => { if (delay) delay.wet.value = wet },
    )

    watch(
        () => store.state.activeAmbianceId,
        async () => {
            if (!store.state.isAudioReady) return
            await reloadInstruments()
        },
    )

    onUnmounted(() => {
        disposeAll()
    })

    return { startAudio, play, stop }
}

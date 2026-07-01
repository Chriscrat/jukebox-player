import type { StylePreset } from '../../types/audio';

import { skrillex } from './skrillex';
import { raptor } from './raptor';

export const DUBSTEP_PRESETS: StylePreset = {
    id: 'dubstep',
    name: 'Dubstep',
    bpm: 100,
    effects: { reverbWet: 0.5, delayWet: 0.6 },
    ambiances: [
        skrillex,
        raptor
    ],
};

import type { StylePreset } from '../../types/audio';

import { raptor } from './raptor';

export const DUBSTEP_PRESETS: StylePreset = {
    id: 'dubstep',
    name: 'Dubstep',
    bpm: 70,
    effects: { reverbWet: 0.5, delayWet: 0.6 },
    ambiances: [
        raptor
    ],
};

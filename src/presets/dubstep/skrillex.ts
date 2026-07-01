import type { Ambiance, Instrument, Track } from '../../types/audio';

// INSTRUMENTS
const lead: Instrument<'lead', 'D#6' | 'G#2'>  = {
    id: 'lead',
    name: 'Lead',
    samples: {
        'D#6': '/samples/dubstep/raptor/lead/Cymatics - Titan Synth One Shot 17 - Dsharp6.wav',
        'G#2': '/samples/dubstep/raptor/lead/Cymatics - Titan Synth One Shot 71 - Gsharp2.wav',
    },
    defaultNote: 'D#6',
    retrigger: true,
    maxDuration: '4n',
    volume: -3,
};

const fx: Instrument<'fx', 'D#5' | 'A#4'> = {
    id: 'fx',
    name: 'FX',
    samples: {
        'D#5': '/samples/dubstep/skrillex/fx/Woop Sound - Dsharp5.wav',
        'A#4': '/samples/dubstep/skrillex/fx/Skrillex Clean Voice.wav',
    },
    defaultNote: 'D#5',
    retrigger: true,
    maxDuration: '1n',
    volume: 0,
};

const growl: Instrument<'growl'> = {
    id: 'growl',
    name: 'Growl',
    samples: {
        'G#1': '/samples/dubstep/skrillex/growl/Dubstep Growl - Gsharp1.wav',
    },
    defaultNote: 'G#1',
    retrigger: true,
    maxDuration: '4n',
    volume: -3,
};

const bass: Instrument<'bass'> = {
    id: 'bass',
    name: 'Bass',
    samples: {
        'F#2': '/samples/dubstep/skrillex/bass/Cymatics - Mothership Bass One Shot 12 - Fsharp.wav',
    },
    defaultNote: 'F#2',
    retrigger: true,
    maxDuration: '4n',
    volume: 0,
};

const kick: Instrument<'kick'> = {
    id: 'kick',
    name: 'Kick',
    samples: {
        'D#4': '/samples/dubstep/raptor/kick/Dubstep Kick 3 Mellow.wav',
    },
    defaultNote: 'D#4',
    retrigger: true,
    maxDuration: '8n',
    volume: -3,
};

const snare: Instrument<'snare'> = {
    id: 'snare',
    name: 'Snare',
    samples: {
        'G#3': '/samples/dubstep/raptor/snare/Electronic Snare Drum 3 by IanStarGem  - Gsharp3.wav',
    },
    defaultNote: 'G#3',
    retrigger: true,
    maxDuration: '8n',
    volume: -3,
};

const openHat: Instrument<'open-hat'> = {
    id: 'open-hat',
    name: 'Open hat',
    samples: {
        F8: '/samples/dubstep/raptor/hi-hats/open-hat - F8.wav',
    },
    defaultNote: 'F8',
    retrigger: true,
    maxDuration: '8n',
    volume: 1,
};

const closedHat: Instrument<'closed-hat'> = {
    id: 'closed-hat',
    name: 'Closed hat',
    samples: {
        'F#9': '/samples/dubstep/raptor/hi-hats/closed-hat - Fsharp9.wav',
    },
    defaultNote: 'F#9',
    retrigger: true,
    maxDuration: '8n',
    volume: 1,
};

// TRACKS
const fxTrack: Track<'fx'> = {
    instrument: fx,
    muted: false,
    solo: false,
    events: [
        {
            step: 2,
            note: 'D#5'
        },
        {
            step: 3,
            note: 'A#4'
        },
        {
            step: 6,
            note: 'D#5'
        },
        {
            step: 7,
            note: 'D#5'
        },
        {
            step: 11,
            note: 'D#5'
        },
        {
            step: 12,
            note: 'D#5'
        },
        {
            step: 14,
            note: 'D#5'
        }
    ],
};

const bassTrack: Track<'bass'> = {
    instrument: bass,
    muted: false,
    solo: false,
    events: [
        { step: 5 },
        { step: 8 },
        { step: 11 }
    ],
};

const growlTrack: Track<'growl'> = {
    instrument: growl,
    muted: false,
    solo: false,
    events: [
        { step: 2 },
        { step: 10 }
    ],
};

const kickTrack: Track<'kick'> = {
    instrument: kick,
    muted: false,
    solo: false,
    events: [
        { step: 0 },
        { step: 8 },
        { step: 15 },
    ],
};

const snareTrack: Track<'snare'> = {
    instrument: snare,
    muted: false,
    solo: false,
    events: [
        { step: 4 },
        { step: 12 },
    ],
};

const openHatTrack: Track<'open-hat'> = {
    instrument: openHat,
    muted: false,
    solo: false,
    events: [
        { step: 1 },
        { step: 3 },
        { step: 5 },
        { step: 7 },
        { step: 9 },
        { step: 11 },
        { step: 13 },
        { step: 15 },
    ],
};

const closedHatTrack: Track<'open-hat'> = {
    instrument: openHat,
    muted: false,
    solo: false,
    events: [
        { step: 0 },
        { step: 2 },
        { step: 4 },
        { step: 6 },
        { step: 8 },
        { step: 10 },
        { step: 12 },
        { step: 14 },
    ],
};

export const skrillex: Ambiance = {
    id: 'skrillex',
    name: 'Skrillex',
    steps: 16,
    tracks: [
        fxTrack,
        growlTrack,
        bassTrack,
        kickTrack,
        snareTrack,
        openHatTrack,
        closedHatTrack
    ],
};

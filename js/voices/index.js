// en-us
import {lcc} from "./people/lcc.js";
import {ol} from "./people/ol.js";
import {mv} from "./people/mv.js";
import {scr} from "./people/scr.js";
import {tm} from "./people/tm.js";
// pt-pt
import {ab} from "./people/ab.js";
import {cc} from "./people/cc.js";
import {cs} from "./people/cs.js";
import {fm} from "./people/fm.js";
import {gm} from "./people/gm.js";
import {md} from "./people/md.js";
import {rcb} from "./people/rcb.js";
import {rc} from "./people/rc.js";
import {sc} from "./people/sc.js";
import {tc} from "./people/tc.js";
import {td} from "./people/td.js";
import {vc} from "./people/vc.js";

let people = [];

let voices = {};

function resetPeople() {
    people = [
        {
            id: 'rand',
            name: 'Random'
        }
    ]
}

function resetVoices() {
    voices = {
        'NEW_SESSION': [],
        'NEW_SESSION_SQ1': [],
        'PYR_SESSION': [],
        '555_SESSION': [],
        'FEET_SESSION': [],
        'FMC_SESSION': [],
        'CLK_SESSION': [],
        'SKB_SESSION': [],
        'INSPECTION_8': [],
        'INSPECTION_12': [],
        'INSPECTION_17': [],
        'SOLVES_12': [],
        'SOLVES_50': [],
        'SOLVES_88': [],
        'SOLVES_100': [],
        'SOLVES_500': [],
        'SOLVES_888': [],
        'SOLVES_1000': [],
        'SOLVES_5K': [],
        'SOLVES_10K': [],
        'SOLVES_100K': [],
        'SECONDS_888': [],
        'SECONDS_555': [],
        'SECONDS_474': [],
        'NEW_PB': [],
        'NEW_PBAVG5': [],
        'NEW_PBAVG12': [],
        'WCA_WR': [],
        'WCA_CR': [],
        'WCA_NR': [],
        '+2': [],
        'DNF': [],
        'THEME_BIOCUBE': [],
        'THEME_SUZANE': [],
        'FIRST_2021': []
    };
}

function setup(code) {
    people.map(function(person, i) {
        let triggers = {};
        if ('triggers' in person) {
            let events = Object.entries(person.triggers);
            events.forEach(function(event) {
                let audio = event[1];
                event = event[0];
                if (event in voices) {
                    voices[event].push({
                        id: person.id,
                        audio: audio
                    });
                    triggers[event] = voices[event].length - 1;
                }
            })
        }
        if ('codes' in person) {
            let codeTriggers = Object.entries(person.codes);
            codeTriggers.map(function(addon) {
                addon = addon[1];
                if(code.hasCode(addon.code)) {
                    let events = Object.entries(addon.triggers);
                    events.forEach(function(event) {
                        let audio = event[1];
                        event = event[0];
                        if (event in triggers) {
                            let index = triggers[event];
                            voices[event][index]['audio'] = audio;
                        } else {
                            voices[event].push({
                                id: person.id,
                                audio: audio
                            });
                        }
                    })
                }
            });
        }
    });
}

let voicesByLang = {
    'en-us': [lcc, ol, mv, scr, tm],
    'pt-pt': [ab, cc, cs, fm, gm, md, rc, rcb, sc, tc, td, vc]
}

export function index(languages, code) {
    let lang = kernel.getProp('lang');
    resetPeople();
    resetVoices();
    if (!kernel.getProp('enableVoicesInt')) {
        if (lang in voicesByLang) {
            people = people.concat(voicesByLang[lang]);
        } else {
            return {
                people: [],
                voices: []
            }
        }
    } else {
        languages.map(function(language) {
           if (language.lang in voicesByLang) {
               if (kernel.getProp(language.prop) || language.lang == lang) {
                   people = people.concat(voicesByLang[language.lang]);
               }
           }
        });
    }
    setup(code);
    return {
        people: people,
        voices: voices
    }
}
import {events} from "./events.js";
import {index} from "./index.js";

let plusVoices;
let cooldown = false;

function voiceIndex(type) {
    if (type in plusVoices.voices) {
        return plusVoices.voices[type];
    }
    return [];
}

let lastPerson = false;
let customVoice = false;

function getVoice(type) {
    let check = Boolean(kernel.getProp('plusIns'));
    if (check) {
        let p = lastPerson && (type == 'INSPECTION_12' || type == 'INSPECTION_17') ? lastPerson : kernel.getProp('plusIns');
        let people = voiceIndex(type);
        if (p == 'rand') {
            for (let i = people.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [people[i], people[j]] = [people[j], people[i]];
            }
        } else {
            people = people.filter((person) => person.id == p);
        }
        if (people.length > 0) {
            cooldown = true;
            let person = people[0];
            lastPerson = person.id;
            let audio = person.audio;
            let shorterVoices = Boolean(kernel.getProp('shorterIns'));
            if ('short' in audio && 'normal' in audio) {
                if (shorterVoices) {
                    audio = audio.short;
                } else {
                    audio = audio.normal;
                }
            }
            if (Array.isArray(audio)) {
                customVoice = audio[Math.floor(Math.random() * audio.length)];
            } else {
                customVoice = audio;
            }
            customVoice.volume = kernel.getProp('voiceVol') / 100;
            customVoice.play();
            $(document).trigger('voice_played', [type]);
            setTimeout(function() {
                cooldown = false;
            }, 3500);
        }
    }
}

function usingPerson(id) {
    if (kernel.getProp('voiceIns') == 'n' && Boolean(kernel.getProp('plusIns'))) {
        let match = id == kernel.getProp('plusIns');
        if (match) {
            setTimeout(function() {
                $('select[name=voiceIns] option').removeAttr('selected').filter('[data-voice='+id+']').attr('selected', true);
            },10);
        }
    }
}

function addPeople(plusLang = {}) {
    plusVoices.people.map(name => {
        usingPerson(name.id);
        let check = Boolean($('option[data-voice='+name.id+']').length);
        if (check) return;
        if ('PLUS_RANDOM' in plusLang && name.name == 'Random') name.name = plusLang.PLUS_RANDOM;
        $('select[name=voiceIns]').append('<option value="n" data-voice="'+name.id+'">'+name.name+'</option>');
    })
}

let enables = [];

function intVoices(plusLang, code) {
    let inputs = $('input[name^="enableVoices"]:not([name="enableVoicesInt"])');
    let enabled = kernel.getProp('enableVoicesInt');
    let scrolled = $('.noScrollBar:not(.helptable)').scrollTop();
    if (typeof enabled === 'undefined') {
        kernel.setProp('enableVoicesInt', true);
        enabled = true;
    }
    if (enabled && inputs.length == 0) {
        enables.map(function (enable) {
            if (enable.lang == kernel.getProp('lang')) return;
            kernel.regProp('timer', enable.prop, 0, enable.text, [enable.set]);
        });
        kernel.reprop();
        setTimeout(function() {
            $('.noScrollBar').scrollTop(scrolled);
        }, 50);
    } else if (!enabled) {
        $.each(inputs, function(k, input) {
            $(input).parents('tr')[0].remove();
        });
    }
    plusVoices = index(enables, code);
    $('option[data-voice]').remove();
    addPeople(plusLang);
}

export function voices(lang, code) {
    let csLang = kernel.getProp('lang');
    let plusLang = lang();
    enables.push(
        {
            prop: 'enableVoicesEn',
            text: plusLang.PLUS_ENABLE_VOICES_EN,
            set: true,
            lang: 'en-us'
        },
        {
            prop: 'enableVoicesPt',
            text: plusLang.PLUS_ENABLE_VOICES_PT,
            set: csLang == 'pt-pt',
            lang: 'pt-pt'
        }
    );
    events(plusLang);
    function procSignal(signal, value) {
        if (value[2] == 'modify') {
            intVoices(plusLang, code);
        }
    }
    kernel.regListener('internationalVoices', 'property', procSignal, /^enableVoices[\w]+$/);
    kernel.regProp('timer', 'enableVoicesInt', 0, plusLang.PLUS_ENABLE_VOICES_INT, [true]);
    intVoices(plusLang, code);
    $(document).on('voice', (e, type) => {
        if (cooldown) return false;
        getVoice(type);
    });
    $(document).on('addPeople', (e) => {
        return addPeople(plusLang);
    });
    $(window).on('keydown', (e) => {
        if (e.keyCode === 27 && customVoice) {
            customVoice.pause();
            customVoice.currentTime = 0;
            customVoice = false;
        }
    });
    $('body').on('change', 'select[name=voiceIns]', function() {
        let option = $(this).find('option:selected');
        if (option.data().hasOwnProperty('voice')) {
            kernel.setProp('plusIns', option.data('voice'));
        } else {
            kernel.setProp('plusIns', false);
        }
    });
}
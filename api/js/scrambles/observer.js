let scrLen;

let scrLenPresets;

let original = false;

function setScramblePreset() {
    let preset = kernel.getProp('session')+'-'+tools.getCurScramble()[0];
    let dialogWindow = $('body > div:eq(3)');
    let dialogBack = $('#gray');
    dialogBack.addClass('forceHide');
    dialogWindow.wrap('<div class="forceHide"></div>');
    setTimeout(function() {
        $('#scrambleDiv input[type=button].icon').click();
        scrLen = $('.dialogscropt input[maxlength=3]');
        if (preset in scrLenPresets) {
            scrLen.val(Math.abs(scrLenPresets[preset]));
            scrLen.trigger('change');
        } else {
            let selected = scrdata[$('#scrambleDiv select:eq(0)').val()][1].filter(function(scr) {
                return scr.length == 3 && scr[1] == tools.getCurScramble()[0];
            });
            if (selected.length == 1) {
                scrLen.val(Math.abs(selected[0][2]));
                scrLen.trigger('change');
            }
        }
        dialogBack.click();
        setTimeout(function() {
            dialogBack.removeClass('forceHide');
            dialogWindow.unwrap();
            $(document).trigger('dialogs_enabled');
        }, 100);
    }, 200);
}

function interactiveScramble() {
    let scramble = $('#scrambleTxt').find('div').html();
    if ($('#scrambleTxt').find('.partial').length != 0 || $('#scrambleTxt').find('.multi').length != 0) return false;
    if (scramble != 'Scrambling...') {
        let scramble = tools.getCurScramble();
        let isRelay = Boolean(scrdata[36][1].filter((relay) => relay[1] == scramble[0]).length);
        let isMBLD = Boolean(scramble[0] == 'r3ni');
        if (isRelay || isMBLD) {
            $("#scrambleTxt > div").html($("#scrambleTxt > div").text().replace(/(.*[^\n])/gm, `<span class='multi' data-multi>$1</span>`));
        } else {
            let hasImage = typeof(tools.puzzleType(scramble[0])) !== 'undefined';
            if (hasImage) $("#scrambleTxt > div").html($("#scrambleTxt > div").text().replace(/([^\s]+)/gm, `<span class='partial' data-partial>$1</span>`));
        }
    }
}

function multiScramble(plusLang = {}) {
    let text = $($('#toolsDiv').find('div')[0]).find('div').text();
    let scramble = tools.getCurScramble();
    let isRelay = Boolean(scrdata[36][1].filter((relay) => relay[1] == scramble[0]).length);
    let isMBLD = Boolean(scramble[0] == 'r3ni');
    if (text == IMAGE_UNAVAILABLE && (isRelay || isMBLD)) {
        let multiText = 'PLUS_MULTI_SCRAMBLE_HINT' in plusLang ? plusLang.PLUS_MULTI_SCRAMBLE_HINT : 'Click one of the scrambles to see its image!';
        $($('#toolsDiv').find('div')[0]).find('div').text(multiText);
    }
}

function getType(alias) {
    alias = alias.slice(0, -1);
    let scramble = JSON.parse(original);
    let isMBLD = Boolean(scramble[0] == 'r3ni');
    if (isMBLD) {
        return '333ni';
    } else if (scramble[0] == 'r3') {
        return '333';
    } else {
        switch(alias) {
            case '2':
            case 2:
                return '222so'
            case '3':
            case 'Ft':
            case 'OH':
            case 3:
                return '333'
            case '4':
            case 4:
                return '444'
            case '5':
            case 5:
                return '555'
            case '6':
            case 6:
                return '666'
            case '7':
            case 7:
                return '777'
            case 'Skb':
                return 'skbso'
            case 'Pyr':
                return 'pyrso'
            case 'Sqr':
                return 'sqrs'
            case 'Clk':
                return 'clkwca'
            case 'Mgm':
                return 'mgmp'
            default:
                return '333'
        }
    }
}

function resetMulti() {
    $('span[data-multi]').each(function() {
        if ($(this).data().hasOwnProperty('text') && $(this).hasClass('enhanced')) {
            $(this).removeClass('enhanced');
            $(this).html($(this).data('text'));
            kernel.pushSignal('scramble', JSON.parse(original));
            original = false;
        }
    });
}

export function observer(plusLang = {}) {
    scrLenPresets = kernel.getProp('plus_scrlens');
    if (!scrLenPresets) {
        kernel.setProp('plus_scrlens', JSON.stringify({}));
        scrLenPresets = {};
    } else {
        scrLenPresets = JSON.parse(scrLenPresets);
    }
    $(document).on('mouseover', 'span[data-partial]', function() {
        let isMulti = Boolean($('.enhanced').length);
        let type = tools.getCurScramble()[0];
        if (isMulti) type = $('.enhanced').data('type');
        $('span[data-partial]').removeClass('hl');
        $('span[data-partial]').removeClass('trail');
        $('span[data-partial]').removeClass('rest');
        $(this).addClass("hl");
        let index = $(this).index();
        let partial = '';
        for (let i = 0; i <= index; i++) {
            let trail = $('span[data-partial]').eq(i);
            if (!trail.hasClass('hl')) trail.addClass('trail');
            partial += $('span[data-partial]').eq(i).text() + ' ';
        }
        $('span[data-partial]:not(.hl,.trail)').addClass('rest');
        image.draw([type, partial]);
    });
    $(document).on('mouseleave', '#scrambleTxt', function() {
        $('span[data-partial]').removeClass('hl');
        $('span[data-partial]').removeClass('trail');
        $('span[data-partial]').removeClass('rest');
        image.draw(tools.getCurScramble());
    });
    $(document).on('click', 'span[data-multi]', function() {
        if ($(this).hasClass('enhanced')) return false;
        if (!original) original = JSON.stringify(tools.getCurScramble());
        let alias = /([^\)]+\))/.exec($(this).text());
        if (alias !== null) alias = alias[0];
        if (!$(this).data().hasOwnProperty('text')) {
            $(this).data('text', $(this).text());
            $(this).data('type', getType(alias));
        }
        $('span[data-multi]').each(function() {
            if ($(this).data().hasOwnProperty('text') && $(this).hasClass('enhanced')) {
                $(this).removeClass('enhanced');
                $(this).html($(this).data('text'));
            }
        });
        $(this).addClass('enhanced');
        let scramble = $(this).data('text').replace(/([^\)]+\)[\s]+)/, '');
        $(this).html(alias + ' ' + scramble.replace(/([^\s]+)/gm, `<span class='partial' data-partial>$1</span>`));
        kernel.pushSignal('scramble', [getType(alias), scramble]);
    });
    $(document).on('click', function(e){
        let target = $(e.target);
        if (!target.is(".multi")) {
            resetMulti();
        }
    });
    interactiveScramble();
    const scrText = document.getElementById('scrambleTxt');
    const config = { attributes: true, childList: true, subtree: true };
    let scrambleText = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                interactiveScramble();
            }
        }
    };
    const sObs = new MutationObserver(scrambleText);
    sObs.observe(scrText, config);
    multiScramble(plusLang);
    const toolsD = document.getElementById('toolsDiv');
    let toolsDiv = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                multiScramble(plusLang);
            }
        }
    };
    const tObs = new MutationObserver(toolsDiv);
    tObs.observe(toolsD, config);
    const avgDiv = document.getElementById('avgstr');
    let avgStr = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes') {
                resetMulti();
            }
        }
    };
    const aObs = new MutationObserver(avgStr);
    aObs.observe(avgDiv, config);
    if ($('.dialog.dialogshare').length > 0) {
        $('.dialogshare .buttonOK').one('click', setScramblePreset);
    } else {
        setScramblePreset();
    }
    $('#stats select:eq(0)').on('change', function() {
        setTimeout(function() {
            setScramblePreset();
        }, 100);
    });
    $(document).on('change', '.dialogscropt input[maxlength=3]', function() {
        scrLenPresets[kernel.getProp('session')+'-'+tools.getCurScramble()[0]] = $(this).val();
        kernel.setProp('plus_scrlens', JSON.stringify(scrLenPresets));
    });
}
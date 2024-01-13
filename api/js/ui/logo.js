import {dialog} from "./dialog.js";

function plus() {
    $('#logo').find('span').html('csTimer<small class="csplus">+</small>');
}

export function logo(plusLang = {}, code) {
    plus();
    const logo = document.getElementById('logo');
    const config = { attributes: true, childList: true, subtree: true };
    let logoChange = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let text = $('#logo').find('span').text();
                if (text == 'csTimer') plus();
            }
        }
    };
    const lObs = new MutationObserver(logoChange);
    lObs.observe(logo, config);
    $(document).bind('keypress', function(event) {
        if( event.which === 82 && event.shiftKey) {
            $('body').toggleClass('simple');
            if ($('body').hasClass('simple')) {
                $('#scrambleDiv').css({left: 0});
            } else {
                $('#scrambleDiv').css({left: '17.2rem'});
            }
        } else if(event.shiftKey && (event.which == 83 || event.which == 84 || event.which == 73)) {
            let input;
            switch (event.which) {
                case 83:
                    input = 's';
                    break;
                case 84:
                    input = 't';
                    break;
                case 73:
                    input = 'i';
                    break;
                default:
                    return;
            }
            setTimeout(function() {
                kernel.setProp('input', input);
            }, 100);
        } else if (event.shiftKey && event.which == 67) {
            dialog(plusLang.PLUS_REDEEM_CODE, "<form autocomplete='off' id='prize_code'><input type='text' name='redeem_code' style='width: calc(100% - 0.46rem);height: 10rem;font-size: 6rem;text-transform: uppercase;margin: 50px auto;'></form>",
                function() {
                    code.redeemCode($('input[name=redeem_code]').val());
                },
                undefined, false);
            setTimeout(function() {
                $('input[name=redeem_code]').focus();
            }, 50);
            $('body').off('submit', '#prize_code').on('submit', '#prize_code', function(e) {
                e.preventDefault();
                $(this).parents('.dialog').find('.buttonOK').trigger('click');
            });
        }
    });
}
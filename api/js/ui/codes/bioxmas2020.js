export let bioxmas2020 = {
    code: 'eb2db7312b2225a6fee4cf3806493056',
    info: {
        redeemableFrom: new Date(2020, 11, 1, 0, 0).getTime(),
        redeemableUntil: new Date(2020, 11, 23, 23, 59, 59).getTime(),
        freeFrom: new Date(2020, 11, 24, 0, 0).getTime(),
        expiresIn: new Date(2020, 11, 31, 23, 59, 59).getTime(),
        init: setSnow
    }
}

function setSnow() {
    $('<style>.snowflake{color:#fff;font-size:3em;font-family:Arial;text-shadow:0 0 1px #000}@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}100%{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%{transform:translateX(0)}50%{transform:translateX(80px)}100%{transform:translateX(0)}}.snowflake{position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:1s,1s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:1,1;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:1s,1s;animation-timing-function:linear,ease-in-out;animation-iteration-count:1,1;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}</style>').appendTo('head');
    $(document).on('voice_played', (e, type) => {
        if (kernel.getProp('current-theme') == 'plus-icecube' && type == 'DNF') {
            $('<div class="snowflakes" aria-hidden="true"><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❅</div></div>').prependTo('body');
            setTimeout(function() {
                $('.snowflakes').remove();
            }, 3000);
        }
    });
}
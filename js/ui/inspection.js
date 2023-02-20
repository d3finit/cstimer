let inspCd = false;
let inspecting = false;
let inspInterval;
let lcd = $("#lcd");
let other = $("#avgstr, #wndctn, #inputTimer, #inspDig");

function inputCheck(plusLang = {}) {
    if (!Boolean(kernel.getProp('inspBtn'))){
        $("#inspDig").remove();
        return;
    }
    if (inspCd) return;
    inspCd = true;
    if ($("#inputTimer:visible").length && !$("#inspDig").length && kernel.getProp('useIns') != 'n') {
        let btnval = 'PLUS_WCA_INSPECTION' in plusLang ? plusLang.PLUS_WCA_INSPECTION : 'WCA Inspection';
        let hintval = 'PLUS_WCA_INSPECTION_HINT' in plusLang ? plusLang.PLUS_WCA_INSPECTION_HINT : 'Click or space bar'
        let inspDiv = $("<div id=\"inspDig\" style=\"display: block;\"><input type=\"button\" id=\"inspBtn\" value=\""+ btnval +"\" style=\"height: 40px;font-size: 20px;margin: 0 auto;\"></div>");
        inspDiv.insertAfter("#inputTimer");
        inspDiv.on('mouseover', function() {
            if ($('#inputTimer').is(':focus')) $(this).find('input').val(hintval);
        }).on("mouseout", function() {
            $(this).find('input').val(btnval);
        });
    } else if (!$("#inputTimer:visible").length && $("#inspDig").length) {
        $("#inspDig").remove();
    }
    inspCd = false;
}

function inspect(plusLang = {}) {
    if (inspecting) return;
    inspecting = true;
    lcd.css('color', 'rgb(255,0,0)');
    other.hide();
    let count = 0;
    lcd.html(15-count);
    lcd.show();
    inspInterval = setInterval(function() {
        count++;
        let check = Boolean(kernel.getProp('plusIns'));
        if (check) {
            if (count == 8) $(document).trigger('voice', ['INSPECTION_8']);
            if (count == 12) $(document).trigger('voice', ['INSPECTION_12']);
        }
        if (count == 15) {
            inspecting = false;
            clearInterval(inspInterval);
            lcd.css('color', '')
            lcd.hide();
            other.show();
            inputCheck(plusLang);
            $("#inputTimer").blur().focus();
            return;
        }
        lcd.html(15-count);
    }, 1000);
}

export function inspection(plusLang = {}) {
    function procSignal(signal, value) {
        if (value[0] == 'inspBtn' && value[2] == 'modify') {
            inputCheck(plusLang);
            setTimeout(function() {
                $('#inputTimer').val('');
            }, 1000);
        }
    }
    $(function() {
        kernel.regListener('inspectionUpdate', 'property', procSignal, /^inspBtn$/);
        kernel.regProp('timer', 'inspBtn', 0, plusLang.PLUS_INSPECTION_BTN, [true]);
    });
    inputCheck(plusLang);
    const config = { attributes: true, childList: true, subtree: true };
    let containerChange = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                setTimeout(() => inputCheck(plusLang), 100);
            }
        }
    };
    const cObs = new MutationObserver(containerChange);
    cObs.observe(document.getElementById("container"), config);
    $("body").on("click", "#inspBtn", () => inspect(plusLang));
    $(document).keyup(function(e) {
        if (inspecting) {
            inspecting = false;
            clearInterval(inspInterval);
            lcd.css('color', '')
            lcd.hide();
            other.show();
            inputCheck(plusLang);
            $("#inputTimer").blur().focus();
            return;
        }
    });
    $('#inputTimer').keypress(function(e) {
        let k = e.which;
        if (k == 32 && $('#inputTimer').val() == '') {
            setTimeout(function () {
                $("#inspBtn").trigger("click");
            }, 100);
            e.preventDefault();
        }
    });
}
export let vccode = {
    code: 'bddccbabd3f88635da6131272ef9b9b1',
    info: {
        init: setGlow
    }
}

function addFire(theme = false) {
    if (theme == 'vicenzo' || (!theme && kernel.getProp('current-theme') == 'vicenzo')) {
        if (!$('#wndctn').hasClass('fire')) $('#wndctn').addClass('fire');
    } else {
        $('#wndctn').removeClass('fire');
    }
}

function setGlow() {
    addFire();
    $(document).on('theme_changed', (e, theme) => {
        addFire(theme);
    });
}
export let colorful = {
    code: '889574aebacda6bfd3e534e2b49b8028',
    info: {
        init: setHue
    }
}

function addRgb(theme = false) {
    if (theme == 'plus-rgb' || (!theme && kernel.getProp('current-theme') == 'plus-rgb')) {
        if (!$('#wndctn').hasClass('rgb')) $('#wndctn').addClass('rgb');
    } else {
        $('#wndctn').removeClass('rgb');
    }
}

function setHue() {
    addRgb();
    $(document).on('theme_changed', (e, theme) => {
        addRgb(theme);
    });
}
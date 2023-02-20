export function fto() {
    let color = kernel.getProp('colfto') || ['#fff#808#f00#0d0#00f#bbb#ff0#fa0'];
    function procSignal(signal, value) {
        if (value[0] == 'colfto' && value[2] == 'modify') {
            kernel.setProp('colfto', value[1])
        }
    }
    $(function() {
        kernel.regListener('ftoColors', 'property', procSignal, /^colfto$/);
        kernel.regProp('color', 'colfto', 4, 'FTO', color);
    });
}
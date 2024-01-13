export function sq2() {
    let color = kernel.getProp('colsq2') || ['#ff0#f80#0f0#fff#f00#00f'];
    function procSignal(signal, value) {
        if (value[0] == 'colsq2' && value[2] == 'modify') {
            kernel.setProp('colsq2', value[1])
        }
    }
    $(function() {
        kernel.regListener('sq2Colors', 'property', procSignal, /^colsq2$/);
        kernel.regProp('color', 'colsq2', 4, 'SQ2', color);
    });
}
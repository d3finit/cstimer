export function clock() {
    let color = kernel.getProp('colclock') || ['#37b#5cf#850#ff0#ff0#f00'];
    function procSignal(signal, value) {
        if (value[0] == 'colclock' && value[2] == 'modify') {
            kernel.setProp('colclock', value[1])
        }
    }
    $(function() {
        kernel.regListener('clockColors', 'property', procSignal, /^colclock$/);
        kernel.regProp('color', 'colclock', 4, 'Clock', color);
    });
}
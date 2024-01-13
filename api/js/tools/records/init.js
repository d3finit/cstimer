import {parser} from "./parser.js";

export function records(plusLang = {}) {
    parser.init(plusLang);
    let countries = parser.listCountries();
    let idx = [];
    let names = [];
    countries.map((country) => {
       idx.push(country.value);
       names.push(country.label);
    });
    kernel.regProp('kernel', 'plusWcaRegionalRecords', 0, plusLang.PLUS_NR_ENABLE, [true]);
    kernel.regProp('kernel', 'plusWcaRecordCountry', 1, plusLang.PLUS_NR_CHOOSE, [plusLang.PLUS_NR_DEFAULT, idx, names]);
    $(document).on('wca_record_checker', (e, puzzle, time) => {
        if (!isNaN(time)) {
            time = time * 100;
            if (time < 30) return false;
            let wca = parser.getRecords(puzzle);
            if ('single' in wca.wr && time < wca.wr.single) {
                $(document).trigger('voice', ['WCA_WR']);
            } else if ('single' in wca.cr && time < wca.cr.single) {
                $(document).trigger('voice', ['WCA_CR']);
            } else if ('single' in wca.nr && time < wca.nr.single) {
                $(document).trigger('voice', ['WCA_NR']);
            }
        }
    });
}
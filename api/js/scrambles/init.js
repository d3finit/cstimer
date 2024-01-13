import { puzzleTypes } from "./types.js";
import { generatePBL } from "./pbls.js";
import { kilominx, kilominx_hybrid_scramble } from "./kilom.js";
import { guildFordFull, guildFordMini } from "./guildford.js";
import { lubeChooser } from "./lubes.js";
import { clock } from "./clock.js";
import { sq2 } from "./sq2.js";
import { fto } from "./fto.js";

import { observer } from "./observer.js";

export function scrambles(lang) {
    let plusLang = lang();
    // Add new puzzle types
    puzzleTypes();
    // Add PBLTrainer support
    scrdata[13][1].push(["PBLTrainer", "pbls", 0]);
    scrMgr.reg('pbls', generatePBL);
    // Change FTO default length
    scrdata[31][1][0] = ["FTO (Face-Turning Octahedron)", "fto", 30];
    if (kernel.getProp('scrType') == 'fto') $('select:eq(0) option:eq(31)').prop('selected', true).change();
    // Add Kilominx support
    scrdata[31][1].push(['Kilominx', 'kilom', 0]);
    scrMgr.reg('kilom', kilominx);
    scrdata[31][1].push(['Kilominx Hybrid Scramble', 'kilomhs', 0]);
    scrMgr.reg('kilomhs', kilominx_hybrid_scramble);
    // Add GuildFord challenges
    scrMgr.reg('guildf', guildFordFull);
    scrdata[36][1].push(['Guildford Challenge', 'guildf', 0]);
    scrMgr.reg('guildm', guildFordMini);
    scrdata[36][1].push(['Mini Guildford Challenge', 'guildm', 0]);
    // Add random lubes (and bobs)
    scrdata[41][1].push(['Lubes', 'lubes', 0]);
    scrMgr.reg('lubes', lubeChooser);
    // @TODO: Add EOLR
    //scrdata[3][1].push(['EOLR', 'eolr', 0]);
    // Add clock color support
    clock();
    // Add SQ2 color support
    sq2();
    // Add FTO color support
    fto();
    // Observes current scramble
    observer(plusLang);
}
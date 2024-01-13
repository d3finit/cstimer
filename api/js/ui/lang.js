import {enUs} from "../lang/en-us.js";
import {ptPt} from "../lang/pt-pt.js";
import {caEs} from "../lang/ca-es.js";
import {csCz} from "../lang/cs-cz.js";
import {daDk} from "../lang/da-dk.js";
import {deDe} from "../lang/de-de.js";
import {elGr} from "../lang/el-gr.js";
import {esEs} from "../lang/es-es.js";
import {faIr} from "../lang/fa-ir.js";
import {fiFi} from "../lang/fi-fi.js";
import {frFr} from "../lang/fr-fr.js";
import {heIl} from "../lang/he-il.js";
import {hrHr} from "../lang/hr-hr.js";
import {huHu} from "../lang/hu-hu.js";
import {itIt} from "../lang/it-it.js";
import {jaJp} from "../lang/ja-jp.js";
import {koKr} from "../lang/ko-kr.js";
import {nlNl} from "../lang/nl-nl.js";
import {noNo} from "../lang/no-no.js";
import {plPl} from "../lang/pl-pl.js";
import {roRo} from "../lang/ro-ro.js";
import {ruRu} from "../lang/ru-ru.js";
import {skSk} from "../lang/sk-sk.js";
import {srSp} from "../lang/sr-sp.js";
import {svSe} from "../lang/sv-se.js";
import {trTr} from "../lang/tr-tr.js";
import {ukUa} from "../lang/uk-ua.js";
import {viVn} from "../lang/vi-vn.js";
import {zhCn} from "../lang/zh-cn.js";
import {zhTw} from "../lang/zh-tw.js";

export function lang() {
    switch(kernel.getProp('lang')) {
        case 'en-us':
            return enUs;
        case 'pt-pt':
            return {...enUs, ...ptPt};
        case 'ca-es':
            return {...enUs, ...caEs};
        case 'cs-cz':
            return {...enUs, ...csCz};
        case 'da-dk':
            return {...enUs, ...daDk};
        case 'de-de':
            return {...enUs, ...deDe};
        case 'el-gr':
            return {...enUs, ...elGr};
        case 'es-es':
            return {...enUs, ...esEs};
        case 'fa-ir':
            return {...enUs, ...faIr};
        case 'fi-fi':
            return {...enUs, ...fiFi};
        case 'fr-fr':
            return {...enUs, ...frFr};
        case 'he-il':
            return {...enUs, ...heIl};
        case 'hr-hr':
            return {...enUs, ...hrHr};
        case 'hu-hu':
            return {...enUs, ...huHu};
        case 'it-it':
            return {...enUs, ...itIt};
        case 'ja-jp':
            return {...enUs, ...jaJp};
        case 'ko-kr':
            return {...enUs, ...koKr};
        case 'nl-nl':
            return {...enUs, ...nlNl};
        case 'no-no':
            return {...enUs, ...noNo};
        case 'pl-pl':
            return {...enUs, ...plPl};
        case 'ro-ro':
            return {...enUs, ...roRo};
        case 'ru-ru':
            return {...enUs, ...ruRu};
        case 'sk-sk':
            return {...enUs, ...skSk};
        case 'sr-sp':
            return {...enUs, ...srSp};
        case 'sv-se':
            return {...enUs, ...svSe};
        case 'tr-tr':
            return {...enUs, ...trTr};
        case 'uk-ua':
            return {...enUs, ...ukUa};
        case 'vi-vn':
            return {...enUs, ...viVn};
        case 'zh-cn':
            return {...enUs, ...zhCn};
        case 'zh-tw':
            return {...enUs, ...zhTw};
        default:
            return enUs;
    }
}
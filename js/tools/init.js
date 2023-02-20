import { images } from "./image.js";
import {logos} from "./logos.js";
import {records} from "./records/init.js";

export function tools(lang) {
    let plusLang = lang();
    records(plusLang);
    logos(plusLang);
    images();
}
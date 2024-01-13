import {lang} from "./ui/lang.js";
import {ui} from "./ui/init.js";
import {tools} from "./tools/init.js";
import {scrambles} from "./scrambles/init.js";
import {voices} from "./voices/init.js";
import {code} from "./ui/code.js";

code.init(lang());
ui(lang, code);
scrambles(lang);
tools(lang);
voices(lang, code);
console.log("CSTimer+ running!");
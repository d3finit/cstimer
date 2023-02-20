import {md5} from "../../lib/md5.js";

import {blacknwhite} from "./codes/blacknwhite.js";
import {colorful} from "./codes/colorful.js";
import {bioxmas2020} from "./codes/bioxmas2020.js";
import {sccode} from "./codes/sccode.js";
import {vccode} from "./codes/vccode.js";

let userCodes = {};

let plusLang;

export let code = {
    init(lang) {
      plusLang = lang;
      let codes = [
        blacknwhite,
        colorful,
        bioxmas2020,
        sccode,
        vccode,
      ];
      codes.map((code) => {
          this.availableCodes[code.code] = code.info;
      });
      if (kernel.getProp('plus_codes')) userCodes = JSON.parse(kernel.getProp('plus_codes'));
      Object.keys(this.availableCodes).map((key) => {
          if (this.hasCode(key) && 'init' in this.availableCodes[key]) {
              this.availableCodes[key].init();
          }
      });
    },
    redeemCode(input) {
        input = input.toUpperCase();
        let code = md5(input);
        if (this.hasCode(code)) {
            alert(plusLang.PLUS_USED_CODE);
        } else {
            if (code in this.availableCodes) {
                let now = new Date().getTime();
                if (('redeemableUntil' in this.availableCodes[code] && now > this.availableCodes[code].redeemableUntil) || ('expiresIn' in this.availableCodes[code] && now > this.availableCodes[code].expiresIn)) {
                    alert(plusLang.PLUS_EXPIRED_CODE);
                } else if ('redeemableFrom' in this.availableCodes[code] && now < this.availableCodes[code].redeemableFrom) {
                    alert(plusLang.PLUS_INCORRECT_CODE);
                } else {
                    this.addCode(code, input);
                    alert(plusLang.PLUS_SUCCESSFUL_CODE);
                }
            } else {
                alert(plusLang.PLUS_INCORRECT_CODE);
            }
        }
    },
    hasCode(code) {
        let now = new Date().getTime();
        if (!userCodes || (typeof userCodes != null && !(code in userCodes))) {
            if (code in this.availableCodes && 'expiresIn' in this.availableCodes[code] && now > this.availableCodes[code].expiresIn) {
                return false;
            } else if (code in this.availableCodes && 'freeFrom' in this.availableCodes[code] && now > this.availableCodes[code].freeFrom) {
                return true;
            }
            return false;
        } else {
            if (code in this.availableCodes) {
                if (code != md5(userCodes[code]) || ('expiresIn' in this.availableCodes[code] && now > this.availableCodes[code].expiresIn)) {
                    this.removeCode(code);
                    return false;
                }
                return true;
            } else {
                this.removeCode(code);
                return false;
            }
        }
    },
    addCode(code, input) {
        if(!userCodes || typeof userCodes == null) {
            userCodes = {}
        }
        userCodes[code] = input;
        kernel.setProp('plus_codes', JSON.stringify(userCodes));
        userCodes = JSON.parse(kernel.getProp('plus_codes'));
        if ('init' in this.availableCodes[code]) {
            this.availableCodes[code].init();
        }
        location.reload();
    },
    removeCode(code) {
        delete userCodes[code];
        kernel.setProp('plus_codes', JSON.stringify(userCodes));
        userCodes = JSON.parse(kernel.getProp('plus_codes'));
    },
    availableCodes: {
    },

}
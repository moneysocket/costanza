// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require("./dom.js").DomUtl;

const FLYING_MONEY = "💸";

class IconUtl {
    static qrcode2x(div) {
        return D.emptyI(div, "fas fa-2x fa-qrcode");
    }

    static qrcode1x(div) {
        return D.emptyI(div, "fas fa-1x fa-qrcode");
    }

    static bars2x(div) {
        return D.emptyI(div, "fas fa-2x fa-bars");
    }

    static plug2x(div) {
        return D.emptyI(div, "fas fa-2x fa-plug");
    }

    static backarrow2x(div) {
        return D.emptyI(div, "fas fa-2x fa-arrow-circle-left");
    }

    static paste2x(div) {
        return D.emptyI(div, "fas fa-2x fa-paste");
    }

    static tower2x(div) {
        return D.emptyI(div, "fas fa-2x fa-broadcast-tower");
    }

    static checkcircle2x(div) {
        return D.emptyI(div, "fas fa-2x fa-check-circle");
    }

    static xcircle2x(div) {
        return D.emptyI(div, "fas fa-2x fa-times-circle");
    }

    static exclaimcircle2x(div) {
        return D.emptyI(div, "fas fa-2x fa-exclamation-circle");
    }

    static bolt2x(div) {
        return D.emptyI(div, "fas fa-2x fa-bolt");
    }

    static flyingmoney(div) {
        return D.textSpan(div, FLYING_MONEY);
    }
}

exports.IconUtl = IconUtl;

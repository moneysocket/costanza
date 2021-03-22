// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require("./dom.js").DomUtl;

const FLYING_MONEY = "💸";
const BOLT = "⚡";
const FLOPPY = "💾";

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

    static qcircle2x(div) {
        return D.emptyI(div, "fas fa-2x fa-question-circle");
    }

    static qcircle(div) {
        return D.emptyI(div, "fas fa-question-circle");
    }

    static exclaimcircle2x(div) {
        return D.emptyI(div, "fas fa-2x fa-exclamation-circle");
    }

    static bolt2x(div) {
        return D.emptyI(div, "fas fa-2x fa-bolt");
    }

    static cog2x(div) {
        return D.emptyI(div, "fas fa-2x fa-cog");
    }

    static magic2x(div) {
        return D.emptyI(div, "fas fa-2x fa-magic");
    }

    static trash2x(div) {
        return D.emptyI(div, "fas fa-2x fa-trash");
    }

    static cog1x(div) {
        return D.emptyI(div, "fas fa-cog");
    }

    static plug2x(div) {
        return D.emptyI(div, "fas fa-2x fa-plug");
    }

    static copy2x(div) {
        return D.emptyI(div, "fas fa-2x fa-copy");
    }

    static flyingmoney(div) {
        return D.textSpan(div, FLYING_MONEY);
    }

    static bolt(div) {
        return D.textSpan(div, BOLT);
    }

    static floppy(div) {
        return D.textSpan(div, FLOPPY);
    }
}

exports.IconUtl = IconUtl;

// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../../utl/dom.js').DomUtl;
var I = require('../../utl/icon.js').IconUtl;
var Wad = require("moneysocket").Wad;

var Screen = require('./Screen');

const Bolt11 = require("moneysocket").Bolt11;
const b11 = require("bolt11");

class DrillLevelTwoScreen extends Screen {
    constructor(app_div) {
        super(app_div);

        this.onbackclick = null;
        this.receipt = null;
        this.entry = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    typeToTitle(type) {
        var r = type.replace("_", " ");
        r = r.replace(/\b\w/g, function(l){ return l.toUpperCase() })
        return r;
    }

    drawMenuTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        var title = this.typeToTitle(this.entry['type']);
        D.textParagraph(flex, title,
                        "font-black text-2xl text-gray-400");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");

        this.drawBackButton(button_flex, (function () {
            this.onbackclick(this.receipt);
        }).bind(this));
        this.drawMenuTitle(title_flex);
    }

    timestampToNiceString(time) {
        var d = new Date(Math.round(time * 1000));
        var s = d.getDate()+
                "/"+(d.getMonth()+1)+
                "/"+ d.getFullYear()+
                " "+ d.getHours()+
                ":"+ d.getMinutes()+
                ":"+ d.getSeconds();
        return s;
    }

    drawValue(div, key, value) {
        var v = D.emptyDiv(div,
                           "flex justify-start text-gray-400 px-4");
        D.textSpan(v, this.typeToTitle(key), "text-xs font-bold w-1/4");
        D.textSpan(v, value, "break-words w-3/4");
    }

    drawWad(div, key, wad) {
        var v = D.emptyDiv(div,
                           "flex justify-start text-gray-400 px-4");
        D.textSpan(v, this.typeToTitle(key), "text-xs font-bold w-1/4");
        D.textSpan(v, wad.toString(), "break-words w-3/4");
        var msats = wad.msats;
        var v = D.emptyDiv(div,
                           "flex justify-start text-gray-400 px-4");
        D.textSpan(v, "msats", "text-xs font-bold w-1/4");
        D.textSpan(v, msats + " msats", "break-words w-3/4");
    }

    drawInfoPanel(div) {
        var flex = D.emptyDiv(div, "flex flex-col section-background");
        for (var key in this.entry) {
            var value = this.entry[key];
            if (key == 'type') {
                continue;
            }
            if (key == 'time') {
                value = (new Date(Math.round(value * 1000))).toString();
            }
            if (key == 'wad') {
                this.drawWad(flex, key, value);
            } else {
                this.drawValue(flex, key, value);
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw(receipt, entry) {
        console.log("drawing entry " + JSON.stringify(entry));
        this.receipt = receipt;
        this.entry = entry;
        var panel_div = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(panel_div, "flex-none");
        this.drawTitlePanel(flex_top);
        this.drawInfoPanel(flex_top);
    }


    //////////////////////////////////////////////////////////////////////////
    // misc
    //////////////////////////////////////////////////////////////////////////

    getMsats(bolt11) {
        // TODO move this to library and do fuller validation
        var decoded = b11.decode(bolt11);
        if ("millisatoshis" in decoded) {
            return decoded.millisatoshis;
        }
        return null;
    }
}

exports.DrillLevelTwoScreen = DrillLevelTwoScreen;

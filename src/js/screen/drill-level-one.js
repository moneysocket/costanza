// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../utl/dom.js').DomUtl;
var I = require('../utl/icon.js').IconUtl;
var Wad = require("moneysocket").Wad;
const Bolt11 = require("moneysocket").Bolt11;
const b11 = require("bolt11");

class DrillLevelOneScreen {
    constructor(app_div) {
        this.app_div = app_div;
        this.onbackclick = null;

        this.receipt = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawBackButton(div, back_func) {
        var b = D.button(div, back_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var back = I.backarrow2x(icon_span);
        var text = D.textSpan(flex, "Back");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawMenuTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        var title;
        switch (this.receipt['type']) {
        case "socket_session":
            title = "Socket Session";
            break;
        case "manual_send":
            title = "Manual Send";
            break;
        case "manual_receive":
            title = "Manual Receive";
            break;
        default:
            title = "Unknown";
            break;
        }
        D.textParagraph(flex, title,
                        "font-black text-2xl text-yellow-800");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");

        this.drawBackButton(button_flex, this.onbackclick);
        this.drawMenuTitle(title_flex);
    }

    typeToTitle(type) {
        var r = type.replace("_", " ");
        r = r.replace(/\b\w/g, function(l){ return l.toUpperCase() })
        return r;
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

    getValueString(entry) {
        console.log(JSON.stringify(entry));
        switch (this.receipt['type']) {
        case "socket_session":
            if (entry['type'] == 'invoice_request') {
                var w = Wad.bitcoin(entry['msats']);
                return [w.toString(), ""];
            } else if (entry['type'] == 'pay_request') {
                var msats = this.getMsats(entry['bolt11']);
                var w = Wad.bitcoin(msats);
                return [w.toString(), ""];
            } else if (entry['type'] == "preimage_notified") {
                if (entry['increment']) {
                    var w = Wad.bitcoin(entry['msats']);
                    return [ "+" + w.toString(), "font-bold text-green-400"];
                } else {
                    var w = Wad.bitcoin(entry['msats']);
                    return [ "-" + w.toString(), "font-bold text-red-400"];
                }
            }
            return ["-", ""];
        case "manual_send":
            if (entry['type'] == 'request_pay') {
                var w = Wad.bitcoin(entry['msats']);
                return [w.toString(), ""];
            } else {
                var msats = this.receipt['entries'][0]['msats'];
                var w = Wad.bitcoin(msats);
                return [ "-" + w.toString(), "font-bold text-red-400"];
            }
            return ["-", ""];
            break;
        case "manual_receive":
            if (entry['type'] == 'request_invoice') {
                var w = Wad.bitcoin(entry['msats']);
                return [w.toString(), ""];
            } else if (entry['type'] == 'got_preimage') {
                var msats = this.receipt['entries'][0]['msats'];
                var w = Wad.bitcoin(msats);
                return [ "+" + w.toString(), "font-bold text-green-400"];
            }
            return ["-", ""];
            break;
        default:
            return ["-", ""];
        }
    }

    drawEntry(div, entry) {
        var e = D.emptyDiv(div,
                           "bg-gray-600 hover:bg-gray-400 text-gray-300 py-2");
        // TODO - on click
        var flex = D.emptyDiv(e, "flex items-center justify-start");
        D.textSpan(flex, this.timestampToNiceString(entry['time']),
                   "text-xs w-1/3");
        D.textSpan(flex, this.typeToTitle(entry['type']),
                   "font-bold text-sm w-1/3");

        var [str, fmt] = this.getValueString(entry);
        D.textSpan(flex, str, fmt + " w-1/3");
    }

    drawInfoPanel(div) {
        var flex = D.emptyDiv(div, "flex flex-col section-background");
        var entries = this.receipt.entries;
        for (var i = (entries.length - 1); i >= 0; i--) {
            this.drawEntry(flex, entries[i]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    redrawUuid(receipt_uuid) {
        if (this.receipt == null) {
            return;
        }
        if (receipt_uuid != this.receipt['receipt_uuid']) {
            return;
        }
        console.log("drill level one redraw");
        D.deleteChildren(this.app_div);
        this.draw(this.receipt);
    }

    draw(receipt) {
        this.receipt = receipt;
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

exports.DrillLevelOneScreen = DrillLevelOneScreen;

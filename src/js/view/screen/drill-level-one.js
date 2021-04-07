// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;
const Wad = require("moneysocket").Wad;

const Screen = require('./screen.js').Screen;

const Bolt11 = require("moneysocket").Bolt11;
const b11 = require("bolt11");

class DrillLevelOneScreen extends Screen {
    constructor(app_div) {
        super(app_div);
        this.onbackclick = null;
        this.onentryclick = null;
        this.receipt = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
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
                        "page-title");
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
        //console.log(JSON.stringify(entry));
        switch (this.receipt['type']) {
        case "socket_session":
            if (entry['type'] == 'invoice_request') {
                return [entry['wad'].toString(), ""];
            } else if (entry['type'] == 'pay_request') {
                return [entry['wad'].toString(), ""];
            } else if (entry['type'] == 'error_notified') {
                return [entry['error_msg'], "font-bold text-red-400"];
            } else if (entry['type'] == "preimage_notified") {
                if (entry['increment']) {
                    return ["+" + entry['wad'].toString(),
                            "font-bold text-green-400"];
                } else {
                    return ["-" + entry['wad'].toString(),
                            "font-bold text-red-700"];
                }
            }
            return ["-", ""];
        case "manual_send":
            if (entry['type'] == 'request_pay') {
                return [entry['wad'].toString(), ""];
            } else if (entry['type'] == 'error') {
                return ["Error: " + entry['error_msg'],
                        "font-bold text-red-400"];
            } else {
                var w = this.receipt['entries'][0]['wad'];
                return [ "-" + w.toString(), "font-bold text-red-700"];
            }
            return ["-", ""];
            break;
        case "manual_receive":
            if (entry['type'] == 'request_invoice') {
                return [entry['wad'].toString(), ""];
            } else if (entry['type'] == 'error') {
                return ["Error: " + entry['error_msg'],
                        "font-bold text-red-400"];
            } else if (entry['type'] == 'preimage_notified') {
                var w = this.receipt['entries'][0]['wad'];
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
                           "bg-gray-800 hover:bg-gray-900 text-gray-300 py-2");
        // TODO - on click
        e.onclick = (function() {
            if (this.onentryclick != null) {
                this.onentryclick(this.receipt, entry);
            }
        }).bind(this);
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
        //console.log("drill level one redraw");
        D.deleteChildren(this.app_div);
        this.draw(this.receipt);
    }

    draw(receipt) {
        this.receipt = receipt;
        var panel_div = this.screenDiv();
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

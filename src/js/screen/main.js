// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../utl/dom.js').DomUtl;
var I = require('../utl/icon.js').IconUtl;
var Wad = require("moneysocket").Wad;

const CONNECT_STATE = require('../model.js').CONNECT_STATE;


class MainScreen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
        this.onconnectwalletclick = null;
        this.onscanclick = null;
        this.onmenuclick = null;
        this.onreceiptclick = null;

        this.balance_div = null;
        this.ping_div = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // buttons
    ///////////////////////////////////////////////////////////////////////////

    drawScanButton(div, scan_func) {
        var b = D.button(div, scan_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var qr = I.qrcode2x(icon_span);
        var text = D.textSpan(flex, "Scan");
    }

    drawMenuButton(div, menu_func) {
        var b = D.button(div, menu_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var bars_span = D.emptySpan(flex, "px-2");
        var bars = I.bars2x(bars_span);
        var text = D.textSpan(flex, "Menu");
    }

    drawConnectWalletButton(div, connect_func) {
        var b = D.button(div, connect_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var bars_span = D.emptySpan(flex, "px-2");
        var bars = I.plug2x(bars_span);
        var text = D.textSpan(flex, "Connect Wallet Provider");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Receipt
    ///////////////////////////////////////////////////////////////////////////

    drawOutgoingBolt11Receipt(div, receipt, click_func) {
        var d = D.emptyDiv(div, "tx-button-qr");
        d.onclick = (function() {
            click_func(receipt);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        // use span?
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.qrcode1x(icon_span);
        if (receipt.description == null) {
            D.textSpan(flex, "(no description)", "flex-grow text-sm");
        } else {
            D.textSpan(flex, receipt.description, "flex-grow text-sm");
        }
        D.textSpan(flex, "- " + receipt.value.toString(),
                   "font-bold text-red-400 px-2");
    }

    drawIncomingBolt11Receipt(div, receipt, click_func) {
        var d = D.emptyDiv(div, "tx-button-qr");
        d.onclick = (function() {
            click_func(receipt);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.qrcode1x(icon_span);
        if (receipt.description == null) {
            D.textSpan(flex, "(no description)", "flex-grow text-sm");
        } else {
            D.textSpan(flex, receipt.description, "flex-grow text-sm");
        }
        D.textSpan(flex, "+ " + receipt.value.toString(),
                   "font-bold text-green-400 px-2");
    }

    drawSocketSessionReceipt(div, receipt, click_func) {
        var d = D.emptyDiv(div, "tx-button-socket");
        d.onclick = (function() {
            click_func(receipt);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.flyingmoney(icon_span);
        D.textSpan(flex, "Socket Session", "flex-grow text-sm");
        var ntx = receipt.txs.length;
        D.textSpan(flex, ntx.toString() + "tx", "font-bold px-2");
        var total_msats = 0;
        for (var i = 0; i < receipt.txs.length; i++) {
            if (receipt.txs[i].status != 'settled') {
                continue;
            }
            if (receipt.txs[i].direction == "outgoing") {
                total_msats = total_msats - receipt.txs[i].value.msats;
            } else {
                console.assert(receipt.txs[i].direction == "incoming");
                total_msats = total_msats + receipt.txs[i].value.msats;
            }
        }
        console.log(total_msats);
        if (total_msats >= 0) {
            var wad = Wad.bitcoin(total_msats);
            D.textSpan(flex, "+ " + wad.toString(),
                       "font-bold text-green-400 px-2");
        } else {
            var wad = Wad.bitcoin(0 - total_msats);
            D.textSpan(flex, "- " + wad.toString(),
                       "font-bold text-red-400 px-2");
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawConnectWalletPanel(div, connect_func) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");
        this.drawConnectWalletButton(flex, connect_func);
    }

    drawBalancePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");
        var wad = this.model.getConsumerBalanceWad();
        this.balance_div = D.emptyDiv(flex);
        D.textParagraph(this.balance_div, wad.toString(), "font-bold px-2");

        var msecs = this.model.getConsumerLastPing();
        this.ping_div = D.emptyDiv(flex);
        D.textParagraph(this.ping_div, msecs.toString() + " ms",
                        "font-bold px-2");
    }

    drawReceiptPanel(div, receipts, click_func) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");

        //console.log(JSON.stringify(receipts));
        //console.log(receipts.length);

        for (var i = 0; i < receipts.length; i++) {
            var r = receipts[i];
            if (r.type == "outgoing_bolt11") {
                this.drawOutgoingBolt11Receipt(flex, r, click_func);
            } else if (r.type == "incoming_bolt11") {
                this.drawIncomingBolt11Receipt(flex, r, click_func);
            } else if (r.type == "socket_session") {
                this.drawSocketSessionReceipt(flex, r, click_func);
            } else {
                console.error("unknown receipt type");
            }
        }
    }

    drawActionPanel(div, scan_func, menu_func) {
        var flex = D.emptyDiv(div, "flex justify-evenly section-background");
        this.drawScanButton(flex, scan_func);
        this.drawMenuButton(flex, menu_func);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    redrawInfo() {
        console.log("redraw?");
        if (this.balance_div != null) {
            console.log("yes balance?");
            var wad = this.model.getConsumerBalanceWad();
            D.deleteChildren(this.balance_div);
            D.textParagraph(this.balance_div, wad.toString(), "font-bold px-2");
        }

        if (this.ping_div != null) {
            console.log("yes ping?");
            var msecs = this.model.getConsumerLastPing();
            D.deleteChildren(this.ping_div);
            D.textParagraph(this.ping_div, msecs.toString() + " ms",
                            "font-bold px-2");
        }
    }

    draw(receipts) {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        var flex_mid = D.emptyDiv(flex, "flex-grow");
        var flex_bottom = D.emptyDiv(flex, "flex-none");

        switch (this.model.getConsumerConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.drawBalancePanel(flex_top);
            break;
        case CONNECT_STATE.CONNECTING:
            this.drawConnectWalletPanel(flex_top, this.onconnectwalletclick);
            break;
        case CONNECT_STATE.DISCONNECTED:
            this.drawConnectWalletPanel(flex_top, this.onconnectwalletclick);
            break;
        default:
            console.error("unknown state");
            break;
        }

        this.drawReceiptPanel(flex_mid, receipts, this.onreceiptclick);
        this.drawActionPanel(flex_bottom, this.onscanclick, this.onmenuclick);
    }
}

exports.MainScreen = MainScreen;

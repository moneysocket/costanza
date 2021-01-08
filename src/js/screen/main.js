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
        this.onconnectappclick = null;
        this.onscanclick = null;
        this.onmenuclick = null;
        this.onreceiptclick = null;

        this.auth_balance_div = null;
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

    drawConnectAppButton(div, connect_func) {
        var b = D.button(div, connect_func,
                         "bg-yellow-700 hover:bg-yellow-600 text-white " +
                         "rounded px-2 py-1");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var bars_span = D.emptySpan(flex, "");
        var bars = I.flyingmoney(bars_span);
        var text = D.textSpan(flex, "App");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Items
    ///////////////////////////////////////////////////////////////////////////

    drawBalance() {
        var wad = this.model.getConsumerBalanceWad();
        D.deleteChildren(this.balance_div);
        D.textParagraph(this.balance_div, wad.toString(),
                        "font-bold text-3xl text-yellow-900 " +
                        "hover:text-yellow-700 py-4");
        this.balance_div.onclick = (function() {
            this.onconnectwalletclick();
        }).bind(this);
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        this.balance_div.setAttribute("title", hoverstring);
    }

    drawAuthorizedBalance() {
        var wad = this.model.getProviderBalanceWad();
        D.deleteChildren(this.auth_balance_div);
        var border = D.emptyDiv(this.auth_balance_div,
                                "px-2 bg-yellow-300 hover:bg-yellow-200");
        var icon_span = D.emptySpan(border, "px-2 font-bold");
        I.flyingmoney(icon_span);
        D.textSpan(border, "App", "px-2 font-bold text-yellow-900");
        D.textParagraph(border, wad.toString(),
                        "font-bold text-sm text-yellow-900");
        border.onclick = (function() {
            console.log("click");
        }).bind(this);
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        border.setAttribute("title", hoverstring);
    }

    drawPing() {
        var msecs = this.model.getConsumerLastPing();
        D.deleteChildren(this.ping_div);
        D.textParagraph(this.ping_div, msecs.toString() + " ms", "text-sm");
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

    drawAppSocketInfo(connect_func) {
        switch (this.model.getProviderConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.drawAuthorizedBalance();
            break;
        case CONNECT_STATE.CONNECTING:
            break;
        case CONNECT_STATE.DISCONNECTED:
            D.deleteChildren(this.auth_balance_div);
            var button_div = D.emptyDiv(this.auth_balance_div);
            this.drawConnectAppButton(button_div, connect_func);
            break;
        default:
            console.error("unknown provider state");
            break;
        }
    }

    drawBalancePanel(div, connect_func) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");
        var left_box = D.emptyDiv(flex, "flex flex-row");

        this.auth_balance_div = D.emptyDiv(left_box);
        this.drawAppSocketInfo(left_box, connect_func);
        //var button_div = D.emptyDiv(left_box);
        //this.drawConnectAppButton(button_div, connect_func);

        this.balance_div = D.emptyDiv(flex);
        this.drawBalance();
        var right_box = D.emptyDiv(flex, "flex flex-row-reverse");
        this.ping_div = D.emptyDiv(right_box);
        this.drawPing();
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
        if (this.balance_div != null) {
            this.drawBalance();
        }
        if (this.auth_balance_div != null) {
            this.drawAppSocketInfo(this.onconnectappclick);
        }
        if (this.ping_div != null) {
            this.drawPing();
        }
    }

    draw(receipts) {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        var flex_mid = D.emptyDiv(flex, "flex-grow");
        var flex_bottom = D.emptyDiv(flex, "flex-none");

        switch (this.model.getConsumerConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.drawBalancePanel(flex_top, this.onconnectappclick);
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

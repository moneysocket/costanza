// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;
const Wad = require("moneysocket").Wad;

const SocketSessionReceipt = require(
    '../../model/socket-session-receipt.js').SocketSessionReceipt;
const ManualReceiveReceipt = require(
    '../../model/manual-receive-receipt.js').ManualReceiveReceipt;
const ManualSendReceipt = require(
    '../../model/manual-send-receipt.js').ManualSendReceipt;
const Screen = require('./screen.js').Screen;

const CONNECT_STATE = require('../../model/model.js').CONNECT_STATE;

class MainScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.onconnectwalletclick = null;
        this.onconnectappclick = null;
        this.onscanclick = null;
        this.onmenuclick = null;
        this.onreceiptclick = null;

        this.auth_balance_div = null;
        this.balance_div = null;
        this.ping_div = null;
        this.receipts_div = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // buttons
    ///////////////////////////////////////////////////////////////////////////

    drawScanButton(div, scan_func) {
        this.drawButton(div, I.qrcode2x, "Scan", scan_func, "main-button");
    }

    drawMenuButton(div, menu_func) {
        this.drawButton(div, I.bars2x, "Menu", menu_func, "main-button");
    }

    drawConnectWalletButton(div, connect_func) {
        this.drawButton(div, I.plug2x, "Connect Wallet Provider", connect_func,
                        "main-button");
    }

    drawConnectAppButton(div, connect_func) {
        this.drawButton(div, I.flyingmoney, "App", connect_func, "app-button");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Items
    ///////////////////////////////////////////////////////////////////////////

    drawBalance() {
        var wad = this.model.getConsumerBalanceWad();
        D.deleteChildren(this.balance_div);
        var flex = D.emptyDiv(this.balance_div, "flex justify-center py-4");
        var button = D.emptyDiv(flex,
            "rounded px-4 py-4 bg-gray-800 hover:bg-gray-900");
        D.textParagraph(button, wad.toString(),
                        "font-bold text-3xl text-green-400");
        button.onclick = (function() {
            this.onconnectwalletclick();
        }).bind(this);
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        button.setAttribute("title", hoverstring);
    }

    drawAuthorizedBalance() {
        var wad = this.model.getProviderBalanceWad();
        D.deleteChildren(this.auth_balance_div);
        var border = D.emptyDiv(this.auth_balance_div,
            ("px-4 py-2 bg-gray-800 hover:bg-gray-900 border " +
             "border-gray-600 rounded-2xl text-gray-300"));
        border.onclick = (function() {
            this.onconnectappclick();
        }).bind(this);
        var icon_span = D.emptySpan(border, "px-2 font-bold");
        I.flyingmoney(icon_span);
        var a = D.textSpan(border, "App Authorized", "px-2 font-bold text-sm text-gray-300");
        var p = D.textParagraph(border, wad.toString(),
                                "font-bold text-sm text-gray-300");
        var sats = (wad['msats'] / 1000.0).toFixed(3) + " sats";
        var hoverstring = wad['name'] + "\n" + sats;
        border.setAttribute("title", hoverstring);
    }

    drawPing() {
        var msecs = this.model.getConsumerLastPing();
        D.deleteChildren(this.ping_div);
        D.textParagraph(this.ping_div, msecs.toString() + " ms",
                        "text-sm text-gray-300");
    }


    ///////////////////////////////////////////////////////////////////////////
    // Receipt
    ///////////////////////////////////////////////////////////////////////////

    drawManualReceiveReceipt(div, manual_receive, click_func) {
        var [error, got_invoice, completed, wad, expired] = (
            ManualReceiveReceipt.manualReceiveInfo(manual_receive));

        var d = D.emptyDiv(div, "tx-button-socket");
        d.onclick = (function() {
            click_func(manual_receive);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.qrcode1x(icon_span);

        if (error != null) {
            D.textSpan(flex, "Manual Receive Err: " + error,
                       "pl-4 font-bold text-left");
        } else if (! got_invoice) {
            D.textSpan(flex, "Waiting for invoice " + wad.toString(),
                       "pl-4 text-left");
        } else if (completed) {
            D.textSpan(flex, "Manual Receive", "pl-4 text-left");
            D.emptyDiv(flex, "flex-grow");
            D.textSpan(flex, "+ " + wad.toString(),
                       "font-bold text-green-400 text-right w-40");
        } else {
            D.textSpan(flex, "Manual receive in progress ",
                       "pl-4 text-left");
            D.emptyDiv(flex, "flex-grow");
            D.textSpan(flex, wad.toString(),
                       "font-bold text-gray-400 text-right w-40");
        }
    }

    drawManualSendReceipt(div, manual_send, click_func) {
        var [error, completed, bolt11, wad, description] = (
            ManualSendReceipt.manualSendInfo(manual_send));

        var d = D.emptyDiv(div, "tx-button-socket");
        d.onclick = (function() {
            click_func(manual_send);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.qrcode1x(icon_span);

        description = (description == null) ? "(no description)" : description;

        if (error != null) {
            D.textSpan(flex, "Pay Error: " + error, "pl-4 text-left font-bold");
        } else if (! completed) {
            D.textSpan(flex, "Paying", "pl-4 font-bold text-left");
            D.textSpan(flex, description, "pl-4 text-left");
        } else {
            D.textSpan(flex, "Paid", "pl-4 text-left");
            D.textSpan(flex, description, "text-left pl-4");
            D.emptyDiv(flex, "flex-grow");
            D.textSpan(flex, "- " + wad.toString(),
                       "font-bold text-red-400 w-40 text-right");
        }
    }

    drawSocketSessionReceipt(div, session, click_func) {
        var [total_wad, increment, total_txs] = (
            SocketSessionReceipt.sessionSettledInfo(session));
        var ended = SocketSessionReceipt.isSessionEnded(session);

        var d = D.emptyDiv(div, "tx-button-socket");
        d.onclick = (function() {
            click_func(session);
        });
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.flyingmoney(icon_span);
        var label = ended ? "Socket Session Completed" :
                            "Socket Session In Progress";
        D.textSpan(flex, label, "pl-4 text-left");
        D.emptyDiv(flex, "flex-grow");
        D.textSpan(flex, total_txs.toString() + "tx", "font-bold w-30 text-right");
        var wad = (total_txs == 0) ?
            this.model.msatsToWalletCurrencyWad(0) : total_wad;
        if (increment) {
            D.textSpan(flex, "+ " + wad.toString(),
                       "font-bold text-green-400 w-40 text-right");
        } else {
            D.textSpan(flex, "- " + wad.toString(),
                       "font-bold text-red-400 w-40 text-right");
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // tutorial
    ///////////////////////////////////////////////////////////////////////////

    drawTutorialLink(div) {
        var flex = D.emptyDiv(div,
            "flex flex-col justify-center items-center py-5 bg-gray-800");
        var row = D.emptyDiv(flex, "flex flex-col justify-center");
        D.textParagraph(row, "Not sure what's going on?",
                        "text-gray-400 text-center");
        D.hyperlinkTabOpen(row, "See Tutorial", "https://socket.money/tutorial",
                           "text-center font-bold text-2xl text-green-500");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawConnectWalletPanel(div, connect_func) {
        var flex = D.emptyDiv(div,
            "flex flex-col justify-center items-center py-5 bg-gray-700");
        var row = D.emptyDiv(flex, "flex flex-row justify-center");
        this.drawConnectWalletButton(row, connect_func);
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
        var outer = D.emptyDiv(div, "bg-gray-700 px-1 py-2");
        var flex = D.emptyDiv(outer,
            "flex flex-col justify-evenly rounded-xl px-2 py-2 bg-gray-800");
        var left_box = D.emptyDiv(flex, "flex flex-row");

        this.auth_balance_div = D.emptyDiv(left_box);
        this.drawAppSocketInfo(connect_func);

        this.balance_div = D.emptyDiv(flex);
        this.drawBalance();
        var right_box = D.emptyDiv(flex, "flex flex-row-reverse");
        this.ping_div = D.emptyDiv(right_box);
        this.drawPing();
    }

    drawReceipts(click_func) {
        D.deleteChildren(this.receipts_div);
        var receipts = this.model.getReceipts();
        if (receipts.length == 0) {
            this.drawTutorialLink(this.receipts_div);
            return;
        }
        for (var i = (receipts.length - 1); i >= 0; i--) {
            var r = receipts[i];
            if (r.type == "socket_session") {
                this.drawSocketSessionReceipt(this.receipts_div, r, click_func);
            } else if (r.type == "manual_receive") {
                this.drawManualReceiveReceipt(this.receipts_div, r, click_func);
            } else if (r.type == "manual_send") {
                this.drawManualSendReceipt(this.receipts_div, r, click_func);
            } else {
                console.error("unknown receipt type");
            }
        }
    }

    drawReceiptPanel(div, click_func) {
        var outer = D.emptyDiv(div, "px-1 py-2 overflow-auto");
        var s = D.emptyDiv(outer, "px-4 py-4 bg-gray-800 rounded-3xl");
        var flex = D.emptyDiv(s, "flex flex-col justify-evenly");
        this.receipts_div = D.emptyDiv(flex);
        this.drawReceipts(click_func);
    }

    drawActionPanel(div, scan_func, menu_func) {
        var flex = D.emptyDiv(div,
            "flex justify-evenly py-4 bg-gray-700");
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
    }

    redrawPing() {
        if (this.ping_div != null) {
            this.drawPing();
        }
    }

    redrawReceiptInfo(uuid) {
        if (this.receipts_div != null) {
            console.log("redraw receipt");
            this.drawReceipts(this.onreceiptclick);
        }
    }

    draw() {
        var screen = this.screenDiv();
        var flex = D.emptyDiv(screen, "flex flex-col justify-between h-full")

        switch (this.model.getConsumerConnectState()) {
        case CONNECT_STATE.CONNECTED:
            this.drawBalancePanel(flex, this.onconnectappclick);
            break;
        case CONNECT_STATE.CONNECTING:
            this.drawConnectWalletPanel(flex, this.onconnectwalletclick);
            break;
        case CONNECT_STATE.DISCONNECTED:
            this.drawConnectWalletPanel(flex, this.onconnectwalletclick);
            break;
        default:
            console.error("unknown state");
            break;
        }

        this.drawReceiptPanel(flex, this.onreceiptclick);
        this.drawActionPanel(flex, this.onscanclick, this.onmenuclick);
    }
}

exports.MainScreen = MainScreen;

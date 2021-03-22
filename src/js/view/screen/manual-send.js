// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const b11 = require("bolt11");
const Wad = require("moneysocket").Wad;

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;

const MSATS_PER_SAT = 1000.0;
const SATS_PER_BTC = 100000000.0;
const MSATS_PER_BTC = SATS_PER_BTC * MSATS_PER_SAT;

class ManualSendScreen extends Screen {
    constructor(app_div, model) {
        super(app_div, model);

        this.onbackclick = null;
        this.onpayerror = null;
        this.onpayrequest = null;

        this.val_input = null;

        this.title_string = "Manual Invoice:";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawPayButton(div, set_func) {
        this.drawButtonPlain(div, "Pay Invoice", set_func, "main-button");
    }

    ///////////////////////////////////////////////////////////////////////////
    // do request
    ///////////////////////////////////////////////////////////////////////////

    doPayRequest() {
        var payer = this.model.getConsumerIsPayer();
        if (! payer) {
            if (this.onpayrror != null) {
                this.onpayerror("wallet provider can't send");
            }
            return;
        }
        var wad = this.model.getConsumerBalanceWad();
        // TODO = check available balnace
        if (this.onpayrequest != null) {
            this.onpayrequest(this.bolt11);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // input actions
    ///////////////////////////////////////////////////////////////////////////

    drawInvoiceDetailsRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var msats = this.getMsats(this.bolt11);
        var expiry = this.getExpiryTimestamp(this.bolt11);
        var description = this.getDescription(this.bolt11);
        var expiryfmt = new Date(expiry);
        var send_wad = Wad.clone_msats(wad, msats);

        description = (description == null) ? "(no description)" : description;

        var val = D.emptyDiv(div, "flex flex-col");
        D.textParagraph(val, this.bolt11,
                   "font-black break-words text-gray-300 py-5");
        D.textParagraph(val, "Description: " + description,
                        "font-black text-gray-300 py-5");
        D.textParagraph(val, "Requested: " + send_wad.toString(),
                   "font-black text-gray-300 py-5");
        D.textParagraph(val, "Expires: " + expiryfmt.toString(),
                   "font-black break-words text-gray-300 py-5");

        var button_div = D.emptyDiv(val, "flex justify-center py-2");
        this.drawPayButton(button_div,
                           (function() {this.doPayRequest()}).bind(this));
    }

    drawAvailableRow(div) {
        var wad = this.model.getConsumerBalanceWad();
        var payer = this.model.getConsumerIsPayer();
        var payee = this.model.getConsumerIsPayee();

        D.deleteChildren(div);
        var across = D.emptyDiv(div, "flex justify-around py-4 bg-gray-800");
        var col1 = D.emptyDiv(across, "flex flex-col");
        D.textSpan(col1, "Available:", "text-gray-300");
        D.textSpan(col1, wad.toString(), "font-bold text-xl text-gray-300");
        var col2 = D.emptyDiv(across, "flex flex-col items-center");
        var r1 = D.emptyDiv(col2, "flex justify-center");
        D.textSpan(r1, "Can Send:", "text-gray-300");
        D.textSpan(r1, payer ? "True" : "False",
                   "font-bold text-xl text-gray-300 px-2");
        var r2 = D.emptyDiv(col2, "flex justify-center items-center");
        D.textSpan(r2, "Can Receive:", "text-gray-300");
        D.textSpan(r2, payee ? "True" : "False",
                   "font-bold text-xl text-gray-300 px-2");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawInterfacePanel(div) {
        var flex = D.emptyDiv(div, "flex flex-col section-background");
        this.drawInvoiceDetailsRow(flex);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw(bolt11) {
        this.bolt11 = bolt11;
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawAvailableRow(flex_mid);
        this.drawInterfacePanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }


    //////////////////////////////////////////////////////////////////////////
    // misc
    //////////////////////////////////////////////////////////////////////////

    getExpiryTimestampFmt(bolt11) {
        var decoded = b11.decode(bolt11);
        return decoded.timeExpireDateString;
    }

    getExpiryTimestamp(bolt11) {
        // TODO - move this to library
        var decoded = b11.decode(bolt11);
        var timestamp = decoded.timestamp;
        var expire_time = decoded.timeExpireDate;
        console.log("get expiry timestamp: " + JSON.stringify(decoded));
        console.log("get expiry timestamp: " + decoded + " " +
                    timestamp + " " + expire_time);
        return expire_time;
    }

    getMsats(bolt11) {
        // TODO move this to library and do fuller validation
        var decoded = b11.decode(bolt11);
        if ("millisatoshis" in decoded) {
            if (decoded.millisatoshis == null) {
                return null;
            }
            return decoded.millisatoshis;
        }
        return null;
    }

    getDescription(bolt11) {
        // TODO - move this to library
        var decoded = b11.decode(bolt11);
        for (var i = 0; i < decoded.tags.length; i++) {
            if (decoded.tags[i]["tagName"] == "description") {
                return decoded.tags[i]["data"];
            }
        }
        return null;
    }
}

exports.ManualSendScreen = ManualSendScreen;

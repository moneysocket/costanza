// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;


class AboutScreen {
    constructor(app_div) {
        this.app_div = app_div;
        this.onbackclick = null;
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

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, "About:",
                        "font-black text-2xl text-gray-500");
    }

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");
        this.drawBackButton(button_flex, this.onbackclick);
        this.drawTitle(title_flex);
    }

    drawInfoPanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        D.textParagraph(flex, "Costanza Wallet for Moneysocket v0.0.0",
                        "font-black text-2xl text-gray-500");
        D.textParagraph(flex, "Reckless! Use at your own risk!",
                        "font-black text-2xl text-gray-500");
        D.hyperlinkTabOpen(flex, "Wallet Source",
                           "https://github.com/moneysocket/costanza",
                           "font-black text-2xl text-gray-300 hover:bg-gray-900");
        D.hyperlinkTabOpen(flex, "Moneysocket Homepage", "https://socket.money",
                           "font-black text-2xl text-gray-300 hover:bg-gray-900");
        D.hyperlinkTabOpen(flex, "Telegram Chat", "https://t.me/moneysocket",
                           "font-black text-2xl text-gray-300 hover:bg-gray-900");
        D.hyperlinkTabOpen(flex, "Donate", "https://socket.money/#donate",
                           "font-black text-2xl text-gray-300 hover:bg-gray-900");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);

        var flex_mid = D.emptyDiv(flex, "flex-grow");
        this.drawInfoPanel(flex_mid);
        var flex_bottom = D.emptyDiv(flex, "flex-none");
    }
}

exports.AboutScreen = AboutScreen;

// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php


const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

const Screen = require('./screen.js').Screen;


class AboutScreen extends Screen {
    constructor(app_div) {
        super(app_div);

        this.onbackclick = null;

        this.title_string = "About";
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawInfoPanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-col section-background");
        D.textParagraph(flex, "Costanza Wallet for Moneysocket v0.0.0",
                        "text-subheading");
        D.textParagraph(flex, "Reckless! Use at your own risk!",
                        "text-subheading");
        D.hyperlinkTabOpen(flex, "Wallet Source",
                           "https://github.com/moneysocket/costanza",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Moneysocket Homepage", "https://socket.money",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Telegram Chat", "https://t.me/moneysocket",
                           "text-link");
        D.hyperlinkTabOpen(flex, "Donate", "https://socket.money/#donate",
                           "text-link");
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

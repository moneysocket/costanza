// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../../utl/dom.js').DomUtl;
var I = require('../../utl/icon.js').IconUtl;


class MenuScreen {
    constructor(app_div) {
        this.app_div = app_div;
        this.onbackclick = null;

        this.onwalletproviderclick = null;
        this.onappconsumerclick = null;
        this.onbolt11receiveclick = null;
        this.onstoragesettingsclick = null;
        this.onstoragesettingsclick = null;
        this.onaboutclick = null;
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
        D.textParagraph(flex, "MENU:",
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

    drawWalletProviderEntry(div) {
        var d = D.emptyDiv(div,
                           "bg-gray-500 hover:bg-gray-300 text-gray-300 py-2");
        d.onclick = (function() {
            this.onwalletproviderclick();
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.cog1x(icon_span);
        D.textSpan(flex, "Wallet Provider Connection", "flex-grow text-sm");
    }

    drawAppConsumerEntry(div) {
        var d = D.emptyDiv(div,
                           "bg-gray-500 hover:bg-gray-300 text-gray-300 py-2");
        d.onclick = (function() {
            this.onappconsumerclick();
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.cog1x(icon_span);
        D.textSpan(flex, "App Consumer Connection", "flex-grow text-sm");
    }

    drawCreateBolt11Entry(div) {
        var d = D.emptyDiv(div,
                           "bg-gray-500 hover:bg-gray-300 text-gray-300 py-2");
        d.onclick = (function() {
            this.onbolt11receiveclick();
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.bolt(icon_span);
        D.textSpan(flex, "Create Bolt11 To Recieve", "flex-grow text-sm");
    }

    drawStorageSettingsEntry(div) {
        var d = D.emptyDiv(div,
                           "bg-gray-500 hover:bg-gray-300 text-gray-300 py-2");
        d.onclick = (function() {
            this.onstoragesettingsclick();
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.floppy(icon_span);
        D.textSpan(flex, "Storage Settings", "flex-grow text-sm");
    }

    drawAboutEntry(div) {
        var d = D.emptyDiv(div,
                           "bg-gray-500 hover:bg-gray-300 text-gray-300 py-2");
        d.onclick = (function() {
            this.onaboutclick();
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        I.qcircle(icon_span);
        D.textSpan(flex, "About", "flex-grow text-sm");
    }

    drawEntryPanel(div) {
        var flex = D.emptyDiv(div,
                              "flex-col justify-evenly section-background");
        this.drawWalletProviderEntry(flex);
        this.drawAppConsumerEntry(flex);
        this.drawCreateBolt11Entry(flex);
        this.drawStorageSettingsEntry(flex);
        this.drawAboutEntry(flex);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw() {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none");
        this.drawTitlePanel(flex_top);
        this.drawEntryPanel(flex_top);
    }
}

exports.MenuScreen = MenuScreen;

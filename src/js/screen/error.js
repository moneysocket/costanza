// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var D = require('../utl/dom.js').DomUtl;
var I = require('../utl/icon.js').IconUtl;


class ErrorScreen {
    constructor(app_div) {
        this.app_div = app_div;
        this.onokclick = null;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawOkButton(div, back_func) {
        var b = D.button(div, back_func, "main-button");
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var back = I.checkcircle2x(icon_span);
        var text = D.textSpan(flex, "OK");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawErrorPanel(div, err_str) {
        var flex = D.emptyDiv(div, "flex-col section-background");
        var icon_flex = D.emptyDiv(flex, "text-yellow-700 py-4");
        I.exclaimcircle2x(icon_flex);
        var text_flex = D.emptyDiv(flex, "text-yellow-800");
        D.textParagraph(text_flex, "Error: " + err_str, "text-center py-10");
        var button_flex = D.emptyDiv(flex, "px-2 py-4");

        this.drawOkButton(button_flex, this.onokclick);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    draw(err_str) {
        var flex = D.emptyDiv(this.app_div, "flex flex-col h-screen");
        var flex_top = D.emptyDiv(flex, "flex-none h-10");
        var flex_mid = D.emptyDiv(flex, "flex-grow ");
        var flex_bottom = D.emptyDiv(flex, "flex-none h-10");

        this.drawErrorPanel(flex_mid, err_str);
    }
}

exports.ErrorScreen = ErrorScreen;

const D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

class Screen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Buttons
    ///////////////////////////////////////////////////////////////////////////

    drawButton(div, icon_func, button_text, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var qr = icon_func(icon_span);
        var text = D.textSpan(flex, button_text);
        b.inner_text_span = text;
        return b;
    }

    drawButtonPlain(div, button_text, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var text = D.textSpan(flex, button_text);
        b.inner_text_span = text;
        return b;
    }

    drawButtonPercent(div, pct, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, pct.toString() + "%");
        b.inner_text_span = text;
        return b;
    }

    drawBackButton(div, back_func) {
        return this.drawButton(div, I.backarrow2x, "Back", back_func,
                               "main-button");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Titles, Headings and Text
    ///////////////////////////////////////////////////////////////////////////

    drawTitle(div) {
        var flex = D.emptyDiv(div, "flex items-center justify-around");
        D.textParagraph(flex, this.title_string, "page-title");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Panels
    ///////////////////////////////////////////////////////////////////////////

    drawTitlePanel(div) {
        var flex = D.emptyDiv(div,
                              "flex flex-wrap section-background");
        var button_flex = D.emptyDiv(flex, "flex-initial px-2");
        var title_flex = D.emptyDiv(flex, "flex-initial px-5 py-2");
        this.drawBackButton(button_flex, this.onbackclick);
        this.drawTitle(title_flex);
    }

    drawMenuPanelEntry(div, click_func, icon_func, item_text) {
        var d = D.emptyDiv(div,
                           "bg-gray-800 hover:bg-gray-900 text-gray-300 py-2");
        d.onclick = (function() {
            click_func()
        }).bind(this);
        var flex = D.emptyDiv(d, "flex items-center justify-start");
        var icon_span = D.emptySpan(flex, "px-2 font-bold");
        icon_func(icon_span);
        D.textSpan(flex, item_text, "flex-grow text-sm");
    }

    ///////////////////////////////////////////////////////////////////////////
    // Screens
    ///////////////////////////////////////////////////////////////////////////

    screenDiv(div_style) {
        var flex = D.emptyDiv(this.app_div, div_style);
        return flex;
    }

}

exports.Screen = Screen;

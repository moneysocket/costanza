var D = require('../../utl/dom.js').DomUtl;
const I = require('../../utl/icon.js').IconUtl;

class Screen {
    constructor(app_div, model) {
        this.app_div = app_div;
        this.model = model;
    }
    
    drawButton(div, icon_func, button_text, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var icon_span = D.emptySpan(flex, "px-2");
        var qr = icon_func(icon_span);
        var text = D.textSpan(flex, button_text);
    }

    drawButtonPlain(div, button_text, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        var text = D.textSpan(flex, button_text);
    }

    drawButtonPercent(div, pct, click_func, button_type) {
        var b = D.button(div, click_func, button_type);
        var flex = D.emptyDiv(b, "flex items-center justify-around");
        D.textSpan(flex, pct.toString() + "%");
    }

    screenDiv(div_style) {
        var flex = D.emptyDiv(this.app_div, div_style);
        return flex;
    }

    drawBackButton(div, back_func) {
        this.drawButton(div, I.backarrow2x, "Back", back_func, "main-button");
    }

}

module.exports = Screen;

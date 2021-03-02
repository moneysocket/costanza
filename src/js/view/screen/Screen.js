var D = require('../../utl/dom.js').DomUtl;

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

    screenDiv(div_style) {
        var flex = D.emptyDiv(this.app_div, div_style);
        return flex;
    }
}

module.exports = Screen;

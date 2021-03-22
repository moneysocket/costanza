// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

class DomUtl {
    static deleteChildren(n) {
        n.innerHTML = "";
    }

    static setClass(element, class_str) {
        element.setAttribute("class", class_str);
    }

    static emptyDiv(div, class_str) {
        var d = document.createElement("div");
        div.appendChild(d);
        if (class_str != null) {
            DomUtl.setClass(d, class_str);
        }
        return d;
    }

    static emptyI(div, class_str) {
        var i = document.createElement("i");
        div.appendChild(i);
        if (class_str != null) {
            DomUtl.setClass(i, class_str);
        }
        return i;
    }

    static emptySpan(div, class_str) {
        var s = document.createElement("span");
        div.appendChild(s);
        if (class_str != null) {
            DomUtl.setClass(s, class_str);
        }
        return s;
    }

    static emptyVideo(div, class_str) {
        var v = document.createElement("video");
        div.appendChild(v);
        if (class_str != null) {
            DomUtl.setClass(v, class_str);
        }
        return v;
    }

    static emptyInput(div, class_str) {
        var i = document.createElement("input");
        div.appendChild(i);
        if (class_str != null) {
            DomUtl.setClass(i, class_str);
        }
        return i;
    }

    static emptyParagraph(div, class_str) {
        var p = document.createElement("p");
        div.appendChild(p);
        if (class_str != null) {
            DomUtl.setClass(p, class_str);
        }
        return p;
    }

    static textSpan(div, text, class_str) {
        var s = DomUtl.emptySpan(div, class_str);
        var t = document.createTextNode(text);
        s.appendChild(t);
        return s;
    }

    static hyperlinkTabOpen(div, text, url, class_str) {
        var i = document.createElement("a");
        i.setAttribute("href", url);
        i.setAttribute("target", "_blank");
        DomUtl.setClass(i, class_str);
        var t = document.createTextNode(text);
        i.appendChild(t);
        div.appendChild(i);
        return i;
    }

    static textParagraph(div, text, class_str) {
        var p = DomUtl.emptyParagraph(div, class_str);
        var t = document.createTextNode(text);
        p.appendChild(t);
        return p;
    }

    static button(div, onclick_func, class_str) {
        var b = document.createElement("button");
        b.onclick= onclick_func;
        if (class_str != null) {
            DomUtl.setClass(b, class_str);
        }
        div.appendChild(b);
        return b;
    }
}

exports.DomUtl = DomUtl;

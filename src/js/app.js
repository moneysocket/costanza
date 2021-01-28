// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var CostanzaView = require("./view.js").CostanzaView;
var CostanzaModel = require("./model.js").CostanzaModel;
var CostanzaController = require("./controller.js").CostanzaController;

class CostanzaApp {
    constructor() {
        this.app_div = document.getElementById("app");
        this.model = new CostanzaModel();
        this.view = new CostanzaView(this.app_div, this.model);
        this.controller = new CostanzaController(this.model, this.view);
    }

    start() {
        this.controller.start();
    }

    stop() {
        this.controller.stop();
    }
}

window.app = new CostanzaApp();
function drawFirstUi() {
    window.app.start()
}

function cleanUp() {
    window.app.stop()
}
window.addEventListener("load", drawFirstUi);
window.addEventListener("unload", cleanUp);


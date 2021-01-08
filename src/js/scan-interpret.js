// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const b11 = require("bolt11");
const MoneysocketBeacon = require("moneysocket").MoneysocketBeacon;

const CONNECT_STATE = require("./model.js").CONNECT_STATE;

class ScanInterpret {
    constructor(model) {
        this.model = model;
    }

    isWalletOnline() {
        return this.model.getConsumerConnectState() == CONNECT_STATE.CONNECTED;
    }

    isAppOnline() {
        return this.model.getProviderConnectState() == CONNECT_STATE.CONNECTED;
    }

    isBolt11(scan_str) {
        try {
            const decoded = b11.decode(scan_str);
            console.log(decoded);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    isBeacon(scan_str) {
        var [beacon, err] = MoneysocketBeacon.fromBech32Str(scan_str);
        if (beacon == null) {
            return false;
        }
        return true;
    }

    interpret_action(scan_str) {
        var is_bolt11 = this.isBolt11(scan_str);
        var is_beacon = this.isBeacon(scan_str);

        if (! (is_bolt11 || is_beacon)) {
            return "PARSE_ERROR";
        }
        if (is_bolt11 && this.isWalletOnline()) {
            return "PAY_BOLT11_MANUALLY";
        }
        if (is_bolt11 && ! this.isWalletOnline()) {
            return "PAY_BOLT11_MANUALLY_ERROR";
        }
        if (is_beacon && ! this.isWalletOnline()) {
            return "CONNECT_WALLET_BEACON";
        }
        if (is_beacon && this.isWalletOnline() && ! this.isAppOnline()) {
            return "CONNECT_APP_BEACON";
        }
        console.assert(is_beacon && this.isAppOnline() &&
                       this.isWalletOnline());
        return "CONNECT_BEACON_ERROR";
    }
}

exports.ScanInterpret = ScanInterpret;

// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

var b11 = require("bolt11");
var MoneysocketBeacon = require("moneysocket").MoneysocketBeacon;

class ScanInterpret {
    constructor() {
        this.wallet_online = false;
        this.app_online = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Context
    ///////////////////////////////////////////////////////////////////////////

    set_wallet_socket_online() {
        this.wallet_online = true;
    }

    set_wallet_socket_offline() {
        this.wallet_online = false;
    }

    set_app_socket_online() {
        this.app_online = true;
    }

    set_app_socket_offline() {
        this.app_online = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // validation
    ///////////////////////////////////////////////////////////////////////////

    is_bolt11(scan_str) {
        try {
            const decoded = b11.decode(scan_str);
            console.log(decoded);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    is_beacon(scan_str) {
        var [beacon, err] = MoneysocketBeacon.fromBech32Str(scan_str);
        if (beacon == null) {
            return false;
        }
        return true;
    }

    interpret_action(scan_str) {
        var is_bolt11 = this.is_bolt11(scan_str);
        var is_beacon = this.is_beacon(scan_str);

        if (! (is_bolt11 || is_beacon)) {
            return "PARSE_ERROR";
        }
        if (is_bolt11 && this.wallet_online) {
            return "PAY_BOLT11_MANUALLY";
        }
        if (is_bolt11 && ! this.wallet_online) {
            return "PAY_BOLT11_MANUALLY_ERROR";
        }
        if (is_beacon && ! this.wallet_online) {
            return "CONNECT_WALLET_BEACON";
        }
        if (is_beacon && this.wallet_online && ! this.app_online) {
            return "CONNECT_APP_BEACON";
        }
        console.assert(is_beacon && this.app_online && this.wallet_online);
        return "CONNECT_BEACON_ERROR";
    }
}

exports.ScanInterpret = ScanInterpret;

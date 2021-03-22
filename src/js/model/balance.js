// Copyright (c) 2021 Moneysocket Developers
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Wad = require("moneysocket").Wad;

class Balance {
    constructor(model) {
        this.model = model;
        this.incoming_wad = Wad.bitcoin(0);
        this.incoming_payee = false;
        this.incoming_payer = false;
        this.socket_wad = Wad.bitcoin(0);
        this.socket_payee = true;
        this.socket_payer = true;
    }

    setIncomingProviderInfo(wad, payee, payer) {
        this.incoming_wad = wad;
        this.incoming_payee = payee;
        this.incoming_payer = payer;

        this.calcSocketPayee();
        this.calcSocketPayer();
        this.calcSocketWad();
    }

    setSocketPayee(payee) {
        this.socket_payee = payee;
    }

    setSocketPayer(payer) {
        this.socket_payer = payer;
    }

    setSocketWad(wad) {
        this.socket_wad = wad;
    }

    calcSocketPayee() {
        return this.incoming_payee && this.socket_payee;
    }

    calcSocketPayer() {
        return this.incoming_payer && this.socket_payer;
    }

    calcSocketWad() {
        if (this.incoming_wad.msats < this.socket_wad.msats) {
            return this.incoming_wad;
        }
        return this.socket_wad;
    }

    incrementSocketBalance(msats) {
        var current_msats = this.socket_wad.msats;
        var new_msats = current_msats + msats;
        this.socket_wad = Wad.clone_msats(this.socket_wad, new_msats);
    }

    decrementSocketBalance(msats) {
        var current_msats = this.socket_wad.msats;
        var new_msats = current_msats - msats;
        this.socket_wad = Wad.clone_msats(this.socket_wad, new_msats);
    }

    hasSocketBalanceAvailable(msats) {
        return this.socket_wad.msats >= msats;
    }

    hasManualBalanceAvailable(msats) {
        return this.incoming_wad.msats >= msats;
    }

    getSocketProviderInfo() {
        return {'ready':        true,
                'payer':        this.calcSocketPayer(),
                'payee':        this.calcSocketPayee(),
                'wad':          this.calcSocketWad(),
                'account_uuid': this.model.getStoredAccountUuid()}
    }
}

exports.Balance = Balance;

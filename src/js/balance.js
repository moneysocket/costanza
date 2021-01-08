// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Wad = require("moneysocket").Wad;

class Balance {
    constructor(model) {
        this.model = model;
        this.incoming_wad = Wad.bitcoin(0);
        this.incoming_payee = false;
        this.incoming_payer = false;

        this.outgoing_wad = Wad.bitcoin(0);
        this.outgoing_payee = true;
        this.outgoing_payer = true;
    }

    setIncomingProviderInfo(wad, payee, payer) {
        this.incoming_wad = wad;
        this.incoming_payee = payee;
        this.incoming_payer = payer;
        this.calcOutgoingPayee();
        this.calcOutgoingPayer();
        this.calcOutgoingWad();
    }

    setOutgoingPayee(payee) {
        this.outgoing_payee = payee;
    }

    setOutgoingPayer(payer) {
        this.outgoing_payer = payer;
    }

    calcOutgoingPayee() {
        return this.incoming_payee && this.outgoing_payee;
    }

    calcOutgoingPayer() {
        return this.incoming_payer && this.outgoing_payer;
    }

    calcOutgoingWad() {
        // TODO
        return this.incoming_wad;
    }

    getOutgoingProviderInfo() {
        return {'ready':        true,
                'payer':        this.calcOutgoingPayer(),
                'payee':        this.calcOutgoingPayee(),
                'wad':          this.calcOutgoingWad(),
                'account_uuid': this.model.getStoredAccountUuid()}
    }
}

exports.Balance = Balance;

// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;


class ManualReceiveReceipt {
    static newManualReceive() {
        var uuid = Uuid.uuidv4();
        var time = Timestamp.getNowTimestamp();
        var req = {'type':         'manual_receive',
                   'receipt_uuid': uuid,
                   'time':         time,
                   'entries':      [],
                  };
        return req;
    }

    static manualReceiveRequestInvoiceEntry(msats, request_uuid) {
        var entry = {'type':         'request_invoice',
                     'time':         Timestamp.getNowTimestamp(),
                     'msats':        msats,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static manualReceiveGotInvoiceEntry(bolt11, request_reference_uuid, timeout,
                                        payment_hash)
    {
        var entry = {'type':                   'got_invoice',
                     'time':                   Timestamp.getNowTimestamp(),
                     'bolt11':                 bolt11,
                     'timeout':                timeout,
                     'payment_hash':           payment_hash,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualReceiveGotPreimageEntry(preimage, payment_hash,
                                         request_reference_uuid)
    {
        var entry = {'type':                   'got_preimage',
                     'time':                   Timestamp.getNowTimestamp(),
                     'preimage':               preimage,
                     'payment_hash':           payment_hash,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualReceiveInfo(manual_receive) {
        console.log("manual_receive: " + JSON.stringify(manual_receive));
        var entries = manual_receive['entries']
        var completed = ((entries.length == 3) &&
                         entries[2]['type'] == 'got_preimage');
        var got_invoice = ((entries.length >= 2) &&
                           entries[1]['type'] == 'got_invoice');

        var msats = entries[0]['msats'];
        var now = Timestamp.getNowTimestamp();
        var expired = got_invoice ? (now > entries[1]['timeout']) : false;
        return [got_invoice, completed, msats, expired];
    }
}

exports.ManualReceiveReceipt = ManualReceiveReceipt;

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

    static manualReceiveInvoiceRequestEntry(wad, request_uuid) {
        var entry = {'type':         'invoice_request',
                     'time':         Timestamp.getNowTimestamp(),
                     'wad':          wad,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static manualReceiveInvoiceNotifiedEntry(bolt11, request_reference_uuid,
                                             timeout, payment_hash)
    {
        var entry = {'type':                   'invoice_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'bolt11':                 bolt11,
                     'timeout':                timeout,
                     'payment_hash':           payment_hash,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualReceivePreimageNotifiedEntry(preimage, payment_hash,
                                              request_reference_uuid)
    {
        var entry = {'type':                   'preimage_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'preimage':               preimage,
                     'payment_hash':           payment_hash,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualReceiveErrorEntry(error_msg, request_reference_uuid)
    {
        var entry = {'type':                   'error',
                     'time':                   Timestamp.getNowTimestamp(),
                     'error_msg':              error_msg,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static manualReceiveInfo(manual_receive) {
        //console.log("manual_receive: " + JSON.stringify(manual_receive));
        var entries = manual_receive['entries']
        var completed = ((entries.length == 3) &&
                         entries[2]['type'] == 'preimage_notified');
        var got_invoice = ((entries.length >= 2) &&
                           entries[1]['type'] == 'invoice_notified');
        var error = (((entries.length >= 2) && entries[1]['type'] == 'error') ?
                     entries[1]['error_msg'] : null);

        var wad = entries[0]['wad'];
        var now = Timestamp.getNowTimestamp();
        var expired = got_invoice ? (now > entries[1]['timeout']) : false;
        return [error, got_invoice, completed, wad, expired];
    }
}

exports.ManualReceiveReceipt = ManualReceiveReceipt;

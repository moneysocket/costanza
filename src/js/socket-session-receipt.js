// Copyright (c) 2021 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;

class SocketSessionReceipt {
    //////////////////////////////////////////////////////////////////////////
    // session lifecycle
    //////////////////////////////////////////////////////////////////////////

    static newSession() {
        var uuid = Uuid.uuidv4();
        var time = Timestamp.getNowTimestamp();
        var session = {'type':         'socket_session',
                       'receipt_uuid': uuid,
                       'time':         time,
                       'entries':      [],
                      };
        return session;
    }

    static sessionStartEntry() {
        var entry = {'type': 'session_start',
                     'time':  Timestamp.getNowTimestamp(),
                    };
        return entry;
    }

    static invoiceRequestEntry(msats, request_uuid) {
        var entry = {'type':         'invoice_request',
                     'time':         Timestamp.getNowTimestamp(),
                     'msats':        msats,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static payRequestEntry(bolt11, msats, request_uuid) {
        var entry = {'type':         'pay_request',
                     'time':         Timestamp.getNowTimestamp(),
                     'msats':        msats,
                     'bolt11':       bolt11,
                     'request_uuid': request_uuid,
                    };
        return entry;
    }

    static preimageNotifiedEntry(preimage, increment, msats,
                                 request_reference_uuid)
    {
        var entry = {'type':                   'preimage_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'preimage':               preimage,
                     'increment':              increment,
                     'msats':                  msats,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static invoiceNotifiedEntry(bolt11, request_reference_uuid) {
        var entry = {'type':                   'invoice_notified',
                     'time':                   Timestamp.getNowTimestamp(),
                     'bolt11':                 bolt11,
                     'request_reference_uuid': request_reference_uuid,
                    };
        return entry;
    }

    static errNotifiedEntry(err) {
        var entry = {'type':  'error_notified',
                     'time':  Timestamp.getNowTimestamp(),
                     'error': err,
                    };
        return entry;
    }

    static sessionEndEntry() {
        var entry = {'type': 'session_end',
                     'time':  Timestamp.getNowTimestamp(),
                    };
        return entry;
    }

    //////////////////////////////////////////////////////////////////////////
    // session info calcluation
    //////////////////////////////////////////////////////////////////////////

    static isSessionEnded(session) {
        console.assert(session['type'] == "socket_session")
        var entries = session['entries']
        return entries[entries.length - 1]['type'] == 'session_end';
    }

    static sessionSettledInfo(session) {
        var entries = session['entries'];
        var total_msats = 0;
        var total_txs = 0;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i]['type'] == 'preimage_notified') {
                if (entries[i]['increment']) {
                    total_msats += entries[i]['msats'];
                } else {
                    total_msats -= entries[i]['msats'];
                }
                total_txs++;
            }
        }
        return [total_msats, total_txs];
    }
}


exports.SocketSessionReceipt = SocketSessionReceipt;

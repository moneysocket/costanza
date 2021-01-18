// Copyright (c) 2020 Jarret Dyrbye
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php

const Uuid = require("moneysocket").Uuid;
const Timestamp = require("moneysocket").Timestamp;
const Wad = require("moneysocket").Wad;

var ReceiptsDict = [
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'outgoing_bolt11',
     'bolt11':      'lnbcasdfasdfasd',
     'description': 'Sparkshot.io 300px: burp!',
     'value':       Wad.bitcoin(1000000),
    },
    {'receipt_id': Uuid.uuidv4(),
     'time':       Timestamp.getNowTimestamp(),
     'type':       'socket_session',
     'txs':        [{'socket_txid': Uuid.uuidv4(),
                     'direction':  'outgoing',
                     'status':     'settled',
                     'bolt11':     'lnbcasdfasdfasdlfajlsd',
                     'value':      Wad.bitcoin(123000),
                    },
                    {'socket_txid': Uuid.uuidv4(),
                     'direction':  'incoming',
                     'status':     'settled',
                     'bolt11':     'lnbc2342334',
                     'value':      Wad.bitcoin(22000),
                    },
                   ],
    },
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'incoming_bolt11',
     'description': null,
     'value':       Wad.bitcoin(444444),
    },
    {'receipt_id':  Uuid.uuidv4(),
     'time':        Timestamp.getNowTimestamp(),
     'type':        'outgoing_bolt11',
     'bolt11':      'lnbcasdfasdfasd',
     'description': 'Jukebox Play: C.R.E.A.M. - Wu Tang Clan ',
     'value':       Wad.bitcoin(6150),
    },
];



class Receipts {
}


exports.Receipts = Receipts;

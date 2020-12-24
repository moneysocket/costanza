#!/usr/bin/env python3
# Copyright (c) 2020 Jarret Dyrbye
# Distributed under the MIT software license, see the accompanying
# file LICENSE or http://www.opensource.org/licenses/mit-license.php
import sys

from twisted.internet import reactor, ssl
from twisted.python import log
from twisted.web.server import Site
from twisted.web.static import File

if __name__ == '__main__':
    log.startLogging(sys.stdout)
    # use the keys from the autobahn example repo
    contextFactory = ssl.DefaultOpenSSLContextFactory('keys/server.key',
                                                      'keys/server.crt')
    root = File("htdocs/")
    site = Site(root)
    print("serving SSL at localhost:8080");
    reactor.listenSSL(8080, site, contextFactory)
    reactor.run()

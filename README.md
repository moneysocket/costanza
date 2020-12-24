Costanza Wallet for Moneysocket
----
A work in progress wallet for [Moneysocket](https://socket.money).

![Costanza](img/costanza.jpeg)

A wallet that is attempting to be approachable and usable, but who's purpose is still a bit utilitarian for helping out with Moneysocket development.

It needs to keep a record of all things to help with debugging and also show a little bit of how the Moneysocket protocol is intended to work for end-user usability.


Disclaimer!
-----

Moneysocket is still new, under development and is Reckless with your money. Use this stuff at your own risk.


Dependencies
------------------------------------------------------------------------

This depends on [js-moneysocket](https://github.com/moneysocket/js-moneysocket) which will need to be installed into `node_modules` prior to building this project.

Also, additional dependencies referenced are package.json


Dev webserver
------------------------------------------------------------------------

To access a camera from the browser for scanning QR, it needs to be served from a `https` server, or else the browser will be unhappy.

[server.py](server.py) is provided with some certs that can be given exceptions for `localhost` from your browser while developing.


Project Links
------------------------------------------------------------------------

- [Homepage](https://socket.money).
- [Twitter](https://twitter.com/moneysocket)
- [Telegram](https://t.me/moneysocket)
- [Donate](https://socket.money/#donate)

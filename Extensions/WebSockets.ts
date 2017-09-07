interface IWebSocket {
    init: (webSocketHandlerUrl: string) => void;
    send: (data: string) => void;
    close: () => void;
}

namespace dcore.plugins.websockets {
    export class WebSocketManager implements IWebSocket {
        socket: WebSocket;
        webSocketStatusChecker: number;
        webSocketCheckTimeoutInterval = 60000;
        webSocketHandlerUrl: string;
        onSocketMessageReceived: (data: MessageEvent) => void;
        constructor(onSocketMessageReceived: (data: MessageEvent) => void) {
            this.onSocketMessageReceived = onSocketMessageReceived;
        }

        init(webSocketHandlerUrl: string): void {
            try {
                this.webSocketHandlerUrl = webSocketHandlerUrl;
                let protocol: string = window.location.protocol == "https:" ? "wss" : "ws";
                let host: string = location.hostname + (location.port ? ':' + location.port : '');
                let webSocketUrl = protocol + '://' + host + '/' + webSocketHandlerUrl;
                var that = this;
                this.socket = new WebSocket(webSocketUrl);
                this.socket.onopen = function () {
                    console.log("open " + new Date());
                };
                this.socket.onmessage = function (evt: MessageEvent) {
                    that.onSocketMessageReceived(evt);
                };
                this.socket.onerror = function (evt: ErrorEvent) {
                    console.log("Error: " + evt);
                };
                this.socket.onclose = function () {
                    console.info("close " + new Date());
                };
                if (this.webSocketStatusChecker == null) {
                    this.webSocketStatusChecker = setTimeout(this.CheckForWebSocketConnection.bind(this), this.webSocketCheckTimeoutInterval);
                }
            }
            catch (ex) {
                console.info(ex);
                if (this.webSocketStatusChecker == null) {
                    this.webSocketStatusChecker = setTimeout(this.CheckForWebSocketConnection.bind(this), this.webSocketCheckTimeoutInterval);
                }
            }
        }

        CheckForWebSocketConnection(): void {
            if (this.socket.readyState > 1) {
                clearTimeout(this.webSocketStatusChecker);
                this.webSocketStatusChecker = null;
                this.init(this.webSocketHandlerUrl);
            }
            this.webSocketStatusChecker = setTimeout(this.CheckForWebSocketConnection.bind(this), this.webSocketCheckTimeoutInterval);
        }

        send(data: string, retryCounter: number = 0): void {
            if (retryCounter > 5) {
                return;
            }
            if (this.socket.readyState == 1) {
                this.socket.send(data);
                return;
            }
            setTimeout(this.send.bind(this, data, retryCounter + 1), 1500);
        }

        close(): void {
            this.socket.close();
            if (this.webSocketStatusChecker != null) {
                clearTimeout(this.webSocketStatusChecker);
                this.webSocketStatusChecker = null;
            }
        }
    }
}

interface DCore {
    useWebSocket(): void;
    websocket: dcore.plugins.websockets.WebSocketManager;
}

interface WebSocketExtension {
    websocket: typeof dcore.plugins.websockets.WebSocketManager
}

namespace dcore {
    "use strict";

    import webSocketExt = plugins.websockets;

    export interface Instance {
        useWebSocket(): void;
        websocket: dcore.plugins.websockets.WebSocketManager;
    }

    Instance.prototype.useWebSocket = function (): void {
        let that = <DCore>this;
        if (that.websocket) {
            return;
        }

        var onMessageReceived = function (data: MessageEvent) {
            that.publish("WebSocketDataReceived", data);
        };

        that.websocket = new webSocketExt.WebSocketManager(onMessageReceived);
    };
}
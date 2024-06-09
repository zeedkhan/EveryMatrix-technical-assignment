import { createServer } from "http";
import { Server, Socket as ServerSocket } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { assert } from "chai";
import { AddMessageToRoomProps, ClientToServerEvents, ServerToClientEvents } from "../../typings";


describe("my awesome project", () => {
    let io: Server, serverSocket: ServerSocket<ServerToClientEvents, ClientToServerEvents>, clientSocket: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
    // let io, serverSocket, clientSocket;

    before((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as any).port;
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            clientSocket = Client(`http://localhost:${port}`);
            clientSocket.on("connect", done);
        });
    });


    after(() => {
        io.close();
        clientSocket.close();
    });


    it("should work", (done) => {
        const payload: AddMessageToRoomProps = {
            "chatRoomId": "room1",
            "createdAt": "2021-06-26T19:00:00",
            "id": "123",
            "text": "Hello",
            "type": "TEXT",
            "userId": "user1"
        }
        serverSocket.on("receiveMessage", (data) => {
            assert.equal(data, payload);
            done();
        });
        clientSocket.emit("message", payload);

    });

});
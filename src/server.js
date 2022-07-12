import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  // socket은 브라우저단에서 연결을 시도할 때마다 하나씩 생성된다(3 way handshake 때처럼 소켓 생성은 당연한거니까)
  console.log("Connected to browser");
  socket.nickname = "익명";
  socket.on("close", () => console.log("Disconnected from Browser"));
  // 서버 쪽은 브라우저가 닫히면 일어나는 이벤트
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "mew_message":
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname} : ${message.payload}`);
        });
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);

// flow 정리
// 1) WEBSOCKET 부분은 expressJS 서버로 만들어서 HTTP서버로 만든걸 다시 WEBSOCKET으로 감싸서 배포
// 2) HTTP 서버는 따로 3000에 배포
// 3) 그래서 클라이언트는 렌더링 하자마자 Websocket을 만들고, localhost 3000에 연결하되, 스키마를 ws로 하고 연결
// 4) 이렇게 하면 서로 웹소켓으로 연결이 된 것임(서버 쪽에선 웹소켓 서버를 만들어서 띄웠고, 클라이언트에서는 연결 요청해서 연결한 것)
// 5) 서버가 죽으면(혹은 다운되면) => 클라이언트에서 close event가 activate 됨.

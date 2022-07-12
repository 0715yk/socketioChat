import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
wsServer.on("connection", (socket) => {
  socket["nickname"] = "익명 사용자";
  socket.on("enter_room", (roomName, done) => {
    done();
    socket.join(roomName);
    socket.to(roomName).emit("welcome", socket.nickname);
  });

  socket.on("new_message", (message, roomName, done) => {
    done();
    socket.to(roomName).emit("new_message", `${socket.nickname} : ${message}`);
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);

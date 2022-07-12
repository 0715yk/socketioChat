const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = `${message.data}`;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});

function handleMessageSubmit(event) {
  event.preventDefault();

  const input = messageForm.querySelector("input");
  socket.send(
    JSON.stringify({
      type: "mew_message",
      payload: input.value,
    })
  );
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(
    JSON.stringify({
      type: "nickname",
      payload: input.value,
    })
  );
  input.value = "";
}

messageForm.addEventListener("submit", handleMessageSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

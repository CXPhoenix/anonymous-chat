import "./index.css";

let userName = "";
let userToken = "";
let ws = "";

const modal = document.querySelector("#signInModal");
const nameForm = document.querySelector("#nameForm");

const url = "ws://127.0.0.1:8000/ws/"

if (
  window.localStorage.getItem("userToken") &&
  window.localStorage.getItem("userName")
) {
  userName = window.localStorage.getItem("userName");
  userToken = window.localStorage.getItem("userToken");
  modal.classList.add("hidden");
  ws = new WebSocket(`${url}${userToken}`);
  ws.onmessage = (e) => websocketOnmessage(e);
}

nameForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = nameForm["name"];
  window.localStorage.setItem("userName", name.value);
  window.localStorage.setItem(
    "userToken",
    window.btoa(`${name.value}-${new Date().getTime()}`)
  );
  name.value = "";
  modal.classList.add("hidden");
  ws = new WebSocket(
    `${url}${window.localStorage.getItem("userToken")}`
  );
  ws.onmessage = (e) => websocketOnmessage(e);
});

const messageInputer = document.querySelector("#messageInputer");
const messageBox = document.querySelector("#messageBox");
const templateMessageFrom = document.querySelector("#ConversationFrom");
const templateMessageTo = document.querySelector("#ConversationTo");
messageInputer.addEventListener("submit", function (e) {
  e.preventDefault();
  const message = messageInputer["messageInput"];
  if (!message.value) return;
  // testMessage(templateMessageTo, message.value);
  // testMessage(templateMessageFrom, message.value, "test001");S
  ws.send(JSON.stringify({ message: message.value }));
  message.value = "";
});

function autoScrollBox() {
  if (messageBox.clientHeight < messageBox.scrollHeight) {
    messageBox.classList.add("overflow-y-scroll");
  }
}

function testMessage(templateNode, message, username = "me") {
  const tmt = templateNode;
  tmt.content.querySelector("#message").innerText = message;
  tmt.content.querySelector("#name").innerText = username;
  const clone = document.importNode(tmt.content, true);
  messageBox.appendChild(clone);
  autoScrollBox();
  messageBox.scrollTo(0, messageBox.scrollHeight);
  // console.log(messageBox.clientHeight, messageBox.scrollHeight);
}

function websocketOnmessage(event) {
  console.log(event);
  const receiveDatas = JSON.parse(event.data);
  receiveDatas.forEach((receiveData) => {
    if (receiveData.client_token == window.localStorage.getItem("userToken")) {
      testMessage(templateMessageTo, receiveData.message);
      return;
    }
    const token = window.atob(receiveData.client_token);
    const user = token.split("-")[0];
    console.log(user);
    testMessage(templateMessageFrom, receiveData.message, user);
  });
}

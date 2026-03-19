const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const agent = require("../Agent/Agent");

async function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};

    if (!token) {
      return next(new Error("Token Not provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;
      socket.token = token;
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  });

  io.on("connection", (socket) => {

    socket.on("message", async (data) => {
      
      const agentResponse = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: data,
            },
          ],
        },
        {
          metadata: {
            token: socket.token,
          },
        },
      );
      const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];
      socket.emit("message", lastMessage.content);
    });

    console.log("a user connected");
  });
}
module.exports = { initSocketServer };
//$ npm i @langchain/core @langchain/langgraph @langchain/google-genai zod

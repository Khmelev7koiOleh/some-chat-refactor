import { PeerServer } from "peer";

const peerServer = PeerServer({
  port: 9000,
  path: "/myapp",
  allow_discovery: true,
  corsOptions: {
    origin: "https://glittering-sherbet-1af8d3.netlify.app/",
    methods: ["GET", "POST"],
  },
});

console.log("PeerJS server running on port 9000");

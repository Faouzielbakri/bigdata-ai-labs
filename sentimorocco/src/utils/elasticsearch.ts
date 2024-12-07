import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: "https://localhost:9200",
  auth: {
    username: process.env.ELASTIC_USERNAME || "elastic",
    password: process.env.ELASTIC_PASSWORD || "",
  },
  tls: {
    ca: process.env.CA_CERT, // Path to http_ca.crt
    rejectUnauthorized: false,
  },
});

export default client;

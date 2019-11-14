import {JSONRPCClient, createJSONRPCErrorResponse} from "json-rpc-2.0";
const client = new JSONRPCClient(
  function (jsonRPCRequest) {
    fetch("http://localhost:7000/json-rpc", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(jsonRPCRequest)
    }).then(function (response) {
      if (response.status === 200
      ) {
        // Use client.receive when you received a JSON-RPC response.
        return response.json().then(function (jsonRPCResponse) {
            client.receive(jsonRPCResponse)
          }
        );
      }
      else if (jsonRPCRequest.id !== undefined) {
        return Promise.reject(new Error(response.statusText));
      }
    })
  }
);

// Use client.request to make a JSON-RPC request call.
// The function returns a promise of the result.
client.request("echo", {text: "Hello, World!"}).then(function(result){ console.log(result)});

// Use client.notify to make a JSON-RPC notification call.
// By definition, JSON-RPC notification does not respond.
client.notify("log", {message: "Hello, World!"});
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi"; // ES Modules import
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

async function getAllConnectionIds() {
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  const command = new ScanCommand({
    TableName: "manage-peacock-connections",
    ProjectionExpression: "connectionId", // Only retrieve the connectionId attribute
  });

  try {
    const response = await dynamoClient.send(command);
    const connectionIds = response.Items.map((item) => item.connectionId);
    return connectionIds;
  } catch (error) {
    console.error("Error retrieving connection IDs:", error);
    throw error;
  }
}

export const handler = async (event) => {
  console.log("Started Function!!")
  const connectionIds = await getAllConnectionIds();
  console.log(connectionIds);

  const domainName = event.requestContext.domainName;  // e.g., "abcdef1234.execute-api.us-west-2.amazonaws.com"
  const stage = event.requestContext.stage;            // e.g., "prod"
  const userConnectionId = event.requestContext.connectionId;  // The unique connection ID

  // Construct the API Gateway Management API endpoint
  const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
      endpoint: `https://${domainName}/${stage}`
  });

  const message = JSON.stringify({
    command: "play",
    time: "10:00",
  });
  connectionIds.forEach(async (connectionId) => {
    if (userConnectionId === connectionId) {
      return;
    }
    const input = {
      // PostToConnectionRequest
      Data: "playVideo", // e.g. Buffer.from("") or new TextEncoder().encode("")   // required
      ConnectionId: connectionId, // required
    };

    const command = new PostToConnectionCommand(input);
    const client_response = await apiGatewayManagementApi.send(command);

    console.log(client_response);
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify("Play initiated"),
  };
  return response;
};

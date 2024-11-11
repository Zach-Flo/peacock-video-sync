import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const timestamp = new Date().toISOString();
    const command = new PutCommand({
        TableName: 'manage-peacock-connections',
        Item: {
            connectionId: connectionId,
            lastActiveAt: timestamp
        }
    });
    
    const response = await docClient.send(command);
    console.log(response);
    
    return {
        statusCode: 200
    }
};

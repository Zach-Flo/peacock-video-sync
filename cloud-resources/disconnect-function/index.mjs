import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const command = new DeleteCommand({
        TableName: 'manage-peacock-connections',
        Key: {
            connectionId: connectionId
        }
    });
    
    const response = await docClient.send(command)
    console.log(response)
    return { statusCode: 200 }
};

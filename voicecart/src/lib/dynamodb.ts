import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

function getConfig() {
  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local');
  }

  return {
    region,
    credentials: { accessKeyId, secretAccessKey },
  };
}

let client: DynamoDBDocumentClient | null = null;

export function getDynamoClient(): DynamoDBDocumentClient {
  if (client) return client;
  const ddb = new DynamoDBClient(getConfig());
  client = DynamoDBDocumentClient.from(ddb);
  return client;
}

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'VoiceCart';

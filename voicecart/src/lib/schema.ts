import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { TABLE_NAME } from './dynamodb';

export async function createTable() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' },
        { AttributeName: 'gsi2pk', AttributeType: 'S' },
        { AttributeName: 'gsi2sk', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'gsi1pk', KeyType: 'HASH' },
            { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'GSI2',
          KeySchema: [
            { AttributeName: 'gsi2pk', KeyType: 'HASH' },
            { AttributeName: 'gsi2sk', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log(`Table ${TABLE_NAME} created successfully`);
  } catch (err: any) {
    if (err.name === 'ResourceInUseException') {
      console.log(`Table ${TABLE_NAME} already exists`);
    } else {
      throw err;
    }
  }
}

export const Keys = {
  user(email: string) { return { pk: `USER#${email}`, sk: 'PROFILE' }; },
  userByEmail(email: string) { return { gsi1pk: `EMAIL#${email.toLowerCase()}`, gsi1sk: 'PROFILE' }; },
  cart(cartId: string) { return { pk: `CART#${cartId}`, sk: 'META' }; },
  cartItem(cartId: string, itemId: string) { return { pk: `CART#${cartId}`, sk: `ITEM#${itemId}` }; },
  cartByCode(code: string) { return { gsi2pk: `CODE#${code.toUpperCase()}`, gsi2sk: 'META' }; },
  cartItems(cartId: string) { return { pk: `CART#${cartId}`, sk: 'ITEM#' }; },
  member(memberId: string) { return { pk: `MEMBER#${memberId}`, sk: 'PROFILE' }; },
  allMembers() { return { pk: 'MEMBER#', sk: 'PROFILE' }; },
  order(orderId: string) { return { pk: `ORDER#${orderId}`, sk: 'META' }; },
  userOrders(userId: string) { return { pk: `USERORDER#${userId}`, sk: 'ORDER#' }; },
  coins(userId: string) { return { pk: `COINS#${userId}`, sk: 'BALANCE' }; },
  coinTransaction(userId: string, txId: string) { return { pk: `COINS#${userId}`, sk: `TX#${txId}` }; },
  invite(code: string) { return { pk: `INVITE#${code.toUpperCase()}`, sk: 'META' }; },
};

export const GSI1 = 'GSI1';
export const GSI2 = 'GSI2';

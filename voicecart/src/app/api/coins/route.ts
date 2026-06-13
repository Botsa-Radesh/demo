import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys } from '@/lib/schema';
import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const client = getDynamoClient();

    const balanceResult = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: Keys.coins(userId),
    }));

    const transactionsResult = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': `COINS#${userId}`, ':sk': 'TX#' },
      Limit: 50,
      ScanIndexForward: false,
    }));

    return NextResponse.json({
      balance: balanceResult.Item?.balance || 0,
      transactions: transactionsResult.Items || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, reason } = await req.json();
    if (!userId || !amount) {
      return NextResponse.json({ error: 'userId and amount required' }, { status: 400 });
    }

    const client = getDynamoClient();

    const balanceResult = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: Keys.coins(userId),
    }));

    const currentBalance = balanceResult.Item?.balance || 0;
    const newBalance = currentBalance + amount;

    await client.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.coins(userId),
      UpdateExpression: 'SET balance = :bal',
      ExpressionAttributeValues: { ':bal': newBalance },
    }));

    const txId = `tx-${Date.now()}`;
    await client.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...Keys.coinTransaction(userId, txId),
        id: txId,
        amount,
        reason: reason || 'Earned coins',
        balance: newBalance,
        createdAt: new Date().toISOString(),
      },
    }));

    return NextResponse.json({ balance: newBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

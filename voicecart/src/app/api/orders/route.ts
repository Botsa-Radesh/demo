import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys } from '@/lib/schema';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const client = getDynamoClient();
    const result = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': `USERORDER#${userId}`, ':sk': 'ORDER#' },
    }));

    return NextResponse.json({ orders: result.Items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();
    const client = getDynamoClient();

    const orderId = `ord-${Date.now()}`;

    const orderItem = {
      ...Keys.order(orderId),
      ...Keys.userOrders(order.userId || 'unknown'),
      id: orderId,
      ...order,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: orderItem }));

    return NextResponse.json({ order: orderItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

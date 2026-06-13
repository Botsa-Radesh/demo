import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys, GSI2 } from '@/lib/schema';
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function POST(req: NextRequest) {
  try {
    const { code, userId, memberId } = await req.json();
    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and userId required' }, { status: 400 });
    }

    const client = getDynamoClient();

    const result = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI2,
      KeyConditionExpression: 'gsi2pk = :pk',
      ExpressionAttributeValues: { ':pk': `CODE#${code.toUpperCase()}` },
    }));

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cart = result.Items[0];
    const memberIds = cart.memberIds || [];
    if (memberIds.includes(userId)) {
      return NextResponse.json({ cart });
    }

    memberIds.push(userId);
    if (memberId && !memberIds.includes(memberId)) {
      memberIds.push(memberId);
    }

    await client.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.cart(cart.id),
      UpdateExpression: 'SET memberIds = :mids',
      ExpressionAttributeValues: { ':mids': [...new Set(memberIds)] },
    }));

    return NextResponse.json({ cart: { ...cart, memberIds: [...new Set(memberIds)] } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

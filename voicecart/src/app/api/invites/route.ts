import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys } from '@/lib/schema';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const client = getDynamoClient();
    const result = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'begins_with(pk, :pk) AND sk = :sk',
      ExpressionAttributeValues: { ':pk': 'INVITE#', ':sk': 'META', ':uid': userId },
      FilterExpression: 'createdBy = :uid OR contains( pendingFor, :uid )',
    }));

    return NextResponse.json({ invites: result.Items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const invite = await req.json();
    const client = getDynamoClient();

    const code = invite.code;
    const item = {
      ...Keys.invite(code),
      code,
      cartName: invite.cartName || 'Common Cart',
      createdBy: invite.createdBy || 'unknown',
      pendingFor: invite.pendingFor || [],
      createdAt: new Date().toISOString(),
    };

    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return NextResponse.json({ invite: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { action, code, userId, memberId } = await req.json();
    const client = getDynamoClient();

    if (action === 'accept') {
      const cartResult = await client.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'gsi2pk = :pk AND sk = :sk',
        ExpressionAttributeValues: { ':pk': `CODE#${code.toUpperCase()}`, ':sk': 'META' },
      }));

      if (!cartResult.Items || cartResult.Items.length === 0) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
      }

      const cart = cartResult.Items[0];
      const memberIds = [...(cart.memberIds || []), userId].filter((v, i, a) => a.indexOf(v) === i);
      if (memberId) memberIds.push(memberId);

      await client.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.cart(cart.id),
        UpdateExpression: 'SET memberIds = :mids',
        ExpressionAttributeValues: { ':mids': [...new Set(memberIds)] },
      }));

      return NextResponse.json({ cart: { ...cart, memberIds: [...new Set(memberIds)] } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

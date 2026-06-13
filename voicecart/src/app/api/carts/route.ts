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
      KeyConditionExpression: 'begins_with(pk, :pk) AND sk = :sk',
      ExpressionAttributeValues: { ':pk': 'CART#', ':sk': 'META', ':uid': userId },
      FilterExpression: 'contains( memberIds, :uid )',
    }));

    return NextResponse.json({ carts: result.Items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cart = await req.json();
    const client = getDynamoClient();

    const cartId = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const code = generateCode();

    const item = {
      ...Keys.cart(cartId),
      ...Keys.cartByCode(code),
      id: cartId,
      code,
      name: cart.name || 'My Cart',
      type: cart.type || 'personal',
      splitMode: cart.splitMode || 'equal',
      memberIds: cart.memberIds || [cart.creatorId].filter(Boolean),
      items: [],
      createdBy: cart.creatorId || 'unknown',
      createdAt: new Date().toISOString(),
    };

    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return NextResponse.json({ cart: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

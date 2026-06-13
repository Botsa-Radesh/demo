import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys } from '@/lib/schema';
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = getDynamoClient();

    const result = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: Keys.cart(id),
    }));

    if (!result.Item) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const itemsResult = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': `CART#${id}`, ':sk': 'ITEM#' },
    }));

    return NextResponse.json({ cart: { ...result.Item, items: itemsResult.Items || [] } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = getDynamoClient();

    if (body.action === 'updateItem') {
      await client.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.cartItem(id, body.itemId),
        UpdateExpression: 'SET #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': body.updates },
      }));
      return NextResponse.json({ item: body.updates });
    }

    const allowed = ['name', 'splitMode', 'memberIds'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const setExpr = Object.keys(updates).map(k => `#${k} = :${k}`).join(', ');
    const attrNames: Record<string, string> = {};
    const attrValues: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      attrNames[`#${k}`] = k;
      attrValues[`:${k}`] = v;
    }

    await client.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.cart(id),
      UpdateExpression: `SET ${setExpr}`,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
    }));

    const result = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: Keys.cart(id),
    }));

    return NextResponse.json({ cart: result.Item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, item } = await req.json();
    const client = getDynamoClient();

    if (action !== 'addItem' || !item) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const itemId = `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cartItem = {
      ...Keys.cartItem(id, itemId),
      id: itemId,
      product: item.product,
      quantity: item.quantity || 1,
      addedBy: item.addedBy || 'unknown',
      isShared: item.isShared || false,
      checked: false,
    };

    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: cartItem }));

    return NextResponse.json({ item: cartItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { itemId } = await req.json();
    const client = getDynamoClient();

    await client.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: Keys.cartItem(id, itemId),
    }));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

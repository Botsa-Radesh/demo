import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys } from '@/lib/schema';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function GET() {
  try {
    const client = getDynamoClient();
    const result = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'begins_with(pk, :pk) AND sk = :sk',
      ExpressionAttributeValues: { ':pk': 'MEMBER#', ':sk': 'PROFILE' },
    }));

    return NextResponse.json({ members: result.Items || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const member = await req.json();
    const client = getDynamoClient();

    const memberId = member.id || `m${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const item = {
      ...Keys.member(memberId),
      id: memberId,
      name: member.name || 'Guest',
      avatar: member.avatar || '👤',
      role: member.role || 'member',
      diet: member.diet || 'veg',
      allergies: member.allergies || [],
      favoriteBrands: member.favoriteBrands || [],
      dislikes: member.dislikes || [],
      isOnline: true,
      isTyping: false,
      createdAt: new Date().toISOString(),
    };

    await client.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return NextResponse.json({ member: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { memberId, updates } = await req.json();
    if (!memberId || !updates) {
      return NextResponse.json({ error: 'memberId and updates required' }, { status: 400 });
    }

    const client = getDynamoClient();
    const setExpr = Object.keys(updates).map(k => `#${k} = :${k}`).join(', ');
    const attrNames: Record<string, string> = {};
    const attrValues: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      attrNames[`#${k}`] = k;
      attrValues[`:${k}`] = v;
    }

    await client.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: Keys.member(memberId),
      UpdateExpression: `SET ${setExpr}`,
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues,
    }));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

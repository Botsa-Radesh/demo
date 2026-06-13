import { NextRequest, NextResponse } from 'next/server';
import { getDynamoClient, TABLE_NAME } from '@/lib/dynamodb';
import { Keys, GSI1 } from '@/lib/schema';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name required' }, { status: 400 });
    }

    const client = getDynamoClient();

    const existing = await client.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI1,
      KeyConditionExpression: 'gsi1pk = :pk',
      ExpressionAttributeValues: { ':pk': `EMAIL#${email.toLowerCase()}` },
    }));

    if (existing.Items && existing.Items.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const userId = `u${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const user = { userId, email: email.toLowerCase(), name, password };

    await client.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...Keys.user(email.toLowerCase()),
        ...Keys.userByEmail(email.toLowerCase()),
        ...user,
        createdAt: new Date().toISOString(),
      },
    }));

    const member = {
      id: userId,
      name,
      avatar: '👤',
      role: 'creator',
      diet: 'non-veg',
      allergies: [],
      favoriteBrands: [],
      dislikes: [],
      isOnline: true,
      isTyping: false,
    };

    await client.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...Keys.member(userId),
        ...member,
        createdAt: new Date().toISOString(),
      },
    }));

    return NextResponse.json({ user: { ...user, password: undefined } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 });
  }
}

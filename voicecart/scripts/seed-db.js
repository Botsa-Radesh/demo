const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const envPath = require('path').join(__dirname, '..', '.env');
const envLocalPath = require('path').join(__dirname, '..', '.env.local');
require('dotenv').config({ path: envPath });
require('dotenv').config({ path: envLocalPath });

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'VoiceCart';

async function seed() {
  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ AWS credentials not found in .env.local');
    console.error('   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });

  try {
    const tables = await client.send(new ListTablesCommand({}));
    if (tables.TableNames?.includes(TABLE_NAME)) {
      console.log(`✅ Table "${TABLE_NAME}" already exists`);
    } else {
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
      console.log(`✅ Table "${TABLE_NAME}" created successfully`);
    }

    console.log('\n🎉 DynamoDB setup complete!');
    console.log(`   Table: ${TABLE_NAME}`);
    console.log(`   Region: ${region}`);
    console.log('\nNext: Run `npm run dev` and the API routes will use this table.');
  } catch (err) {
    console.error('❌ Failed to create table:', err);
    process.exit(1);
  }
}

seed();

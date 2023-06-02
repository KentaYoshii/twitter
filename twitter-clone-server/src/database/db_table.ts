import {
  CreateTableCommand,
  DeleteTableCommand,
  ResourceInUseException,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import config from "../config";
import { dynamoClient } from "./db_init";

export const deleteTable = async () => {
  const params = {
    TableName: config.TABLE_NAME,
  };
  try {
    await dynamoClient.send(new DeleteTableCommand(params));
    console.log("Table deleted");
  } catch (e: unknown) {
    if (e instanceof ResourceNotFoundException) {
      console.log("Table not found");
      return;
    }
    console.log("Error", e);
  }
};

export const createTable = async () => {
  const input = {
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
      {
        AttributeName: "entityType",
        AttributeType: "S",
      },
      {
        AttributeName: "entity",
        AttributeType: "S",
      },
      {
        AttributeName: "entityValue",
        AttributeType: "S",
      }
    ],
    TableName: config.TABLE_NAME,
    KeySchema: [
      {
        // Parition Key
        AttributeName: "id",
        KeyType: "HASH",
      },
      {
        // Sort Key
        AttributeName: "entityType",
        KeyType: "RANGE",
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: config.GSI1_NAME,
        KeySchema: [
          {
            AttributeName: "entity",
            KeyType: "HASH",
          },
          {
            AttributeName: "entityType",
            KeyType: "RANGE",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: config.GSI2_NAME,
        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
          {
            AttributeName: "entityValue",
            KeyType: "RANGE",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }
    ],
  };
  const cmd = new CreateTableCommand(input);
  try {
    await dynamoClient.send(cmd);
    console.log("Table created");
  } catch (e: unknown) {
    if (e instanceof ResourceInUseException) {
      console.log("Table already exists");
      return;
    }
    console.log("Error", e);
  }
};

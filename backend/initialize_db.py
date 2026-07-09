import os
from dotenv import load_dotenv
import botocore.exceptions

load_dotenv()

# Import the initialized dynamodb resource
from db import dynamodb

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "Users")

def create_users_table():
    try:
        table = dynamodb.Table(TABLE_NAME)
        table.load()
        print(f"Table '{TABLE_NAME}' already exists. Skipping creation.")
        return table
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            print(f"Table '{TABLE_NAME}' does not exist. Creating table...")
            table = dynamodb.create_table(
                TableName=TABLE_NAME,
                KeySchema=[
                    {"AttributeName": "email", "KeyType": "HASH"}
                ],
                AttributeDefinitions=[
                    {"AttributeName": "email", "AttributeType": "S"}
                ],
                ProvisionedThroughput={
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            )
            print("Waiting for table to be created...")
            table.wait_until_exists()
            print(f"Table '{TABLE_NAME}' created successfully.")
            return table
        else:
            raise e

if __name__ == "__main__":
    create_users_table()


from fastapi import HTTPException, status
from pydantic import BaseModel
from enum import Enum
import os
from decimal import Decimal
from db import dynamodb
from router import router
from boto3.dynamodb.conditions import Attr

USERS_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "Users")
PROFILES_TABLE_NAME = "userProfiles"

class GenderIdentity(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    NON_BINARY = "NON_BINARY"
    OTHER = "OTHER"

class PrimaryGoal(str, Enum):
    FAT_LOSS = "FAT_LOSS"
    MUSCLE_GAIN = "MUSCLE_GAIN"
    MAINTAINANCE = "MAINTAINANCE"

class DailyActivity(str, Enum):
    SEDENTARY = "SEDENTARY"
    LIGHTLY_ACTIVE = "LIGHTLY_ACTIVE"
    MODERATELY_ACTIVE = "MODERATELY_ACTIVE"
    VERY_ACTIVE = "VERY_ACTIVE"

class OnboardingRequest(BaseModel):
    fullName: str
    age: int
    genderIdentity: GenderIdentity
    height: float
    currentWeight: float
    primaryGoal: PrimaryGoal
    targetWeight: float
    dailyActivity: DailyActivity
    id: str  # Stating which user it is to identify

@router.post("/save-onboarding-data")
def save_onboarding_data(request: OnboardingRequest):
    try:
        profile_data = {
            "fullName": request.fullName,
            "age": request.age,
            "genderIdentity": request.genderIdentity.value,
            "height": Decimal(str(request.height)),
            "currentWeight": Decimal(str(request.currentWeight)),
            "primaryGoal": request.primaryGoal.value,
            "targetWeight": Decimal(str(request.targetWeight)),
            "dailyActivity": request.dailyActivity.value,
            "user": request.id,
        }
        
        profile_table = dynamodb.Table(PROFILES_TABLE_NAME)
        profile_table.put_item(Item=profile_data)
        
        users_table = dynamodb.Table(USERS_TABLE_NAME)
        
        scan_response = users_table.scan(
            FilterExpression=Attr("id").eq(request.id)
        )
        items = scan_response.get("Items", [])
        
        if not items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID '{request.id}' not found in Users table"
            )
            
        user_item = items[0]
        user_email = user_item["email"]
        
        users_table.update_item(
            Key={"email": user_email},
            UpdateExpression="SET isOnboarded = :val",
            ExpressionAttributeValues={":val": True}
        )
        
        return {
            "status": "success",
            "message": "Onboarding data saved successfully and user record updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving onboarding data: {str(e)}"
        )

@router.post("/update-onboarding-data")
def update_onboarding_data(request: OnboardingRequest):
    try:
        profile_table = dynamodb.Table(PROFILES_TABLE_NAME)
        profile_response = profile_table.get_item(Key={"user": request.id})
        if "Item" not in profile_response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile for user with ID '{request.id}' not found."
            )
            
        profile_data = {
            "fullName": request.fullName,
            "age": request.age,
            "genderIdentity": request.genderIdentity.value,
            "height": Decimal(str(request.height)),
            "currentWeight": Decimal(str(request.currentWeight)),
            "primaryGoal": request.primaryGoal.value,
            "targetWeight": Decimal(str(request.targetWeight)),
            "dailyActivity": request.dailyActivity.value,
            "user": request.id,
        }
        
        profile_table.put_item(Item=profile_data)
        
        return {
            "status": "success",
            "message": "Onboarding data updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating onboarding data: {str(e)}"
        )
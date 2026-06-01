from pydantic import BaseModel, Field, EmailStr

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    # Using EmailStr ensures proper format validation which satisfies "Validate all request data"
    email: EmailStr
    phone_number: str = Field(..., min_length=5, max_length=30)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from app.schemas.product import ProductResponse
from app.schemas.customer import CustomerResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity ordered must be greater than zero")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]
    customer: CustomerResponse

    class Config:
        from_attributes = True

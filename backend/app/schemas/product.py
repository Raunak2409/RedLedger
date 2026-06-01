from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    quantity_in_stock: int = Field(..., ge=0, description="Quantity in stock cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

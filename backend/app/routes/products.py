from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    # Business rule: SKU must be unique
    existing_product = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists"
        )
    
    new_product = Product(
        product_name=product_in.product_name,
        sku=product_in.sku,
        price=product_in.price,
        quantity_in_stock=product_in.quantity_in_stock
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.asc()).all()

@router.get("/{id}", response_model=ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    return product

@router.put("/{id}", response_model=ProductResponse)
def update_product(id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    
    # Check SKU uniqueness if changed
    if product.sku != product_in.sku:
        sku_exists = db.query(Product).filter(Product.sku == product_in.sku).first()
        if sku_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists"
            )
            
    product.product_name = product_in.product_name
    product.sku = product_in.sku
    product.price = product_in.price
    product.quantity_in_stock = product_in.quantity_in_stock
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    db.delete(product)
    db.commit()
    return None

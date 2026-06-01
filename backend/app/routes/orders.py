from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    # 1. Validate Customer
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with ID {order_in.customer_id} does not exist"
        )
    
    # 2. Validate Products and Inventory levels
    products_to_update = []
    total_amount = 0.0
    
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {item.product_id} does not exist"
            )
        
        # Business rule: Orders cannot be placed if inventory is insufficient
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for product '{product.product_name}'. Requested: {item.quantity}, Available: {product.quantity_in_stock}"
            )
            
        # Accumulate updates and totals
        total_amount += item.quantity * product.price
        products_to_update.append((product, item.quantity))
        
    # 3. Apply stock reduction and create order record
    new_order = Order(
        customer_id=order_in.customer_id,
        total_amount=total_amount
    )
    db.add(new_order)
    db.flush() # Gain order ID before item creation
    
    for product, quantity in products_to_update:
        # Business rule: Creating an order must automatically reduce stock
        product.quantity_in_stock -= quantity
        
        # Create order item record
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=quantity
        )
        db.add(order_item)
        
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.id.desc()).all()

@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found"
        )
    return order

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found"
        )
    
    # Note: If an order is deleted, do we restore stock? The rules do not specify this,
    # but standard cascading delete works. Let's delete the order cleanly.
    db.delete(order)
    db.commit()
    return None

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Customer, Order
from app.schemas import ProductResponse
from typing import List, Dict, Any

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=Dict[str, Any])
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Total products count
    total_products = db.query(Product).count()
    
    # 2. Total customers count
    total_customers = db.query(Customer).count()
    
    # 3. Total orders count
    total_orders = db.query(Order).count()
    
    # 4. Low stock products list (quantity_in_stock < 10 is standard threshold)
    low_stock_products = db.query(Product).filter(Product.quantity_in_stock < 10).order_by(Product.quantity_in_stock.asc()).all()
    
    # Format low stock products to schema format
    low_stock_formatted = [ProductResponse.from_orm(p) for p in low_stock_products]
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_formatted
    }

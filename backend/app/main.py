from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import products, customers, orders, dashboard

# Build all tables on startup (simplifies deployment & setup)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Full-stack system assessment REST API backend.",
    version="1.0.0"
)

# CORS setup for frontend communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers exactly
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Inventory & Order Management System API is running successfully."
    }

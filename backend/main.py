from models import Products
from fastapi import FastAPI

app = FastAPI()
products = [
    Products(id=1, name="Apple", price=100, image_url="image.jpg"),
    Products(id=2, name="Banana", price=200, image_url="image.jpg")
]
@app.get("/")
def func():

    return products


@app.get("/product/{id}")
def getData(id: int):
    for product in products:
        if product.id == id:
            return product


@app.post("/create")
def createProduct(product: Products):
    products.append(product)
    return products
        

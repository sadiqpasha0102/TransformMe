from pydantic import BaseModel

class Products(BaseModel):
    id: int
    name: str
    price: float
    image_url: str
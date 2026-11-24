from sqlmodel import Field, SQLModel

class UserCreate(SQLModel):
    username: str
    full_name: str
    email: str
    password: str = Field(min_length=8)


class TokenMessage(SQLModel):
    message: str
from pydantic import BaseModel, EmailStr

from app.models.user import RolUsuario


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: RolUsuario
    nombre: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    nombre: str
    rol: RolUsuario
    activo: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    nombre: str
    password: str
    rol: RolUsuario = RolUsuario.operario

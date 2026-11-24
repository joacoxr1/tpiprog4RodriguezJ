from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import TokenMessage, UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic


def get_auth_service() -> AuthService:
    return AuthService()

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    data: UserCreate,
    service: AuthService = Depends(get_auth_service),
):
    return service.register(data)


@router.post("/token", response_model=TokenMessage)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    username = service.authenticate(form_data.username, form_data.password)
    token = service.create_token_for_user(username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    return TokenMessage(message="Login exitoso")


@router.post("/logout", response_model=TokenMessage)
def logout(response: Response):
    response.delete_cookie("access_token")
    return TokenMessage(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(current_user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(current_user)
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])

@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    _: Usuario = Depends(require_role(["admin"])),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    _: Usuario = Depends(require_role(["admin"])),
):
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    assert current_user.id is not None
    return service.desactivar(usuario_id, current_user.id)
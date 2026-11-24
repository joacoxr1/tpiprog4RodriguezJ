from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def get_by_id_with_categoria(self, producto_id: int) -> Producto | None:
        return self.session.exec(
            select(Producto)
            .where(Producto.id == producto_id)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .execution_options(populate_existing=True)
        ).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
    ) -> tuple[list[Producto], int]:
        query = select(Producto).options(
            selectinload(Producto.categoria)  # type: ignore[arg-type]
        )
        count_query = select(func.count()).select_from(Producto)

        if solo_activos:
            query = query.where(Producto.activo == True)
            count_query = count_query.where(Producto.activo == True)

        if search:
            query = query.where(col(Producto.nombre).ilike(f"%{search}%"))
            count_query = count_query.where(col(Producto.nombre).ilike(f"%{search}%"))

        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
            count_query = count_query.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            query = query.where(Producto.disponible == disponible)
            count_query = count_query.where(Producto.disponible == disponible)

        total = self.session.exec(count_query).one()
        items = list(self.session.exec(query.offset(skip).limit(limit)).all())
        return items, total
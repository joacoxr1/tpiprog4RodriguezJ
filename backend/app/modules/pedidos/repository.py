from datetime import datetime, timezone
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def get_by_id_with_items(self, pedido_id: int) -> Pedido | None:
        return self.session.exec(
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .execution_options(populate_existing=True)
        ).first()

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[list[Pedido], int]:
        query = select(Pedido).options(
            selectinload(Pedido.items)  # type: ignore[arg-type]
        )
        count_query = select(func.count()).select_from(Pedido)

        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)
            count_query = count_query.where(Pedido.usuario_id == usuario_id)

        if estado is not None:
            query = query.where(Pedido.estado == estado)
            count_query = count_query.where(Pedido.estado == estado)

        total = self.session.exec(count_query).one()
        items = list(
            self.session.exec(
                query.order_by(col(Pedido.created_at).desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return items, total

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()

    def count_hoy(self) -> int:
        inicio_hoy = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return self.session.exec(
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy)
        ).one()

    def ingresos_entregados(self) -> float:
        result = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(
                Pedido.estado == "ENTREGADO"
            )
        ).one()
        return float(result)
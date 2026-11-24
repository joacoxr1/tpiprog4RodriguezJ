from datetime import datetime, timezone
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self) -> None:
        self.uow = PedidoUnitOfWork()

    def _to_read(self, pedido: Pedido) -> PedidoRead:
        return PedidoRead.model_validate(pedido)

    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        producto_ids = [i.producto_id for i in data.items]
        if len(producto_ids) != len(set(producto_ids)):
            raise ProductoRepetido("No se permiten productos repetidos")

        with self.uow as uow:
            assert usuario.id is not None

            pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado("Producto no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible("Producto no disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente("Stock insuficiente")
                assert producto.id is not None

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = producto.precio_base * item.cantidad
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total += subtotal

            pedido.total = total
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)

            pedido_db = uow.pedidos.get_by_id_with_items(pedido.id)
            assert pedido_db is not None
            return self._to_read(pedido_db)

    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            items, total = uow.pedidos.list_by_usuario(
                usuario_id=usuario_id,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[self._to_read(p) for p in items],
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Pedido ajeno")
            return self._to_read(pedido)

    def cambiar_estado(
        self, pedido_id: int, data: CambioEstado, usuario: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            permitidos = TRANSICIONES.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida("Transicion invalida")

            if data.estado == "CANCELADO":
                for item in pedido.items or []:
                    producto = uow.productos.get_by_id(item.producto_id)
                    if producto:
                        producto.stock += item.cantidad
                        uow.productos.add(producto)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return self._to_read(pedido)

    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Pedido ajeno")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar si esta PENDIENTE")

            for item in pedido.items or []:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return self._to_read(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
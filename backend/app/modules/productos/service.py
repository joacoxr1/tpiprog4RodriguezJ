from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass

class CategoriaNoEncontrada(Exception):
    pass

class ProductoService:
    def __init__(self) -> None:
        self.uow = ProductoUnitOfWork()

    def _to_read(self, producto: Producto) -> ProductoRead:
        return ProductoRead.model_validate(producto)

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                solo_activos=True,
            )
            return ProductosPaginados(
                total=total,
                items=[self._to_read(p) for p in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_with_categoria(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return self._to_read(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoria no encontrada")

            producto = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
            )
            creado = uow.productos.add(producto)
            assert creado.id is not None
            creado_db = uow.productos.get_by_id_with_categoria(creado.id)
            assert creado_db is not None
            return self._to_read(creado_db)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            if data.categoria_id is not None:
                categoria = uow.categorias.get_by_id(data.categoria_id)
                if not categoria or not categoria.activo:
                    raise CategoriaNoEncontrada("Categoria no encontrada")
                producto.categoria_id = data.categoria_id

            if data.nombre is not None:
                producto.nombre = data.nombre
            if data.descripcion is not None:
                producto.descripcion = data.descripcion
            if data.precio_base is not None:
                producto.precio_base = data.precio_base
            if data.imagen_url is not None:
                producto.imagen_url = data.imagen_url
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.productos.add(producto)
            actualizado = uow.productos.get_by_id_with_categoria(producto_id)
            assert actualizado is not None
            return self._to_read(actualizado)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_with_categoria(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return self._to_read(producto)

    def anular(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)
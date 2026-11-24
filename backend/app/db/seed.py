from sqlmodel import Session, select
from app.core.database import engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import Pedido, DetallePedido

def seed() -> None:
    with Session(engine) as session:
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
            )
            session.add(admin)

        categorias_data = [
            ("Pizzas", "Pizzas artesanales"),
            ("Pastas", "Pastas caseras"),
            ("Bebidas", "Bebidas frias y calientes"),
        ]
        categorias = []
        for nombre, descripcion in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if not cat:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
            categorias.append(cat)

        if not session.exec(select(Producto)).first():
            productos_data = [
                ("Pizza Muzzarella", "Clasica", 3500, categorias[0].id, 20),
                ("Pizza Napolitana", "Con tomate y ajo", 3800, categorias[0].id, 15),
                ("Pizza Especial", "Jamon y morron", 4200, categorias[0].id, 10),
                ("Ravioles", "Ricota y verdura", 2800, categorias[1].id, 25),
                ("Noquis", "Papa", 2600, categorias[1].id, 20),
                ("Sorrentinos", "Jamon y queso", 3000, categorias[1].id, 18),
                ("Agua 500ml", "Sin gas", 800, categorias[2].id, 50),
                ("Gaseosa 500ml", "Cola", 1200, categorias[2].id, 40),
            ]
            for nombre, desc, precio, cat_id, stock in productos_data:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=desc,
                        precio_base=precio,
                        categoria_id=cat_id,
                        stock=stock,
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()
        print("Seed completado")


if __name__ == "__main__":
    from app.core.database import create_all_tables

    _ = (Usuario, Categoria, Producto, Pedido, DetallePedido)

    create_all_tables()
    seed()
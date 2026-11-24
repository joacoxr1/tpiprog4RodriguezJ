from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self):
        self.session = session_factory()
        return self

    def __exit__(self, exp_type, exp_val, exp_tb):
        if self.session is None:
            return False

        if exp_type is not None:
            self.session.rollback()
        else:
            self.session.commit()

        self.session.close()
        return False
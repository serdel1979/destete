"""add color de fondo a configuracion

Revision ID: 0e51f1eefb18
Revises: ecc8b490e7d2
Create Date: 2026-09-16 13:24:25.590722

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0e51f1eefb18'
down_revision: Union[str, None] = 'ecc8b490e7d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    color_fondo_enum = sa.Enum(
        'crema', 'blanco', 'gris', 'arena', 'celeste', name='color_fondo'
    )
    color_fondo_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'configuracion_app',
        sa.Column('fondo', color_fondo_enum, nullable=False, server_default='crema'),
    )


def downgrade() -> None:
    op.drop_column('configuracion_app', 'fondo')
    sa.Enum(name='color_fondo').drop(op.get_bind(), checkfirst=True)

"""add configuracion app

Revision ID: ecc8b490e7d2
Revises: 8e3ccdd39a1c
Create Date: 2026-09-16 13:13:30.325895

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'ecc8b490e7d2'
down_revision: Union[str, None] = '8e3ccdd39a1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    paleta_color_enum = sa.Enum(
        'verde', 'azul', 'terracota', 'violeta', 'grafito', name='paleta_color'
    )
    op.create_table(
        'configuracion_app',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('paleta', paleta_color_enum, nullable=False, server_default='verde'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('configuracion_app')
    sa.Enum(name='paleta_color').drop(op.get_bind(), checkfirst=True)

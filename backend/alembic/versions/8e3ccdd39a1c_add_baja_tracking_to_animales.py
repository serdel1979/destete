"""add baja tracking to animales

Revision ID: 8e3ccdd39a1c
Revises: 3e3c9e88e9fa
Create Date: 2026-09-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8e3ccdd39a1c'
down_revision: Union[str, None] = '3e3c9e88e9fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    motivo_baja_enum = sa.Enum('muerte', 'robo', 'otro', name='motivo_baja')
    motivo_baja_enum.create(op.get_bind(), checkfirst=True)
    op.add_column('animales', sa.Column('fecha_baja', sa.Date(), nullable=True))
    op.add_column('animales', sa.Column('motivo_baja', motivo_baja_enum, nullable=True))


def downgrade() -> None:
    op.drop_column('animales', 'motivo_baja')
    op.drop_column('animales', 'fecha_baja')
    sa.Enum(name='motivo_baja').drop(op.get_bind(), checkfirst=True)

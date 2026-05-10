"""add intl_url to products

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-05-08

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('products', sa.Column('intl_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('products', 'intl_url')

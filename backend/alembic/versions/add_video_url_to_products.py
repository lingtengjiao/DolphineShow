"""add video_url to products

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-19

"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('products', sa.Column('video_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('products', 'video_url')

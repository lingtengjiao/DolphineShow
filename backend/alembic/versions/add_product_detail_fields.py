"""add product detail fields: sample_price filling age_range support flags

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-05-19

"""
from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('products', sa.Column('sample_price', sa.Numeric(10, 2), nullable=True))
    op.add_column('products', sa.Column('filling', sa.String(255), nullable=True))
    op.add_column('products', sa.Column('age_range', sa.String(100), nullable=True))
    op.add_column('products', sa.Column('support_customization', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('products', sa.Column('support_logo', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('products', 'support_logo')
    op.drop_column('products', 'support_customization')
    op.drop_column('products', 'age_range')
    op.drop_column('products', 'filling')
    op.drop_column('products', 'sample_price')

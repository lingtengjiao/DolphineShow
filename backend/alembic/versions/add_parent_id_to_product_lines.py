"""add parent_id to product_lines

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-05-18

"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'product_lines',
        sa.Column('parent_id', sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        'fk_product_lines_parent_id',
        'product_lines',
        'product_lines',
        ['parent_id'],
        ['id'],
        ondelete='SET NULL',
    )
    op.create_index('ix_product_lines_parent_id', 'product_lines', ['parent_id'])


def downgrade() -> None:
    op.drop_index('ix_product_lines_parent_id', table_name='product_lines')
    op.drop_constraint('fk_product_lines_parent_id', 'product_lines', type_='foreignkey')
    op.drop_column('product_lines', 'parent_id')

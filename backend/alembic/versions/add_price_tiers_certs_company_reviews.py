"""add price_tiers certifications company_images customer_reviews

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-05-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('products', sa.Column('price_tiers', postgresql.JSONB(), nullable=True, server_default='[]'))
    op.add_column('products', sa.Column('certifications', postgresql.JSONB(), nullable=True, server_default='[]'))

    op.create_table(
        'company_images',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('category', sa.String(50), nullable=False, server_default='factory'),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'customer_reviews',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('reviewer_name', sa.String(100), nullable=False),
        sa.Column('reviewer_company', sa.String(200), nullable=True),
        sa.Column('reviewer_country', sa.String(100), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('rating', sa.SmallInteger(), nullable=False, server_default='5'),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('customer_reviews')
    op.drop_table('company_images')
    op.drop_column('products', 'certifications')
    op.drop_column('products', 'price_tiers')

"""initial_schema_users_hosted_zones_dns_records

Revision ID: 052ec5b109eb
Revises: 
Create Date: 2026-06-28 09:02:31.031045

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '052ec5b109eb'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. Create hosted_zones table
    op.create_table(
        'hosted_zones',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('domain_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hosted_zones_user_id', 'hosted_zones', ['user_id'], unique=False)
    op.create_index('ix_hosted_zones_domain_name', 'hosted_zones', ['domain_name'], unique=False)

    # 3. Create dns_records table
    op.create_table(
        'dns_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('hosted_zone_id', sa.Integer(), nullable=False),
        sa.Column('record_name', sa.String(length=255), nullable=False),
        sa.Column('record_type', sa.String(length=50), nullable=False),
        sa.Column('value', sa.String(length=1024), nullable=False),
        sa.Column('ttl', sa.Integer(), server_default='300', nullable=False),
        sa.Column('priority', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['hosted_zone_id'], ['hosted_zones.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_dns_records_hosted_zone_id', 'dns_records', ['hosted_zone_id'], unique=False)
    op.create_index('ix_dns_records_record_name', 'dns_records', ['record_name'], unique=False)
    op.create_index('ix_dns_records_record_type', 'dns_records', ['record_type'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_dns_records_record_type', table_name='dns_records')
    op.drop_index('ix_dns_records_record_name', table_name='dns_records')
    op.drop_index('ix_dns_records_hosted_zone_id', table_name='dns_records')
    op.drop_table('dns_records')

    op.drop_index('ix_hosted_zones_domain_name', table_name='hosted_zones')
    op.drop_index('ix_hosted_zones_user_id', table_name='hosted_zones')
    op.drop_table('hosted_zones')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')

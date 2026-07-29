"""create_traffic_policies_tables

Revision ID: 7be5b6689b53
Revises: 052ec5b109eb
Create Date: 2026-07-29 12:04:04.817108

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.constants.traffic_policy import RoutingType, PolicyStatus


# revision identifiers, used by Alembic.
revision: str = '7be5b6689b53'
down_revision: Union[str, Sequence[str], None] = '052ec5b109eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create traffic_policies table
    op.create_table('traffic_policies',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('routing_type', sa.Enum(RoutingType, name='routingtype'), nullable=False),
    sa.Column('status', sa.Enum(PolicyStatus, name='policystatus'), nullable=False),
    sa.Column('current_version', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_traffic_policies_name', 'traffic_policies', ['name'], unique=False)
    op.create_index('ix_traffic_policies_user_id', 'traffic_policies', ['user_id'], unique=False)

    # 2. Create traffic_policy_versions table
    op.create_table('traffic_policy_versions',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('policy_id', sa.Integer(), nullable=False),
    sa.Column('version_number', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['policy_id'], ['traffic_policies.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_traffic_policy_versions_policy_id', 'traffic_policy_versions', ['policy_id'], unique=False)

    # 3. Create traffic_policy_rules table
    op.create_table('traffic_policy_rules',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('version_id', sa.Integer(), nullable=False),
    sa.Column('record_name', sa.String(length=255), nullable=False),
    sa.Column('record_type', sa.String(length=50), nullable=False),
    sa.Column('value', sa.String(length=1024), nullable=False),
    sa.Column('ttl', sa.Integer(), nullable=False),
    sa.Column('weight', sa.Integer(), nullable=True),
    sa.Column('region', sa.String(length=100), nullable=True),
    sa.Column('failover_role', sa.String(length=50), nullable=True),
    sa.Column('health_check_id', sa.String(length=100), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['version_id'], ['traffic_policy_versions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_traffic_policy_rules_version_id', 'traffic_policy_rules', ['version_id'], unique=False)

    # 4. Create traffic_policy_instances table
    op.create_table('traffic_policy_instances',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('policy_id', sa.Integer(), nullable=False),
    sa.Column('hosted_zone_id', sa.Integer(), nullable=False),
    sa.Column('dns_name', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['hosted_zone_id'], ['hosted_zones.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['policy_id'], ['traffic_policies.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_traffic_policy_instances_hosted_zone_id', 'traffic_policy_instances', ['hosted_zone_id'], unique=False)
    op.create_index('ix_traffic_policy_instances_policy_id', 'traffic_policy_instances', ['policy_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Drop traffic_policy_rules index and table
    op.drop_index('ix_traffic_policy_rules_version_id', table_name='traffic_policy_rules')
    op.drop_table('traffic_policy_rules')

    # 2. Drop traffic_policy_instances indexes and table
    op.drop_index('ix_traffic_policy_instances_policy_id', table_name='traffic_policy_instances')
    op.drop_index('ix_traffic_policy_instances_hosted_zone_id', table_name='traffic_policy_instances')
    op.drop_table('traffic_policy_instances')

    # 3. Drop traffic_policy_versions index and table
    op.drop_index('ix_traffic_policy_versions_policy_id', table_name='traffic_policy_versions')
    op.drop_table('traffic_policy_versions')

    # 4. Drop traffic_policies indexes and table
    op.drop_index('ix_traffic_policies_user_id', table_name='traffic_policies')
    op.drop_index('ix_traffic_policies_name', table_name='traffic_policies')
    op.drop_table('traffic_policies')

    # 5. Conditionally drop custom enum types if PostgreSQL is the database engine
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TYPE routingtype")
        op.execute("DROP TYPE policystatus")

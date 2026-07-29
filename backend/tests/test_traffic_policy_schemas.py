import pytest
from datetime import datetime
from pydantic import ValidationError
from app.constants.traffic_policy import RoutingType, PolicyStatus
from app.schemas.traffic_policy import (
    TrafficPolicyRuleCreate,
    TrafficPolicyRuleResponse,
    TrafficPolicyVersionCreate,
    TrafficPolicyVersionResponse,
    TrafficPolicyInstanceCreate,
    TrafficPolicyInstanceResponse,
    TrafficPolicyCreate,
    TrafficPolicyUpdate,
    TrafficPolicyResponse,
    TrafficPolicyListResponse,
)

# Mock ORM Class for testing from_attributes=True
class MockORM:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def test_rule_validation():
    # Valid rule
    rule_data = {
        "record_name": "  www.example.com  ",  # should trim whitespace
        "record_type": "  cname  ",            # should trim and uppercase
        "value": "  target.example.com  ",      # should trim
        "ttl": 300,
        "weight": 100,
    }
    rule = TrafficPolicyRuleCreate(**rule_data)
    assert rule.record_name == "www.example.com"
    assert rule.record_type == "CNAME"
    assert rule.value == "target.example.com"
    assert rule.ttl == 300
    assert rule.weight == 100

    # Invalid TTL
    with pytest.raises(ValidationError):
        TrafficPolicyRuleCreate(
            record_name="www",
            record_type="A",
            value="1.1.1.1",
            ttl=0,  # must be > 0
        )

    # Empty string validation
    with pytest.raises(ValidationError):
        TrafficPolicyRuleCreate(
            record_name="   ",
            record_type="A",
            value="1.1.1.1",
            ttl=300,
        )


def test_rule_response_serialization():
    created_at_time = datetime.now()
    orm_rule = MockORM(
        id=1,
        version_id=2,
        record_name="www",
        record_type="A",
        value="1.1.1.1",
        ttl=300,
        weight=10,
        region=None,
        failover_role=None,
        health_check_id=None,
        created_at=created_at_time,
    )
    response = TrafficPolicyRuleResponse.model_validate(orm_rule)
    assert response.id == 1
    assert response.version_id == 2
    assert response.record_name == "www"
    assert response.record_type == "A"
    assert response.value == "1.1.1.1"
    assert response.ttl == 300
    assert response.weight == 10
    assert response.created_at == created_at_time


def test_version_response_serialization():
    created_at_time = datetime.now()
    orm_rule = MockORM(
        id=1,
        version_id=2,
        record_name="www",
        record_type="A",
        value="1.1.1.1",
        ttl=300,
        weight=None,
        region=None,
        failover_role=None,
        health_check_id=None,
        created_at=created_at_time,
    )
    orm_version = MockORM(
        id=2,
        policy_id=3,
        version_number=1,
        created_at=created_at_time,
        rules=[orm_rule],
    )
    response = TrafficPolicyVersionResponse.model_validate(orm_version)
    assert response.id == 2
    assert response.policy_id == 3
    assert response.version_number == 1
    assert response.created_at == created_at_time
    assert len(response.rules) == 1
    assert response.rules[0].id == 1


def test_instance_validation_and_serialization():
    created_at_time = datetime.now()
    # Valid validation
    instance = TrafficPolicyInstanceCreate(hosted_zone_id=1, dns_name="  my-policy.com  ")
    assert instance.dns_name == "my-policy.com"

    # Empty dns_name
    with pytest.raises(ValidationError):
        TrafficPolicyInstanceCreate(hosted_zone_id=1, dns_name="   ")

    # Serialization
    orm_instance = MockORM(
        id=1,
        policy_id=2,
        hosted_zone_id=1,
        dns_name="my-policy.com",
        created_at=created_at_time,
    )
    response = TrafficPolicyInstanceResponse.model_validate(orm_instance)
    assert response.id == 1
    assert response.policy_id == 2
    assert response.hosted_zone_id == 1
    assert response.dns_name == "my-policy.com"
    assert response.created_at == created_at_time


def test_policy_creation_validation():
    # Valid creation
    policy = TrafficPolicyCreate(
        name="  My Policy  ",
        routing_type=RoutingType.WEIGHTED,
        status=PolicyStatus.ACTIVE,
        description="  policy description  ",
    )
    assert policy.name == "My Policy"
    assert policy.description == "policy description"
    assert policy.routing_type == RoutingType.WEIGHTED
    assert policy.status == PolicyStatus.ACTIVE

    # Invalid empty name
    with pytest.raises(ValidationError):
        TrafficPolicyCreate(
            name="   ",
            routing_type=RoutingType.WEIGHTED,
        )


def test_policy_update_validation():
    # Update is completely optional
    update = TrafficPolicyUpdate(name="  New Name  ")
    assert update.name == "New Name"
    assert update.description is None
    assert update.routing_type is None
    assert update.status is None


def test_policy_response_serialization():
    created_at_time = datetime.now()
    updated_at_time = datetime.now()
    orm_policy = MockORM(
        id=1,
        user_id=10,
        name="My Policy",
        description="policy description",
        routing_type=RoutingType.WEIGHTED,
        status=PolicyStatus.ACTIVE,
        current_version=1,
        created_at=created_at_time,
        updated_at=updated_at_time,
        versions=[],
        instances=[],
    )
    response = TrafficPolicyResponse.model_validate(orm_policy)
    assert response.id == 1
    assert response.user_id == 10
    assert response.name == "My Policy"
    assert response.description == "policy description"
    assert response.routing_type == RoutingType.WEIGHTED
    assert response.status == PolicyStatus.ACTIVE
    assert response.current_version == 1
    assert response.created_at == created_at_time
    assert response.updated_at == updated_at_time
    assert len(response.versions) == 0
    assert len(response.instances) == 0

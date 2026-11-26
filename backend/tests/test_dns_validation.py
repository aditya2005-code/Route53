import pytest
from fastapi import status


@pytest.fixture
def test_zone(client, headers_a):
    resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "dnsval-example.com", "description": "Validation test zone"},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED
    return resp.json()["id"]


def test_valid_a_record(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "@", "record_type": "A", "value": "93.184.216.34", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["value"] == "93.184.216.34"


def test_invalid_a_record_ip(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "app", "record_type": "A", "value": "999.999.999.999", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_valid_aaaa_record(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "ipv6", "record_type": "AAAA", "value": "2606:2800:220:1:248:1893:25c8:1946", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED


def test_invalid_aaaa_record(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "ipv6bad", "record_type": "AAAA", "value": "192.168.1.1", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_cname_cannot_be_ip(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "alias", "record_type": "CNAME", "value": "192.0.2.1", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_valid_cname(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "cdn", "record_type": "CNAME", "value": "target.cdn.example.org", "ttl": 600},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED


def test_mx_requires_priority(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "@", "record_type": "MX", "value": "mail.example.org", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_valid_mx_record(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "@", "record_type": "MX", "value": "mail.example.org", "priority": 10, "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["priority"] == 10


def test_valid_txt_record(client, headers_a, test_zone):
    resp = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "@", "record_type": "TXT", "value": "v=spf1 include:_spf.google.com ~all", "ttl": 300},
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_201_CREATED


def test_cname_collision_prevented(client, headers_a, test_zone):
    # First create A record for 'service'
    r1 = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "service", "record_type": "A", "value": "192.0.2.10", "ttl": 300},
        headers=headers_a
    )
    assert r1.status_code == status.HTTP_201_CREATED

    # Attempt to create CNAME with same name 'service'
    r2 = client.post(
        f"/hosted-zones/{test_zone}/records",
        json={"record_name": "service", "record_type": "CNAME", "value": "another.example.com", "ttl": 300},
        headers=headers_a
    )
    assert r2.status_code == status.HTTP_409_CONFLICT


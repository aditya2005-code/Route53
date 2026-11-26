from fastapi import status


def test_dashboard_summary_empty(client, headers_a):
    resp = client.get("/dashboard/summary", headers=headers_a)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["total_zones"] == 0
    assert data["total_records"] == 0
    assert data["record_distribution"] == {}
    assert data["recent_zones"] == []
    assert data["recent_records"] == []


def test_dashboard_summary_with_data_and_isolation(client, headers_a, headers_b):
    # 1. User A creates a zone and 2 records
    z_a = client.post(
        "/hosted-zones/",
        json={"domain_name": "alpha.example.com", "description": "Zone Alpha"},
        headers=headers_a
    ).json()
    zone_a_id = z_a["id"]

    client.post(
        f"/hosted-zones/{zone_a_id}/records",
        json={"record_name": "@", "record_type": "A", "value": "192.0.2.1", "ttl": 300},
        headers=headers_a
    )
    client.post(
        f"/hosted-zones/{zone_a_id}/records",
        json={"record_name": "www", "record_type": "CNAME", "value": "alpha.example.com", "ttl": 300},
        headers=headers_a
    )

    # 2. Check User A dashboard stats
    resp_a = client.get("/dashboard/summary", headers=headers_a)
    assert resp_a.status_code == status.HTTP_200_OK
    data_a = resp_a.json()
    assert data_a["total_zones"] == 1
    assert data_a["total_records"] == 2
    assert data_a["record_distribution"].get("A") == 1
    assert data_a["record_distribution"].get("CNAME") == 1
    assert len(data_a["recent_zones"]) == 1
    assert len(data_a["recent_records"]) == 2

    # 3. User B dashboard stats must be 0 (total isolation)
    resp_b = client.get("/dashboard/summary", headers=headers_b)
    assert resp_b.status_code == status.HTTP_200_OK
    data_b = resp_b.json()
    assert data_b["total_zones"] == 0
    assert data_b["total_records"] == 0
    assert data_b["recent_zones"] == []
    assert data_b["recent_records"] == []


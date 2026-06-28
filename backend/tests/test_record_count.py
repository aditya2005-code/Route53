from fastapi import status

def test_hosted_zone_record_count_aggregation(client, headers_a):
    # 1. Create a new hosted zone
    create_zone_resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "count-test.com", "description": "Count Test Zone"},
        headers=headers_a
    )
    assert create_zone_resp.status_code == status.HTTP_201_CREATED
    zone = create_zone_resp.json()
    zone_id = zone["id"]
    assert zone["record_count"] == 0

    # Verify listing shows 0 records
    list_resp = client.get("/hosted-zones/", headers=headers_a)
    assert list_resp.status_code == status.HTTP_200_OK
    items = list_resp.json()["items"]
    count_test_item = next(item for item in items if item["id"] == zone_id)
    assert count_test_item["record_count"] == 0

    # 2. Add first DNS record
    create_rec1_resp = client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "record_name": "www",
            "record_type": "A",
            "value": "192.0.2.1",
            "ttl": 300
        },
        headers=headers_a
    )
    assert create_rec1_resp.status_code == status.HTTP_201_CREATED

    # Verify single zone retrieval contains record_count = 1
    get_zone_resp = client.get(f"/hosted-zones/{zone_id}", headers=headers_a)
    assert get_zone_resp.status_code == status.HTTP_200_OK
    assert get_zone_resp.json()["record_count"] == 1

    # Verify listing returns count 1
    list_resp2 = client.get("/hosted-zones/", headers=headers_a)
    items2 = list_resp2.json()["items"]
    count_test_item2 = next(item for item in items2 if item["id"] == zone_id)
    assert count_test_item2["record_count"] == 1

    # 3. Add second DNS record
    create_rec2_resp = client.post(
        f"/hosted-zones/{zone_id}/records",
        json={
            "record_name": "mail",
            "record_type": "MX",
            "value": "mail.count-test.com",
            "ttl": 600,
            "priority": 10
        },
        headers=headers_a
    )
    assert create_rec2_resp.status_code == status.HTTP_201_CREATED
    rec2_id = create_rec2_resp.json()["id"]

    # Verify count increments to 2
    get_zone_resp2 = client.get(f"/hosted-zones/{zone_id}", headers=headers_a)
    assert get_zone_resp2.json()["record_count"] == 2

    # 4. Delete one DNS record
    del_rec_resp = client.delete(f"/hosted-zones/{zone_id}/records/{rec2_id}", headers=headers_a)
    assert del_rec_resp.status_code == status.HTTP_204_NO_CONTENT

    # Verify count decrements to 1
    get_zone_resp3 = client.get(f"/hosted-zones/{zone_id}", headers=headers_a)
    assert get_zone_resp3.json()["record_count"] == 1

    # Cleanup: delete the zone
    del_zone_resp = client.delete(f"/hosted-zones/{zone_id}", headers=headers_a)
    assert del_zone_resp.status_code == status.HTTP_204_NO_CONTENT

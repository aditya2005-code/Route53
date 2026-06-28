from fastapi import status

def test_dns_record_ownership_flow(client, headers_a, headers_b):
    # 1. User A creates a Hosted Zone
    create_zone_resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "usera-domain.com", "description": "User A Zone"},
        headers=headers_a
    )
    assert create_zone_resp.status_code == status.HTTP_201_CREATED
    zone_a_id = create_zone_resp.json()["id"]

    # 2. User A creates a DNS Record
    create_record_resp = client.post(
        f"/hosted-zones/{zone_a_id}/records",
        json={
            "record_name": "www",
            "record_type": "A",
            "value": "192.0.2.1",
            "ttl": 300
        },
        headers=headers_a
    )
    assert create_record_resp.status_code == status.HTTP_201_CREATED
    record_a = create_record_resp.json()
    record_a_id = record_a["id"]

    # 3. User B cannot create a DNS record in User A's Hosted Zone (should return 404)
    create_b_resp = client.post(
        f"/hosted-zones/{zone_a_id}/records",
        json={
            "record_name": "mail",
            "record_type": "A",
            "value": "192.0.2.2",
            "ttl": 300
        },
        headers=headers_b
    )
    assert create_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 4. User B cannot view User A's DNS Records list (should return 404)
    list_b_resp = client.get(f"/hosted-zones/{zone_a_id}/records", headers=headers_b)
    assert list_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 5. User B cannot view User A's specific DNS Record (should return 404)
    get_b_resp = client.get(f"/hosted-zones/{zone_a_id}/records/{record_a_id}", headers=headers_b)
    assert get_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 6. User B cannot update User A's DNS Record (should return 404)
    update_b_resp = client.put(
        f"/hosted-zones/{zone_a_id}/records/{record_a_id}",
        json={
            "record_name": "www-updated",
            "record_type": "A",
            "value": "192.0.2.99",
            "ttl": 600
        },
        headers=headers_b
    )
    assert update_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 7. User B cannot delete User A's DNS Record (should return 404)
    delete_b_resp = client.delete(f"/hosted-zones/{zone_a_id}/records/{record_a_id}", headers=headers_b)
    assert delete_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 8. User B can fully manage their own resources
    # Create User B Zone
    create_zone_b_resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "userb-domain.com", "description": "User B Zone"},
        headers=headers_b
    )
    assert create_zone_b_resp.status_code == status.HTTP_201_CREATED
    zone_b_id = create_zone_b_resp.json()["id"]

    # Create User B Record
    create_record_b_resp = client.post(
        f"/hosted-zones/{zone_b_id}/records",
        json={
            "record_name": "www",
            "record_type": "A",
            "value": "192.0.2.2",
            "ttl": 300
        },
        headers=headers_b
    )
    assert create_record_b_resp.status_code == status.HTTP_201_CREATED
    record_b_id = create_record_b_resp.json()["id"]

    # User B can view their own record
    get_b_own_resp = client.get(f"/hosted-zones/{zone_b_id}/records/{record_b_id}", headers=headers_b)
    assert get_b_own_resp.status_code == status.HTTP_200_OK

    # User B can update their own record
    update_b_own_resp = client.put(
        f"/hosted-zones/{zone_b_id}/records/{record_b_id}",
        json={
            "record_name": "www",
            "record_type": "A",
            "value": "192.0.2.100",
            "ttl": 300
        },
        headers=headers_b
    )
    assert update_b_own_resp.status_code == status.HTTP_200_OK

    # User B can delete their own record
    delete_b_own_resp = client.delete(f"/hosted-zones/{zone_b_id}/records/{record_b_id}", headers=headers_b)
    assert delete_b_own_resp.status_code == status.HTTP_204_NO_CONTENT

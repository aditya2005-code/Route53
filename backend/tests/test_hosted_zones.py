from fastapi import status

def test_hosted_zone_ownership_flow(client, headers_a, headers_b):
    # 1. User A creates a Hosted Zone
    create_resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "usera-domain.com", "description": "User A Zone"},
        headers=headers_a
    )
    assert create_resp.status_code == status.HTTP_201_CREATED
    zone_a = create_resp.json()
    zone_a_id = zone_a["id"]
    assert zone_a["domain_name"] == "usera-domain.com"

    # 2. User A can get their own Hosted Zone
    get_resp = client.get(f"/hosted-zones/{zone_a_id}", headers=headers_a)
    assert get_resp.status_code == status.HTTP_200_OK

    # 3. User B cannot view User A's Hosted Zone (should return 404)
    get_b_resp = client.get(f"/hosted-zones/{zone_a_id}", headers=headers_b)
    assert get_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 4. User B cannot update User A's Hosted Zone (should return 404)
    update_b_resp = client.put(
        f"/hosted-zones/{zone_a_id}",
        json={"domain_name": "hacked-domain.com", "description": "Hacked Description"},
        headers=headers_b
    )
    assert update_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 5. User B cannot delete User A's Hosted Zone (should return 404)
    delete_b_resp = client.delete(f"/hosted-zones/{zone_a_id}", headers=headers_b)
    assert delete_b_resp.status_code == status.HTTP_404_NOT_FOUND

    # 6. User B can fully manage their own resources
    create_b_resp = client.post(
        "/hosted-zones/",
        json={"domain_name": "userb-domain.com", "description": "User B Zone"},
        headers=headers_b
    )
    assert create_b_resp.status_code == status.HTTP_201_CREATED
    zone_b = create_b_resp.json()
    zone_b_id = zone_b["id"]

    # User B can view their own zone
    get_b_own_resp = client.get(f"/hosted-zones/{zone_b_id}", headers=headers_b)
    assert get_b_own_resp.status_code == status.HTTP_200_OK
    assert get_b_own_resp.json()["domain_name"] == "userb-domain.com"

    # User B can update their own zone
    update_b_own_resp = client.put(
        f"/hosted-zones/{zone_b_id}",
        json={"domain_name": "userb-domain-updated.com", "description": "Updated Desc"},
        headers=headers_b
    )
    assert update_b_own_resp.status_code == status.HTTP_200_OK

    # User B can delete their own zone
    delete_b_own_resp = client.delete(f"/hosted-zones/{zone_b_id}", headers=headers_b)
    assert delete_b_own_resp.status_code == status.HTTP_204_NO_CONTENT

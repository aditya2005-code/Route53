from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.troubleshoot import TroubleshootRequest, TroubleshootResponse
from app.services.troubleshoot_service import TroubleshootService
from app.core.exceptions import ResourceNotFoundException

router = APIRouter()


@router.post("/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot_dns(
    request: TroubleshootRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    AI-powered DNS Troubleshooter endpoint.
    Accepts a natural-language description of a DNS issue, retrieves the user's
    actual DNS configuration from the database, and returns structured troubleshooting recommendations.
    """
    service = TroubleshootService(db)
    try:
        return service.troubleshoot(user_id=current_user.id, request=request)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while diagnosing DNS issue: {str(e)}",
        )


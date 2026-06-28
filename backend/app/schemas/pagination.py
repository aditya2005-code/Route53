from typing import Generic, TypeVar, List
from pydantic import BaseModel, Field
import math

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    """
    A generic schema for returning paginated results.
    T can be HostedZoneResponse, DNSRecordResponse, etc.
    """
    items: List[T]
    total: int = Field(description="Total number of items matching the query")
    page: int = Field(description="Current page number")
    limit: int = Field(description="Maximum items per page")
    pages: int = Field(description="Total number of pages available")

    @classmethod
    def create(cls, items: List[T], total: int, page: int, limit: int):
        """Helper to safely calculate pages and instantiate the model."""
        pages = math.ceil(total / limit) if limit > 0 else 1
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

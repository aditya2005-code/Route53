class DomainException(Exception):
    """Base class for all custom domain exceptions."""
    pass

class ResourceNotFoundException(DomainException):
    """Raised when a requested resource is not found."""
    def __init__(self, message: str = "Resource not found"):
        self.message = message
        super().__init__(self.message)

class PermissionDeniedException(DomainException):
    """Raised when a user attempts to access a resource they do not own."""
    def __init__(self, message: str = "Permission denied"):
        self.message = message
        super().__init__(self.message)

class DuplicateResourceException(DomainException):
    """Raised when a resource violates a unique constraint (e.g., duplicate domain)."""
    def __init__(self, message: str = "Resource already exists"):
        self.message = message
        super().__init__(self.message)

class ConflictException(DomainException):
    """Raised when a business rule conflict occurs (e.g., CNAME conflicting with A record)."""
    def __init__(self, message: str = "Business rule conflict"):
        self.message = message
        super().__init__(self.message)

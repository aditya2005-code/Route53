from enum import Enum

class RoutingType(str, Enum):
    SIMPLE = "SIMPLE"
    WEIGHTED = "WEIGHTED"
    LATENCY = "LATENCY"
    FAILOVER = "FAILOVER"
    GEOLOCATION = "GEOLOCATION"
    MULTIVALUE = "MULTIVALUE"

class PolicyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
# Constants for Traffic Policies
# TODO: Add constants here as implementation progresses

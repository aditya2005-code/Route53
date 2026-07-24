from pydantic import BaseModel

class TrafficPolicyBase(BaseModel):
    pass

class TrafficPolicyCreate(TrafficPolicyBase):
    pass

class TrafficPolicyUpdate(TrafficPolicyBase):
    pass

class TrafficPolicyResponse(TrafficPolicyBase):
    pass

import { useAuthContext } from "../context/AuthContext";

/**
 * Custom hook to easily consume the AuthContext in functional components.
 */
export default function useAuth() {
  return useAuthContext();
}

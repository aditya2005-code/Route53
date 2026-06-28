"use client";

import { useToastContext } from "../context/ToastContext";

/**
 * Custom hook to trigger Toast notifications.
 */
export default function useToast() {
  const { showToast } = useToastContext();
  return { showToast };
}

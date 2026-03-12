/**
 * Shared Types for Kodefast Template
 * 
 * Types used across multiple files. Component-specific types
 * should be defined in their own component files.
 */

// ============================================
// User
// ============================================

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

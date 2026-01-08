/**
 * Branded types for type-safe entity IDs
 * Prevents accidental mixing of ID types (e.g., using AgentId where PublisherId expected)
 */

// Brand symbol for type branding
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

// Entity ID types
export type AgentId = Brand<string, 'AgentId'>;
export type PublisherId = Brand<string, 'PublisherId'>;
export type SubmissionId = Brand<string, 'SubmissionId'>;
export type IncidentId = Brand<string, 'IncidentId'>;
export type ValidationFindingId = Brand<string, 'ValidationFindingId'>;

// ID creation functions
export function createAgentId(id: string): AgentId {
  return id as AgentId;
}

export function createPublisherId(id: string): PublisherId {
  return id as PublisherId;
}

export function createSubmissionId(id: string): SubmissionId {
  return id as SubmissionId;
}

export function createIncidentId(id: string): IncidentId {
  return id as IncidentId;
}

export function createValidationFindingId(id: string): ValidationFindingId {
  return id as ValidationFindingId;
}

// ID generation with prefix
export function generateAgentId(): AgentId {
  return createAgentId(`AGT${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
}

export function generatePublisherId(): PublisherId {
  return createPublisherId(`PUB${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
}

export function generateSubmissionId(): SubmissionId {
  return createSubmissionId(`SUB${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`);
}

export function generateIncidentId(): IncidentId {
  return createIncidentId(`INC${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
}

export function generateValidationFindingId(): ValidationFindingId {
  return createValidationFindingId(`VF${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`);
}

/**
 * A fact that happened in the domain. CQS-lite: events are modeled and pulled
 * from aggregates, but there are no subscribers yet — they are placeholders for
 * future cross-cutting reactions (fees, notifications). See ADR-0006.
 */
export type DomainEvent = {
  readonly name: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
};

import { describe, expect, it } from 'vitest'

import {
  buildResolvedSessionHeaders,
  readResolvedSessionHeaders,
} from './send-stream-session-headers'

describe('send-stream session headers', () => {
  it('publishes both NasTech and legacy Claude session headers for compatibility', () => {
    expect(
      buildResolvedSessionHeaders({
        sessionKey: 'sess-123',
        friendlyId: 'friendly-123',
      }),
    ).toMatchObject({
      'X-NasTech-Session-Key': 'sess-123',
      'X-NasTech-Friendly-Id': 'friendly-123',
      'x-claude-session-key': 'sess-123',
      'x-claude-friendly-id': 'friendly-123',
    })
  })

  it('prefers NasTech headers when both header families are present', () => {
    const headers = new Headers({
      'X-NasTech-Session-Key': 'sess-new',
      'X-NasTech-Friendly-Id': 'friendly-new',
      'x-claude-session-key': 'sess-old',
      'x-claude-friendly-id': 'friendly-old',
    })

    expect(
      readResolvedSessionHeaders(headers, {
        sessionKey: 'fallback-session',
        friendlyId: 'fallback-friendly',
      }),
    ).toEqual({
      sessionKey: 'sess-new',
      friendlyId: 'friendly-new',
    })
  })

  it('falls back to legacy Claude headers when NasTech headers are absent', () => {
    const headers = new Headers({
      'x-claude-session-key': 'sess-legacy',
      'x-claude-friendly-id': 'friendly-legacy',
    })

    expect(
      readResolvedSessionHeaders(headers, {
        sessionKey: 'fallback-session',
        friendlyId: 'fallback-friendly',
      }),
    ).toEqual({
      sessionKey: 'sess-legacy',
      friendlyId: 'friendly-legacy',
    })
  })
})

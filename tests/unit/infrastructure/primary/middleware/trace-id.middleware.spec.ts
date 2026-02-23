import {
  traceIdMiddleware,
  TRACE_ID_HEADER,
} from '@Infrastructure/primary/middleware/trace-id.middleware'

describe('traceIdMiddleware', () => {
  it('uses incoming trace id header when present', () => {
    const req = { header: jest.fn(() => 'incoming-trace') }
    const res = { locals: {}, setHeader: jest.fn() }
    const next = jest.fn()

    traceIdMiddleware(req as never, res as never, next)

    expect((req as never as { traceId: string }).traceId).toBe('incoming-trace')
    expect(res.setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, 'incoming-trace')
    expect(next).toHaveBeenCalled()
  })

  it('generates trace id when header is missing', () => {
    const req = { header: jest.fn(() => undefined) }
    const res = { locals: {}, setHeader: jest.fn() }
    const next = jest.fn()

    traceIdMiddleware(req as never, res as never, next)

    const traceId = (req as never as { traceId: string }).traceId
    expect(typeof traceId).toBe('string')
    expect(traceId.length).toBeGreaterThan(0)
    expect(res.setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, traceId)
    expect(next).toHaveBeenCalled()
  })
})

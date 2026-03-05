import { randomUUID } from 'node:crypto'

import { type NextFunction, type Request, type Response } from 'express'

export const TRACE_ID_HEADER = 'x-trace-id'

export const traceIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingHeader = req.header(TRACE_ID_HEADER)
  const traceId =
    incomingHeader !== undefined && incomingHeader.trim() !== '' ? incomingHeader : randomUUID()

  ;(req as Request & { traceId?: string }).traceId = traceId
  res.locals.traceId = traceId
  res.setHeader(TRACE_ID_HEADER, traceId)
  next()
}

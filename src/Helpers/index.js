export class UserError extends Error {
  constructor (message, statusCode) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    Error.captureStackTrace(this, UserError)
  }
}

export class Helper {
  static log (err) {
    console.error(err)
  }

  static createSuccessResponse (data, meta = {}) {
    return {
      data,
      meta,
      status: 'success'
    }
  }

  static createErrorResponse (err, meta = {}) {
    Helper.log(err)
    let errMessage = ''
    let statusCode

    if (err instanceof Error) {
      errMessage = err.message
      statusCode = err.statusCode // this comes from UserError class
    }
    if (typeof err === 'string') {
      errMessage = err
    }

    if (Array.isArray(err.details)) {
      errMessage = err.details[0].message
    }
    if (!statusCode) {
      statusCode = 500
    }
    if (!errMessage) {
      errMessage = 'Server Error'
    }
    return {
      message: errMessage,
      status: 'error',
      statusCode: statusCode,
      meta
    }
  }

  static requestHandler (fn) {
    return async (req, res, next) => {
      try {
        const result = await fn.call(null, req, res, next)
        res.json(Helper.createSuccessResponse(result))
      } catch (err) {
        const { statusCode, ...resp } = Helper.createErrorResponse(err)
        res.status(statusCode).json(resp)
      }
    }
  }
}

// export default { UserError, Helper }

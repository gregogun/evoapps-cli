export const handleError = (message: string, error?: any, debug = false) => {
  if (debug) {
    throw new Error(error.stack)
  } else {
    throw new Error(`${message} ${error.message}`)
  }
}

module.exports = { handleError }

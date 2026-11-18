class LayoverError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'LayoverError'
    this.code = code
    this.status = status
  }
}
module.exports = { LayoverError }

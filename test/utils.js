function initOptions() {
  options = {};
  this._options = options || {};
  if (!this._options.reconnectDelay) {
    this._options.reconnectDelay = 3000;
  }
  if (!this._options.heartbeatInterval) {
    this._options.heartbeatInterval = 10000;
  }
  if (!this._options.defaultRoundTimeout) {
    this._options.defaultRoundTimeout = 5000;
  }
  if (!this._options.defaultOffset) {
    this._options.defaultOffset = -600;
  }
  if (!this._options.getLimit) {
    this._options.getLimit = 64;
  }
  if (!this._options.queueCapacity) {
    this._options.queueCapacity = 512;
  }
  return options;
}

module.exports.initOptions = initOptions;

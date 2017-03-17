import xin from 'xin';

const IS_ONLINE = 1;
const IS_OFFLINE = 0;
const IS_ERROR = -1;

let globalPools = [];
let globalNavigator = window.navigator;

window.addEventListener('online', () => {
  globalPools.forEach(pool => pool.ping());
}, true);

window.addEventListener('offline', () => {
  globalPools.forEach(pool => pool.set('status', 0));
}, true);

class ConnectPool extends xin.Component {
  static get default () {
    return globalPools[0];
  }

  static get navigator () {
    return globalNavigator;
  }

  static reset ({ navigator = window.navigator } = {}) {
    globalNavigator = navigator;
    globalPools = [];
  }

  get props () {
    return Object.assign({}, super.props, {
      ref: {
        type: Object,
        readonly: true,
        notify: true,
      },

      status: {
        type: String,
        readonly: true,
        notify: true,
        observer: '_statusChanged(status)',
      },

      pingUrl: {
        type: String,
      },

      pingFn: {
        type: Function,
      },

      pingTimeout: {
        type: Number,
        value: 3000,
      },

      pingRetry: {
        type: Number,
        value: 10000,
      },

      baseUrl: {
        type: String,
        value: window.location.origin,
        observer: '_baseUrlChanged(baseUrl)',
      },

      headers: {
        type: Array,
      },
    });
  }

  attached () {
    super.attached();

    this.set('ref', this);

    globalPools.push(this);

    if (this.status === undefined) {
      this.status = IS_ONLINE;
      this.pingFlights = [];
      this.ping();
    }
  }

  detached () {
    this.set('ref', null);

    const index = globalPools.indexOf(this);
    if (index >= 0) {
      globalPools.splice(index, 1);
    }
  }

  _baseUrlChanged (baseUrl) {
    this._baseUrl = new window.URL(baseUrl, window.location.origin).href;
  }

  _statusChanged (status) {
    this.fire('status-change', { status });

    const tryPing = async () => {
      await this.ping();
      startPing();
    };

    const startPing = () => {
      this._nextRetryPing = setTimeout(tryPing, this.pingRetry);
    };

    const stopPing = () => {
      clearTimeout(this._nextRetryPing);
    };

    if (status === IS_ERROR && this.pingRetry > 0) {
      startPing();
    } else {
      stopPing();
    }
  }

  async ping () {
    if (this.pingFlights.length > 0) {
      return await new Promise((resolve, reject) => this.pingFlights.push([ resolve, reject ]));
    }

    return await new Promise(async (resolve, reject) => {
      this.pingFlights.push([ resolve, reject ]);

      try {
        const status = await this._ping();

        this._lastTimePinged = new Date();

        this.set('status', status);

        this.pingFlights.forEach(([ resolve, reject ]) => resolve(status));
      } catch (err) {
        this.pingFlights.forEach(([ resolve, reject ]) => reject(err));
      }

      this.pingFlights = [];
    });
  }

  async fetch (url, options = {}) {
    let status = this.status;

    if (status === IS_OFFLINE) {
      throw new Error('Connection offline');
    }

    if (status === IS_ERROR) {
      throw new Error('Connection error');
    }

    const headers = Object.assign({}, this.headers, options.headers);

    options = Object.assign(options, { headers });

    try {
      return await window.fetch(this.getUrl(url), options);
    } catch (err) {
      try { this.ping(); } catch (err) {}
      throw err;
    }
  }

  getUrl (url) {
    if (url instanceof window.URL) {
      return url;
    }
    return url.startsWith('/') ? (this._baseUrl + url) : new window.URL(url, this._baseUrl).href;
  }

  async _ping () {
    console.log('Ping at', new Date());

    if (this.pingFn) {
      return await this.pingFn();
    }

    if (!globalNavigator.onLine) {
      return IS_OFFLINE;
    }

    if (!this.pingUrl) {
      return IS_ONLINE;
    }

    try {
      await new Promise(async (resolve, reject) => {
        const status = {
          done: false,

          finish () {
            clearTimeout(timeout);
            this.done = true;
          },
        };

        let timeout = setTimeout(() => {
          if (status.done) return;

          status.finish();
          reject(new Error('Ping timeout'));
        }, this.pingTimeout);

        try {
          const response = await window.fetch(this.getUrl(this.pingUrl));
          if (status.done) return;

          status.finish();
          if (response && response.ok) {
            resolve();
          } else {
            reject(new Error('Response not ok'));
          }
        } catch (err) {
          status.finish();
          reject(err);
        }
      });

      return IS_ONLINE;
    } catch (err) {
      return IS_ERROR;
    }
  }
}

xin.define('connect-pool', ConnectPool);

export default ConnectPool;

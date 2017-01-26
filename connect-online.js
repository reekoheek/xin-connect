import xin from 'xin';

class ConnectOnline extends xin.Component {
  get props () {
    return Object.assign({}, super.props, {
      online: {
        type: Boolean,
        readonly: true,
        notify: true,
        observer: '_onlineChanged(online)',
      },

      pingUrl: {
        type: String,
      },

      pingFn: {
        type: Function,
      },

      timeout: {
        type: Number,
        value: 3000,
      },

      navigator: {
        type: Object,
        value: () => window.navigator,
      },
    });
  }

  attached () {
    super.attached();

    this._onlineUpdater = () => {
      this.ping();
    };

    window.addEventListener('online', this._onlineUpdater);
    window.addEventListener('offline', this._onlineUpdater);

    this.set('online', this.navigator.onLine);
  }

  detached () {
    super.detached();

    if (!this._onlineUpdater) {
      return;
    }

    window.removeEventListener('online', this._onlineUpdater);
    window.removeEventListener('offline', this._onlineUpdater);
    this._onlineUpdater = null;
  }

  _onlineChanged (online) {
    this.fire('online-change', { online });
  }

  async ping () {
    let online = this.navigator.onLine && await (this.pingFn ? this.pingFn() : this.defaultPingFn());
    this.set('online', online);
  }

  async defaultPingFn () {
    if (!this.pingUrl) {
      return true;
    }

    try {
      await new Promise((resolve, reject) => {
        let done = false;

        let timeout = setTimeout(() => {
          if (done) return;
          reject(new Error('Ping timeout'));
        }, this.timeout);

        window.fetch(this.pingUrl).then(response => {
          clearTimeout(timeout);
          done = true;

          if (response && response.ok) {
            resolve();
          } else {
            reject(new Error('Response not ok'));
          }
        }, (err) => {
          clearTimeout(timeout);
          done = true;

          reject(err);
        });
      });

      return true;
    } catch (err) {
      return false;
    }
  }
}

xin.define('connect-online', ConnectOnline);

export default ConnectOnline;

import { define, Component } from '@xinix/xin';
import { ConnectPool } from './connect-pool';

export class ConnectFetch extends Component {
  get props () {
    return Object.assign({}, super.props, {
      pool: {
        type: Object,
      },

      url: {
        type: String,
        required: true,
      },

      value: {
        type: Object,
        readonly: true,
        notify: true,
      },
    });
  }

  attached () {
    super.attached();

    this.set('value', null);

    this.execute();
  }

  getPool () {
    return this.pool || ConnectPool.default;
  }

  execute () {
    this.debounce('fetch', this.fetch, 100);
  }

  async fetch () {
    if (!this.url) {
      throw new Error('Cannot fetch unknown url');
    }

    try {
      let response = await this.getPool().fetch(this.url);

      this.fire('response', response);

      const contentType = response.headers.get('Content-Type') || 'text/plain';

      let value = null;
      if (contentType.indexOf('application/json') !== -1) {
        value = await response.json();
      } else {
        value = await response.text();
      }
      this.set('value', value);

      return response;
    } catch (err) {
      this.fire('error', err);
      throw err;
    }
  }
}

define('connect-fetch', ConnectFetch);

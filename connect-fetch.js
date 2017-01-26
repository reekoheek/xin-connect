import xin from 'xin';

class ConnectFetch extends xin.Component {
  get props () {
    return Object.assign({}, super.props, {
      url: {
        type: String,
      },

      value: {
        type: Object,
      },
    });
  }

  attached () {
    super.attached();

    this.fetch();
  }

  async fetch () {
    try {
      let response = await window.fetch(this.url);

      console.log(response);
      console.log(response.headers);
      let text = await response.text();

      console.log('text', text);

      this.fire('response', response);
    } catch (err) {
      this.fire('error', err);
    }
  }
}

xin.define('connect-fetch', ConnectFetch);

export default ConnectFetch;

import { define, Component } from '@xinix/xin';

import html from './my-demo.html';

import '../../';

class MyDemo extends Component {
  get template () {
    return html;
  }

  get props () {
    return Object.assign({}, super.props, {
      status: {
        type: Number,
      },
      dataUrl: {
        type: String,
        value: '/mock/data.json',
      },
    });
  }

  async doPoolFetch (evt) {
    evt.preventDefault();

    let res = await this.$.pool.fetch(this.dataUrl);
    this.set('poolFetchResult', await res.text());
  }

  async doFetchFetch (evt) {
    evt.preventDefault();

    await this.$.cfetch.fetch();
    this.set('fetchFetchResult', this.$.cfetch.value);
  }
}

define('my-demo', MyDemo);

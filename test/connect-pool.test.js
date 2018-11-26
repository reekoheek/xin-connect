import assert from 'assert';
import { Fixture } from '@xinix/xin/components/fixture';

import { ConnectPool } from '../connect-pool';

describe('ConnectPool', () => {
  let navigator;

  beforeEach(() => {
    navigator = new NavigatorMock(false);
    ConnectPool.reset({ navigator });
  });

  afterEach(() => {
    ConnectPool.reset();
  });

  describe('.default', () => {
    it('return ConnectPool instance when created', async () => {
      let fixture = await Fixture.create('<connect-pool />');
      await fixture.waitConnected();

      assert(ConnectPool.default);

      fixture.dispose();
    });

    it('empty when no <connect-pool> created', () => {
      assert(!ConnectPool.default);
    });
  });

  describe('.navigator', () => {
    it('return window.navigator', () => {
      assert.strictEqual(ConnectPool.navigator, navigator);

      ConnectPool.reset();

      assert.strictEqual(ConnectPool.navigator, window.navigator);
    });
  });

  describe('#status', () => {
    it('change to 1 when navigator.onLine is true', async () => {
      let fixture = await Fixture.create(`
        <connect-pool status="{{status}}"></connect-pool>
      `);

      try {
        await fixture.waitConnected();

        assert.strictEqual(fixture.status, 0);

        navigator.onLine = true;

        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(fixture.status, 1);

        navigator.onLine = false;

        await new Promise(resolve => setTimeout(resolve));

        assert.strictEqual(fixture.status, 0);
      } finally {
        fixture.dispose();
      }
    });
  });

  describe('(status-change)', () => {
    afterEach(() => {
      ConnectPool.reset();
    });

    it('fire event', async () => {
      let navigator = new NavigatorMock();
      ConnectPool.reset({ navigator });

      let status;
      let fixture = await Fixture.create(`
        <connect-pool (status-change)="_onlineChanged(evt)"></connect-pool>
      `, { '_onlineChanged': evt => (status = evt.detail.status) });

      try {
        await fixture.waitConnected();
        assert.strictEqual(status, 0);

        navigator.onLine = true;
        await new Promise(resolve => setTimeout(resolve));
        assert.strictEqual(status, 1);

        navigator.onLine = false;
        await new Promise(resolve => setTimeout(resolve));
        assert.strictEqual(status, 0);
      } finally {
        fixture.dispose();
      }
    });
  });

  describe('#fetch()', () => {
    beforeEach(() => {
      ConnectPool.reset();
    });

    afterEach(() => {
      ConnectPool.reset();
    });

    it('response 200', async () => {
      let fixture = await Fixture.create(`
        <connect-pool id="pool"></connect-pool>
      `);

      try {
        await fixture.waitConnected();

        let resp = await fixture.$.pool.fetch('/');

        assert.strictEqual(resp.status, 200);
      } finally {
        fixture.dispose();
      }
    });
  });

  // describe('#ping()', () => {
  //   let fixture;
  //
  //   beforeEach(async () => {
  //     fixture = Fixture.create(`
  //       <connect-pool id="connectOnline" navigator="[[navigator]]" timeout="[[timeout]]" online="{{online}}" ping-url="http://foo.bar"></connect-pool>
  //     `);
  //
  //     fixture.set('navigator', new NavigatorMock(true));
  //
  //     await fixture.promised('status-change');
  //   });
  //
  //   afterEach(() => {
  //     if (window.fetch.restore) {
  //       window.fetch.restore();
  //     }
  //     fixture.dispose();
  //   });
  //
  //   it('offline when address is unresolved', async () => {
  //     await fixture.$.connectOnline.ping();
  //
  //     assert(fixture.online === false, 'Set offline when address is unresolved');
  //   });
  //
  //   it('online when status 200', async () => {
  //     sinon.stub(window, 'fetch');
  //     window.fetch.returns(Promise.resolve(new window.Response('', { status: 200 })));
  //     await fixture.$.connectOnline.ping();
  //
  //     assert(fixture.online === true, 'Set online when status 200');
  //   });
  //
  //   it('offline when status 404', async () => {
  //     sinon.stub(window, 'fetch');
  //     window.fetch.returns(Promise.resolve(new window.Response('', { status: 404 })));
  //     await fixture.$.connectOnline.ping();
  //
  //     assert(fixture.online === false, 'Set offline when status 404');
  //   });
  //
  //   it('offline when timeout', async () => {
  //     fixture.set('timeout', 50);
  //
  //     sinon.stub(window, 'fetch');
  //     window.fetch.returns(new Promise((resolve, reject) => {
  //       setTimeout(resolve, 10000);
  //     }));
  //     await fixture.$.connectOnline.ping();
  //
  //     assert(fixture.online === false, 'Set offline when timeout');
  //   }).timeout(5000);
  // });
});

class NavigatorMock {
  constructor (online) {
    this.online = online || false;
  }

  get onLine () {
    return this.online;
  }

  set onLine (online) {
    this.online = online;

    let evt = new window.Event(online ? 'online' : 'offline');

    window.dispatchEvent(evt);
  }
}

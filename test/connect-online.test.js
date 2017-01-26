/* eslint-env mocha */

import { assert } from 'chai';
import Fixture from 'xin/components/fixture';
import sinon from 'sinon';

import '../connect-online';

window.sinon = sinon;

describe('<connect-online>', () => {
  describe('#online', () => {
    let fixture;

    beforeEach(async () => {
      fixture = Fixture.create(`
        <connect-online navigator="[[navigator]]" online="{{online}}"></connect-online>
      `);

      fixture.set('navigator', new NavigatorMock(false));

      await fixture.promised('online-change');
    });

    afterEach(() => {
      fixture.dispose();
    });

    it('changed to true when navigator.onLine is true', async () => {
      fixture.navigator.onLine = true;

      await new Promise(resolve => setTimeout(resolve));

      assert(fixture.online === true, 'Online should be true after set online');
    });

    it('changed to false when navigator.offLine is false', async () => {
      fixture.navigator.onLine = false;

      await new Promise(resolve => setTimeout(resolve));

      assert(fixture.online === false, 'Online should be false after set offline');
    });
  });

  describe('(online-change)', () => {
    let fixture;

    beforeEach(async () => {
      fixture = Fixture.create(`
        <connect-online navigator="[[navigator]]" (online-change)="_onlineChanged(evt)"></connect-online>
      `);

      fixture.all({
        'navigator': new NavigatorMock(false),
        '_onlineChanged': (evt) => {},
      });

      await fixture.promised('online-change');
    });

    afterEach(() => {
      fixture.dispose();
    });

    it('fire event with detail { online: true }', async () => {
      fixture.navigator.onLine = false;

      await new Promise(resolve => setTimeout(resolve));

      let spy = fixture._onlineChanged = sinon.spy();

      fixture.navigator.onLine = true;

      await new Promise(resolve => setTimeout(resolve));

      sinon.assert.calledWithMatch(spy, { detail: { online: true } });
    });

    it('fire event with detail { online: false }', async () => {
      fixture.navigator.onLine = true;

      await new Promise(resolve => setTimeout(resolve));

      let spy = fixture._onlineChanged = sinon.spy();

      fixture.navigator.onLine = false;

      await new Promise(resolve => setTimeout(resolve));

      sinon.assert.calledWithMatch(spy, { detail: { online: false } });
    });

    it('fire only one event for the same changes', async () => {
      fixture.navigator.onLine = true;

      await new Promise(resolve => setTimeout(resolve));

      let spy = fixture._onlineChanged = sinon.spy();

      fixture.navigator.onLine = false;
      fixture.navigator.onLine = false;

      await new Promise(resolve => setTimeout(resolve));

      sinon.assert.calledOnce(spy);
    });
  });

  describe('#ping()', () => {
    let fixture;

    beforeEach(async () => {
      fixture = Fixture.create(`
        <connect-online id="connectOnline" navigator="[[navigator]]" timeout="[[timeout]]" online="{{online}}" ping-url="http://foo.bar"></connect-online>
      `);

      fixture.set('navigator', new NavigatorMock(true));

      await fixture.promised('online-change');
    });

    afterEach(() => {
      if (window.fetch.restore) {
        window.fetch.restore();
      }
      fixture.dispose();
    });

    it('offline when address is unresolved', async () => {
      await fixture.$.connectOnline.ping();

      assert(fixture.online === false, 'Set offline when address is unresolved');
    });

    it('online when status 200', async () => {
      sinon.stub(window, 'fetch');
      window.fetch.returns(Promise.resolve(new window.Response('', { status: 200 })));
      await fixture.$.connectOnline.ping();

      assert(fixture.online === true, 'Set online when status 200');
    });

    it('offline when status 404', async () => {
      sinon.stub(window, 'fetch');
      window.fetch.returns(Promise.resolve(new window.Response('', { status: 404 })));
      await fixture.$.connectOnline.ping();

      assert(fixture.online === false, 'Set offline when status 404');
    });

    it('offline when timeout', async () => {
      fixture.set('timeout', 50);

      sinon.stub(window, 'fetch');
      window.fetch.returns(new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);
      }));
      await fixture.$.connectOnline.ping();

      assert(fixture.online === false, 'Set offline when timeout');
    }).timeout(5000);
  });
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

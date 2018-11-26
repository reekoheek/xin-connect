// FIXME finish write tests

// import { assert } from 'chai';
// import Fixture from 'xin/components/fixture';
// import sinon from 'sinon';
//
// import '../connect-fetch';
//
// describe('<connect-fetch>', () => {
//   describe('#value', () => {
//     it('ccc', async () => {
//       let fixture = Fixture.create(`
//         <connect-fetch url="http://foo.bar" value="{{result}}"></connect-fetch>
//       `);
//
//       sinon.stub(window, 'fetch');
//       window.fetch.returns(Promise.resolve(new window.Response('ok', {
//         headers: {
//           'Content-Type': 'text/plain',
//         },
//       })));
//       await new Promise((resolve, reject) => {
//         fixture.once('response', resolve);
//         fixture.once('error', reject);
//       });
//
//       assert(fixture.result === 'ok');
//     });
//   });
// });

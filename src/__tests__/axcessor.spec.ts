
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Assert, IsExactType } from 'typebolt';
import { Accessible } from '../AccessorFunction';

describe('test', () => {
  type Root = {
    a: {
      b: {
        c: {
          d: true;
        };
      };
    };
  };
  const getChain = Accessible.getAccessorChain.forRoot<Root>();

  it('works', () => {
    const chain = getChain(_ => _.a.b.c);
    const expected = ['a', 'b', 'c'] as const;

    Assert<IsExactType<typeof chain, typeof expected>>();
    expect(chain).toEqual(expected);
  });
});

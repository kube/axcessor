
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { AccessorChain } from './AccessorChain';
import { Accessible, AccessorFunction } from './AccessorFunction';

export type Accessor<R = unknown> =
  | AccessorFunction<R>
  | AccessorChain<R>;

export namespace Accessor {
  export type GetTarget<R, A extends Accessor<R>> = A extends string[]
    ? AccessorChain.GetTarget<R, A>
    : A extends AccessorFunction<R>
    ? AccessorFunction.GetTarget<A>
    : never;

  export function toAccessorChain<R>(
    accessor: Accessor<R>
  ): AccessorChain<R> {
    if (typeof accessor === 'function') {
      return Accessible.getAccessorChain(accessor as any) as any;
    } else {
      return accessor;
    }
  }
}

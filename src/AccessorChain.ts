
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Increment } from 'typebolt';

export type AccessorChain<R = unknown> =
  | AccessorChain.Unsafe
  | AccessorChain.Safe<R>;

export namespace AccessorChain {
  export type GetTarget<R, A extends any[]> = A extends []
    ? R
    : A extends [infer K, ...infer NextAccessors]
    ? K extends keyof R
      ? GetTarget<R[K], NextAccessors>
      : R
    : R;

  export type Unsafe = readonly (string | number | symbol)[];

  type MAX_DEPTH = 8;

  export type Safe<
    T = unknown,
    K extends keyof T = keyof T,
    Depth extends number = 0
  > = Depth extends MAX_DEPTH
    ? []
    : T extends {}
    ? K extends keyof T
      ? [] | [K] | [K, ...Safe<T[K], keyof T[K], Increment<Depth>>]
      : []
    : [];
}

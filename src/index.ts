
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Nor, Append, Reverse, And, Not, Tuple } from "typebolt";

type IsNullable<T> = undefined extends T ? true : null extends T ? true : false;

// Private
// Should never be accessed at runtime
// Only used statically

const ROOT = Symbol();
type ROOT = typeof ROOT

const TYPE = Symbol();
type ORIGINAL_TYPE = typeof TYPE

const SAFE = Symbol();
type SAFE = typeof SAFE

const ACCESSOR = Symbol();
type ACCESSOR = typeof ACCESSOR

type AccessorChain = (string | number | symbol)[];

//
// PRIVATE
//

type Wrapped<
  T = unknown,
  Root = T,
  SafeAccess extends boolean = boolean,
  ParentNullable extends boolean = boolean,
  CurrentAccessorChain extends AccessorChain = AccessorChain
> = {
  [TYPE]: T;
  [ROOT]: Root;
  [SAFE]: SafeAccess;
  [ACCESSOR]: CurrentAccessorChain;
} & (T extends {}
  ? {
      [K in keyof T]-?: Wrapped<
        T[K],
        Root,
        And<SafeAccess, Not<ParentNullable>>,
        IsNullable<T[K]>,
        [...CurrentAccessorChain, K]
      >;
    }
  : T);

//
// PUBLIC METHODS
//

export type Wrap<
  T
> = Wrapped<T, T, true, false, []>

export type Unwrap<W extends Wrapped> = W[ORIGINAL_TYPE]

export type HasSafeAccess<W extends Wrapped> = W[SAFE]

export type GetAccessorChain<W extends Wrapped> = W[ACCESSOR]

//
//
// TODO
//
//

export type AccessorFunction<
  Root,
  Target extends Wrapped<unknown, Root, boolean> = Wrapped<unknown, Root, true>
> = (root: Wrap<Root>) => Target;

export type SafeAccessorFunction<
  Root,
  Target extends Wrapped<unknown, Root, true> = Wrapped<unknown, Root, true>
> = AccessorFunction<Root, Target>

export type GetAccessorTarget<
  A extends AccessorFunction<any, Wrapped>,
> = A extends SafeAccessorFunction<any, infer Target> ? Unwrap<Target> : never;


      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { And, Not } from 'typebolt';
import { AccessorChain } from './AccessorChain';

export type IsNullable<T> = undefined extends T
  ? true
  : null extends T
  ? true
  : false;

// Private
// Should never be accessed at runtime
// Only used statically

export const ROOT = Symbol();
export type ROOT = typeof ROOT;

export const TYPE = Symbol();
export type ORIGINAL_TYPE = typeof TYPE;

export const SAFE = Symbol();
export type SAFE = typeof SAFE;

export const ACCESSOR = Symbol();
export type ACCESSOR = typeof ACCESSOR;

//
// PRIVATE
//

export type Wrapped<
  T = unknown,
  Root = T,
  SafeAccess extends boolean = boolean,
  ParentNullable extends boolean = boolean,
  CurrentAccessorChain extends AccessorChain<unknown> = AccessorChain<unknown>
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

export type AccessorFunction<
  Root,
  Target extends Wrapped<unknown, Root, boolean> = Wrapped<
    unknown,
    Root,
    true
  >
> = (root: Accessible.Wrap<Root>) => Target;

export namespace AccessorFunction {
  export type Safe<
    Root,
    Target extends Wrapped<unknown, Root, true> = Wrapped<
      unknown,
      Root,
      true
    >
  > = AccessorFunction<Root, Target>;

  export type GetTarget<
    A extends AccessorFunction<any, Wrapped>
  > = A extends AccessorFunction.Safe<any, infer Target>
    ? Accessible.Unwrap<Target>
    : never;

  export type ToChain<
    A extends AccessorFunction<any, Wrapped>
  > = A extends AccessorFunction.Safe<any, infer Target>
    ? Accessible.GetAccessorChain<Target>
    : never;
}

// This is only for AccessorFunctions, so name should be related to Functions.
// TODO: Find correct name: Accessor, Graph, Node, Accessed, Accessible, Wrap ?
export namespace Accessible {
  export type Wrap<T> = Wrapped<T, T, true, false, []>;

  export type Unwrap<W extends Wrapped> = W[ORIGINAL_TYPE];

  export type HasSafeAccess<W extends Wrapped> = W[SAFE];

  export type GetAccessorChain<W extends Wrapped> = W[ACCESSOR];

  /**
   * Return a Proxy that pushes accessors to accessorChain, recursively
   */
  function createAccessorChainFiller(accessorChain: string[]) {
    const fillerProxy: ProxyHandler<any> = new Proxy(
      {},
      {
        get: (node: any, name: string) => {
          // Push current accessor to accessor chain
          accessorChain.push(name);
          // Fill accessors recursively
          return fillerProxy;
        },
      }
    );
    return fillerProxy;
  }

  /**
   * Transform accessor function to accessor chain
   * e.g. (_ => _.a.b.c) will return ['a', 'b', 'c']
   */
  export function getAccessorChain<
    Root,
    A extends AccessorFunction<Root>
  >(accessor: A): Readonly<AccessorFunction.ToChain<A>> {
    // Create empty mutable accessorChain
    const accessorChain: string[] = [];
    const accessorChainFiller = createAccessorChainFiller(
      accessorChain
    );

    // Fill accessorChain
    accessor(accessorChainFiller as Accessible.Wrap<Root>);

    // Return immutable accessorChain
    return (accessorChain as readonly string[]) as AccessorFunction.ToChain<A>;
  }

  export namespace getAccessorChain {
    export function forRoot<R>(root?: R) {
      return function <A extends AccessorFunction<R>>(accessor: A) {
        return getAccessorChain<R, A>(accessor);
      };
    }
  }
}

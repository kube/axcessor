
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import {
  And,
  Assert,
  IsExactType,
  IsType,
  Not,
  Increment,
} from 'typebolt';

export type IsNullable<T> = undefined extends T
  ? true
  : null extends T
  ? true
  : false;

// Private
// Should never be accessed at runtime
// Only used statically

const ROOT = Symbol();
type ROOT = typeof ROOT;

const TYPE = Symbol();
type ORIGINAL_TYPE = typeof TYPE;

const SAFE = Symbol();
type SAFE = typeof SAFE;

const ACCESSOR = Symbol();
type ACCESSOR = typeof ACCESSOR;

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

// TODO: Find correct name: Accessor, Graph, Node, Accessed, Accessible, Wrap ?
export namespace Accessible {
  export type Wrap<T> = Wrapped<T, T, true, false, []>;

  export type Unwrap<W extends Wrapped> = W[ORIGINAL_TYPE];

  export type HasSafeAccess<W extends Wrapped> = W[SAFE];

  export type GetAccessorChain<W extends Wrapped> = W[ACCESSOR];
}

//
//
// ACCESSOR CHAIN
//
//

export type AccessorChain = AccessorChain.Safe;

export namespace AccessorChain {
  export type GetTarget<R, A extends any[]> = A extends []
    ? R
    : A extends [infer K, ...infer NextAccessors]
    ? K extends keyof R
      ? GetTarget<R[K], NextAccessors>
      : R
    : R;

  //
  // TEST GET TARGET
  //

  {
    type Root = { a: { b: { c1: number; c2: { d: string } } } };

    type T = GetTarget<Root, ['a', 'b']>;
    type T0 = GetTarget<Root, ['a', 'b', 'c1']>;
    type T1 = GetTarget<Root, ['a', 'b', 'c2']>;
    type T2 = GetTarget<Root, ['a', 'b', 'c2', 'd']>;
  }

  export type UnsafeAccessorChain = readonly (
    | string
    | number
    | symbol
  )[];

  type MAX_DEPTH = 8;

  // TODO: Rename
  type SafeAccessorChain<
    T = unknown,
    K extends keyof T = keyof T,
    Depth extends number = 0
  > = Depth extends MAX_DEPTH
    ? []
    : T extends {}
    ? K extends keyof T
      ?
          | []
          | [K]
          | [
              K,
              ...SafeAccessorChain<T[K], keyof T[K], Increment<Depth>>
            ]
      : []
    : [];

  export type Safe<T = unknown> = unknown extends T
    ? UnsafeAccessorChain
    : SafeAccessorChain<T>;

  // export type Safe1<T = unknown, K extends keyof T = keyof T> = [] | [K]

  //
  // TEST
  //
  type Root = { a1: { b1: true }; a2: { b2: false } };

  // Valid paths
  Assert<IsType<AccessorChain.Safe<Root>, ['a1']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a1', 'b1']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a2']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a2', 'b2']>>();

  // Nested property exists on different path
  Assert.False<IsType<AccessorChain.Safe<Root>, ['a1', 'b2']>>();

  // Nested property exists on different path
  Assert.False<IsType<AccessorChain.Safe<Root>, ['a1', 'b2']>>();
  Assert.False<IsType<AccessorChain.Safe<Root>, ['a2', 'b1']>>();

  // Property does not exist
  Assert.False<IsType<AccessorChain.Safe<Root>, ['a3']>>();
  Assert.False<IsType<AccessorChain.Safe<Root>, ['a3', 'b2']>>();

  Assert<IsExactType<Safe<unknown>, UnsafeAccessorChain>>();
  Assert<IsExactType<Safe<any>, UnsafeAccessorChain>>();

  {
    type Root = {
      a: {
        b1: {
          c: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
        };
        b2: {
          c: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
        };
        b3: {
          c: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
        };
        b4: {
          c: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
        };
        b5: {
          c1: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
          c2: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
          c3: { d: { e: { f: { g: { h: { i: { j: true } } } } } } };
        };
      };
    };

    type Valid<T> = IsType<AccessorChain.Safe<Root>, T>;

    Assert<Valid<[]>>();
    Assert<Valid<['a']>>();
    Assert<Valid<['a', 'b1']>>();
    Assert<Valid<['a', 'b2']>>();
    Assert<Valid<['a', 'b3']>>();
    Assert<Valid<['a', 'b4']>>();
    Assert<Valid<['a', 'b5']>>();
    Assert<Valid<['a', 'b1', 'c']>>();
    Assert<Valid<['a', 'b2', 'c']>>();
    Assert<Valid<['a', 'b3', 'c']>>();
    Assert<Valid<['a', 'b4', 'c']>>();
    Assert<Valid<['a', 'b5', 'c1']>>();
    Assert<Valid<['a', 'b5', 'c2']>>();
    Assert<Valid<['a', 'b5', 'c3']>>();
    Assert<Valid<['a', 'b5', 'c3', 'd']>>();
    Assert<Valid<['a', 'b5', 'c3', 'd', 'e']>>();
    Assert<Valid<['a', 'b5', 'c3', 'd', 'e', 'f']>>();
    Assert<Valid<['a', 'b5', 'c3', 'd', 'e', 'f', 'g']>>();
    Assert<Valid<['a', 'b5', 'c3', 'd', 'e', 'f', 'g', 'h']>>();

    // @ts-expect-error
    // Accessor depth is > MAX_DEPTH
    Assert<Valid<['a', 'b5', 'c3', 'd', 'e', 'f', 'g', 'h', 'i']>>();
  }
}

//
//
// ACCESSOR FUNCTION
//
//

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

//
// RUNTIME
//

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

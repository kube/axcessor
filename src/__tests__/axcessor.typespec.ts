
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Assert, IsExactType, IsType } from 'typebolt';
import { AccessorFunction, AccessorChain, Accessible } from '..';

/// Describe: AccessorChain
{
  type Root = { a: { b: { c1: number; c2: { d: { e: {} } } } } };

  Assert<IsType<AccessorChain.Safe<Root>, []>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a', 'b']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a', 'b', 'c1']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a', 'b', 'c2']>>();
  Assert<IsType<AccessorChain.Safe<Root>, ['a', 'b', 'c2', 'd']>>();
  Assert<
    IsType<AccessorChain.Safe<Root>, ['a', 'b', 'c2', 'd', 'e']>
  >();
}

/// Describe: Sets object optional properties as required'
{
  /// Test: On first level
  {
    type Root = { a: { b: { c: number } } };
    type R = Accessible.Wrap<Root>;

    Assert<IsType<number, R['a']['b']['c']>>();
  }
  {
    type Root = { a?: 42 };
    type R = Accessible.Wrap<Root>;

    Assert<IsType<42, R['a']>>();
  }

  /// Test: on nested levels
  {
    type Root = {
      a?: { b?: { c?: { d?: 42 } } };
    };
    type R = Accessible.Wrap<Root>;

    Assert<IsType<42, R['a']['b']['c']['d']>>();
  }

  /// Test: Using array index
  {
    type Root = {
      a: { b: string; c: number }[];
    };

    type R = Accessible.Wrap<Root>;

    // TODO: In these cases, if is not a tuple, it should be an unsafe access.
    Assert<IsType<string, R['a'][number]['b']>>();
    Assert<IsType<string, R['a'][0]['b']>>();
  }

  /// Test: Exposes SafeAccess flag
  {
    type Root = {
      a1: { b: { c?: { d: 42 } } };
      a2?: { b?: { c: { d: 42 } } };
    };
    type R = Accessible.Wrap<Root>;

    Assert.True<Accessible.HasSafeAccess<R['a1']['b']>>();
    // R.a1.b.c can be safely accessed as only target can be undefined
    Assert.True<Accessible.HasSafeAccess<R['a1']['b']['c']>>();
    // R.a2 can be safely accessed as only target can be undefined
    Assert.True<Accessible.HasSafeAccess<R['a2']>>();

    // R.a1.b.c.d cannot be accessed safely because c can be undefined
    Assert.False<Accessible.HasSafeAccess<R['a1']['b']['c']['d']>>();
    // R.a2.b.c.d cannot be accessed safely because a2 can be undefined
    Assert.False<Accessible.HasSafeAccess<R['a2']['b']>>();
    // R.a2.b.c.d cannot be accessed safely because a2 and b can be undefined
    Assert.False<Accessible.HasSafeAccess<R['a2']['b']['c']['d']>>();
  }

  /// Test: SafeAccess flag for Arrays

  // TODO

  /// Test: SafeAccess flag for Tuples

  // TODO

  /// Test: Exposes AccessorChain
  {
    type Root = {
      a1: { b: { c?: { d: 42 }; 1337: { d: true } } };
    };
    type R = Accessible.Wrap<Root>;

    {
      type Accessor = Accessible.GetAccessorChain<R['a1']>;
      Assert<IsExactType<Accessor, ['a1']>>();
    }
    {
      type Accessor = Accessible.GetAccessorChain<R['a1']['b']>;
      Assert<IsExactType<Accessor, ['a1', 'b']>>();
    }
    {
      type Accessor = Accessible.GetAccessorChain<R['a1']['b']['c']>;
      Assert<IsExactType<Accessor, ['a1', 'b', 'c']>>();
    }
    {
      type Accessor = Accessible.GetAccessorChain<
        R['a1']['b']['c']['d']
      >;
      Assert<IsExactType<Accessor, ['a1', 'b', 'c', 'd']>>();
    }
    {
      type Accessor = Accessible.GetAccessorChain<
        R['a1']['b'][1337]['d']
      >;
      Assert<IsExactType<Accessor, ['a1', 'b', 1337, 'd']>>();
    }
  }
}

//
//
// TODO STARTS HERE
//
//

declare function get<R, A extends AccessorFunction.Safe<R>>(
  root: R,
  accessor: A
): AccessorFunction.GetTarget<A>;

type Root = {
  a1: { b: { c?: { d: 42 } } };
};

declare const root: Root;

{
  const x = get(root, _ => _.a1);
  type X = typeof x;
  Assert<IsExactType<X, Root['a1']>>();
}
{
  const x = get(root, _ => _.a1.b);
  type X = typeof x;
  Assert<IsExactType<X, Root['a1']['b']>>();
}
{
  const x = get(root, _ => _.a1.b.c);
  type X = typeof x;
  Assert<IsExactType<X, Root['a1']['b']['c']>>();
}

// {
//   // @ts-expect-error Should fail
//   const x = get(root, _ => _.a1.b.c.d)
//   type X = typeof x
//   Assert<IsExactType<X, never>>()
// }

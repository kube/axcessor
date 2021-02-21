
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Assert, IsType, IsExactType } from "typebolt";
import {
  Wrap,
  Unwrap,
  HasSafeAccess,
  GetAccessorChain,
  SafeAccessorFunction,
  GetAccessorTarget,
} from ".";

/// Describe: Sets object optional properties as required'
{
  /// Test: On first level
  {
    type Root = { a?: 42 };
    type R = Wrap<Root>;

    Assert<IsType<Root["a"], 42 | undefined>>();
    Assert<IsType<42, R["a"]>>();
  }

  /// Test: on nested levels
  {
    type Root = {
      a?: { b?: { c?: { d?: 42 } } };
    };
    type R = Wrap<Root>;

    Assert<IsType<42, R["a"]["b"]["c"]["d"]>>();
  }

  /// Test: Exposes SafeAccess flag
  {
    type Root = {
      a1: { b: { c?: { d: 42 } } };
      a2?: { b?: { c: { d: 42 } } };
    };
    type R = Wrap<Root>;

    Assert.True<HasSafeAccess<R["a1"]["b"]>>();
    // R.a1.b.c can be safely accessed as only target can be undefined
    Assert.True<HasSafeAccess<R["a1"]["b"]["c"]>>();
    // R.a2 can be safely accessed as only target can be undefined
    Assert.True<HasSafeAccess<R["a2"]>>();

    // R.a1.b.c.d cannot be accessed safely because c can be undefined
    Assert.False<HasSafeAccess<R["a1"]["b"]["c"]["d"]>>();
    // R.a2.b.c.d cannot be accessed safely because a2 can be undefined
    Assert.False<HasSafeAccess<R["a2"]["b"]>>();
    // R.a2.b.c.d cannot be accessed safely because a2 and b can be undefined
    Assert.False<HasSafeAccess<R["a2"]["b"]["c"]["d"]>>();
  }

  /// Test: Exposes AccessorChain
  {
    type Root = {
      a1: { b: { c?: { d: 42 }, 1337: { d: true } } };
    };
    type R = Wrap<Root>;

    {
      type Accessor = GetAccessorChain<R["a1"]>;
      Assert<IsExactType<Accessor, ["a1"]>>();
    }
    {
      type Accessor = GetAccessorChain<R["a1"]["b"]>;
      Assert<IsExactType<Accessor, ["a1", "b"]>>();
    }
    {
      type Accessor = GetAccessorChain<R["a1"]["b"]["c"]>;
      Assert<IsExactType<Accessor, ["a1", "b", "c"]>>();
    }
    {
      type Accessor = GetAccessorChain<R["a1"]["b"]["c"]["d"]>;
      Assert<IsExactType<Accessor, ["a1", "b", "c", "d"]>>();
    }
    {
      type Accessor = GetAccessorChain<R["a1"]["b"][1337]["d"]>;
      Assert<IsExactType<Accessor, ["a1", "b", 1337, "d"]>>();
    }
  }
}

//
//
// TODO STARTS HERE
//
//

declare function get<R, A extends SafeAccessorFunction<R>>(
  root: R,
  accessor: A
): GetAccessorTarget<A>;

type Root = {
  a1: { b: { c?: { d: 42 } } };
};

declare const root: Root;

{
  const x = get(root, _ => _.a1);
  type X = typeof x
  Assert<IsExactType<X, Root['a1']>>()
}
{
  const x = get(root, _ => _.a1.b);
  type X = typeof x
  Assert<IsExactType<X, Root['a1']['b']>>()
}
{
  const x = get(root, _ => _.a1.b.c);
  type X = typeof x
  Assert<IsExactType<X, Root['a1']['b']['c']>>()
}

{
  // @ts-expect-error Should fail
  const x = get(root, _ => _.a1.b.c.d);
  type X = typeof x
  Assert<IsExactType<X, never>>()
}


// test('runtime', () => {
//   const target = get(root, _ => _.a1.b)
//   target
// })


      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Assert, IsExactType, IsType } from 'typebolt';
import { AccessorChain } from '../AccessorChain';

//
// TEST GET TARGET 
//
{
  {
    type Root = { a: { b: { c1: number; c2: { d: string } } } };

    type T = AccessorChain.GetTarget<Root, ['a', 'b']>;
    type T0 = AccessorChain.GetTarget<Root, ['a', 'b', 'c1']>;
    type T1 = AccessorChain.GetTarget<Root, ['a', 'b', 'c2']>;
    type T2 = AccessorChain.GetTarget<Root, ['a', 'b', 'c2', 'd']>;
  }
}

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

Assert<IsExactType<AccessorChain<unknown>, AccessorChain.Unsafe>>();
Assert<IsExactType<AccessorChain<any>, AccessorChain.Unsafe>>();

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

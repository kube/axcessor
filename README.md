# Axcessor

## Install

```sh
npm install --save axcessor
```

## Introduction

Axcessor is a library permitting to create object accessors (path of properties from the root of an object to a nested target property), using functions or arrays.

```ts
type Root = {
  a: {

    b: {
      c: {
        d: {
          e: number
        }
      }
    }
  }
}


// Using Accessor Function
const x = axcessor<Root>(_ => _.a.b.c.d.e) // Target: number

// Using Accessor Chain
const y = axcessor<Root>(['a', 'b', 'c', 'd', 'e']) // Target: number
```

## Type-Safety



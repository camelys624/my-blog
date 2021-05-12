---
title: Learn Proxy
date: 2021-5-6
image: 'https://github.com/ziishaned/learn-regex/raw/master/img/regexp-cn.png'
imageAlt: Proxy
---

**Proxy** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

## 语法

```js
const p = new Proxy(target, handler)
```

Proxy 对象的所有用法，都是上面这种形式，不同的只是`handler`参数的写法。其中，`new Proxy()`表示生成一个`Proxy`实例，`target`参数表示所要拦截的目标对象，`handler`参数也是一个对象，用来定制拦截行为。

一个简单的用法。

```js
let proxy = new Proxy({}, {
    get: function (target, propKey) {
        return prop in target ? target[propKey] : 35;  
    }
});

proxy.a = 2;

console.log(proxy.a)    // -> 2
console.log(proxy.test) // -> 35
```

Proxy 实例也可以作为其它对象的原型对象

```js
let obj = Object.create(proxy);
obj.test    // -> 35
```

同一个拦截器函数，可以设置拦截多个操作。

```js
let handler = {
    get: function (target, propKey) {
        if (propKey === 'prototype') {
            return Object.prototype;
        }
        return 'Hello, ' + propKey
    },
    apply: function(target, thisBinding, args) {
        return args[0];
    },
    construct: function(target, args) {
        return {value: args[1]};
    }
};

let fproxy = new Proxy(function(x, y) {
    return x + y;
}, handler);

fproxy(1, 2)    // -> 1
new fproxy(1, 2)    // -> {value: 2}
fproxy.prototype === Object.prototype   // -> true
fproxy.foo === 'Hello, foo' // -> true
```

## handler 对象的方法

`handler`对象是一个容纳一批特定属性的占位符对象。它包含有`Proxy`的各个捕获器（trap）。

所有的捕获其都是可选的。如果没有定义某个捕获器，那么就会保留源对象的默认行为。

- `getPrototypeOf(target)`    `Object.getPrototypeOf(proxy)`方法的捕获器，返回一个对象。
- `setPrototypeOf(target, proto)`    `Object.setPrototypeOf(proxy, proto)`方法的捕获器，返回一个布尔值。如果目标对象是一个函数，那么还有两种额外操作可以拦截。
- `isExtensible(target)`      `Object.isExtensible(proxy)`方法的捕获器，返回一个布尔值。
- `preventExtensions(target)` `Object.preventExtensions(proxy)`方法的捕获器，返回一个布尔值。
- `getOwnPropertyDescriptor(target, propKey)`  `Object.getOwnPropertyDescriptor(proxy, propKey)`方法的捕获器，返回属性的描述对象。
- `defineProperty(target, propKey, propDesc)`    `Object.defineProperty(proxy, propKey, propDesc)`、`Object.defineProperties(proxy, propDescs)`方法的捕获器，返回一个布尔值。
- `has(target, propKey)`               `propKey in proxy`操作符的捕获器，返回一个布尔值。
- `get(target, propKey, receiver)`               属性读取操作的捕获器。
- `set(target, propKey, value, receiver)`               属性设置操作的捕获器。
- `deleteProperty(target, propKey)`    `delete`操作符的捕获器，返回一个布尔值。
- `ownKeys(target)`           `Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`、`for...in`方法的捕获器，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而`Object.keys()`的返回结果仅包括目标对象的可遍历属性。
- `apply(target, object, args)`             函数调用操作的捕获器，比如`proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(...)`。
- `construct()`         `new`操作符的捕获器。

### get()

`get`方法用于拦截某个属性的读取操作，可以接受三个参数，依次为目标对象、属性名和 proxy 实例本身（这个参数可选）。

下面是一个拦截读取操作的例子。

```js
let person = {
    name: '张三'
};

let proxy = new Proxy(person, {
    get: function(target, propKey) {
        if (propKey in target) {
            return target[propKey];
        } else {
            throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.")
        }
    }
})

proxy.name  // -> 张三
proxy.age   // -> 抛出错误
```

`get`方法可以继承。

```js
let proto = new Proxy({}, {
    get (target, propKey, receiver) {
        console.log('GET ' + propKey);
        return target[propKey];
    }
});

let obj = Object.create(proto);
obj.test    // -> GET test
```

下面的例子使用`get`拦截，实现数组读取负数的索引。

```js
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
          propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  }

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'c', 'd', 'e');
arr[-1] // -> e
```

利用 Proxy，可以将读取属性的操作`get`，转变为执行，某个函数，从而实现属性的链式操作。

```js
let pipe = function (value) {
    let funStack = [];
    let proxy = new Proxy({}, {
        get: function (pipeObject, fnName) {
            if (fnName === 'get') {
                return funStack.reduce(function (val, fn) {
                    return fn(val)
                }, value)
            }

            funStack.push(window[fnName]);
            return proxy;
        }
    });
    return proxy;
}

var double = n => n * 2;
var pow = n => n * n;
var reverseInt = n => n.toString().split("").reverse().join("") | 0;

pipe(3).double.pow.reverseInt.get;  // -> 63
```

## 例子

```js
let obj = new Proxy({}, {
    get: function (target, propKey, receiver) { // receiver Proxy 或者继承 Proxy 的对象
        console.log(`getting ${propKey}`);
        return Reflect.get(target, propKey, receiver);
    },
    set: function (target, propKey, value, receiver) {
        console.log(`setting ${propKey}`);
        return Reflect.set(target, propKey, value, receiver);
    }
})
```

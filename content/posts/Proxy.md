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
- `handler.setPrototypeOf()`    `Object.setPrototypeOf()`方法的捕获器。
- `handler.isExtensible()`      `Object.isExtensible()`方法的捕获器。
- `handler.preventExtensions()` `Object.preventExtensions()`方法的捕获器。
- `handler.getOwnPropertyDescriptor()`  `Object.getOwnPropertyDescriptor()`方法的捕获器。
- `handler.defineProperty()`    `Object.defineProperty()`方法的捕获器。
- `handler.has()`               `in`操作符的捕获器。
- `handler.get()`               属性读取操作的捕获器。
- `handler.set()`               属性设置操作的捕获器。
- `handler.deleteProperty()`    `delete`操作符的捕获器。
- `handler.ownKeys()`           `Object.getOwnPropertyNames`方法和`Object.getOwnPropertySymbols`方法的捕获器。
- `handler.apply()`             函数调用操作的捕获器。
- `handler.construct()`         `new`操作符的捕获器。

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

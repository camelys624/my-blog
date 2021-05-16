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

上面代码设置 Proxy 以后，达到了将函数名链式使用的效果。

下面的例子则是利用`get`拦截，实现一个生成各种 DOM 节点的通用函数`dom`。

```js
const dom = new Proxy({}, {
    get(target, property) {
        return function(attrs = {}, ...children) {
            const el = document.createElement(property);
            for (let prop of Object.keys(attrs)) {
                el.setAttribute(prop, attrs[prop]);
            }

            for (let child of children) {
                if (typeof child === 'string') {
                    child = document.createTextNode(child);
                }
                el.appendChild(child);
            }
            return el;
        }
    }
})

const el = dom.div({},
    'Hello, my name is ',
    dom.a({href: '//example.com'}, 'Mark'),
    '. I like:',
    dom.ul({},
        dom.li({}, 'The web'),
        dom.li({}, 'Food'),
        dom.li({}, '...actually that\'s it')
    )
);

document.body.appendChild(el);
```

下面是一个`get`方法的第三个参数的例子，它总是指向原始的读操作所在的那个对象，一般情况下就是 Proxy 实例。

```js
const proxy = new Proxy({}, {
    get: function(target, key, receiver) {
        return receiver;
    }
});

proxy.getReceiver === proxy // -> true
```

上面代码中，`proxy`对象的`getReceiver`属性是由`proxy`对象提供的，所以`receiver`指向`proxy`对象。

```js
const proxy = new Proxy({}, {
    get: function(target, key, receiver) {
        return receiver;
    }
});

const d = Object.create(proxy);
d.a === d // -> true
```

上面代码中，`d`对象本身没有`a`属性，所以读取`d.a`的时候，会去`d`的原型`proxy`对象找。这时，`receiver`就指向`d`，代表原始的读操作所在的那个对象。

如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则通过 Proxy 对象访问该属性会报错。

```js
const target = Object.defineProperties({}, {
    foo: {
        value: 123,
        writable: false,
        configurable: false
    },
});

const handler = {
    get(target, propKey) {
        return 'abc'
    }
}

console.log(target)

const proxy = new Proxy(target, handler);
proxy.foo   // -> Uncaught TypeError
```

### set()

`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。

假定`Person`对象有一个`age`属性，该属性应该是一个不大于200的整数，那么可以使用`Proxy`保证`age`的属性符合要求。

```js
let validator = {
    set: function(obj, prop, value) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer');
            }
            if (value > 200) {
                throw new RangeError('The age seems invalid');
            }
        }

        // 对于满足条件的 age 属性以及其它属性，直接保存
        obj[prop] = value;
        return true;
    }
}

let person = new Proxy({}, validator);

person.age = 100;

person.age  // -> 100
person.age = 'young';   // 报错
person.age = 210;   // 报错
```

上面代码中，由于设置了存值函数`set`，任何不符合要求的`age`属性赋值，都会抛出一个错误，这是数据验证的一种实现方法。利用`set`方法，还可以数据绑定，即每当对象发生变化时，会自动更新 DOM。

有时，我们会在对象上面设置内部属性，属性名的每一个字符使用下划线开头，表示这些属性不应该被外部使用。结合`get`和`set`方法，就可以做到防止这些内部属性被外部读写。

```js
let invariant = (key, action) => {
    if (key[0] === '_') {
        throw new Error(`invalid attempt to ${action} private "${key}" property.`)
    }
}

const handler = {
    get (target, key) {
        invariant(key, 'get');
        return target[key];
    },
    set (target, key, value) {
        invariant(key, 'set');
        target[key] = value;
        return true;
    }
}

const target = {};
const proxy = new Proxy(target, handler);
proxy._prop;    // Uncaught Error: invalid attempt to get private "_prop" property.
proxy._prop = 'c';    // Uncaught Error: invalid attempt to set private "_prop" property.
```

上面代码中，只要读写的属性名的第一个字符时下划线，一律抛错，从而达到禁止读写内部属性的目的。

**注意，如果目标对象自身的某个属性不可写，那么`set`方法将不起作用。**

```js
const obj = {};

Object.defineProperty(obj, 'foo', {
    value: 'bar',
    writable: false
});

const handler = {
    set: function(obj, prop, value, receiver) {
        obj[prop] = 'bar';
        return true;
    }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';  // Uncaught TypeError: 'set' on proxy: trap returned truish for property 'foo' which exists in the proxy target as a non-configurable and non-writable data property with a different value
proxy.foo;  // -> bar
```

上面代码中，`obj.foo`属性不可写，Proxy 对这个属性的`set`代理将不会生效。。

**注意，`set`代理应当返回一个布尔值。严格模式下，`set`代理如果没有返回`true`，就会报错。**

```js
'use strict';
const handler = {
    set: function (obj, prop, value, receiver) {
        obj[prop] = receiver;
        // 无论有没有下面这一行，都会报错
        return false;
    }
}

const proxy = new Proxy({}, handler);

// 在控制台设置可以成功，可能控制台不是严格模式
proxy.foo = 'bar';  // Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

上面代码中，严格模式下，`set`代理如果没有返回`true`，就会报错。

### apply()

`apply`方法拦截函数的调用、`call`和`apply`操作。

`apply`方法接受三个参数，分别是目标对象、目标对象的上下文对象 (`this`) 和目标对象的参数数组。

```js
const handler = {
    apply (target, ctx, args) {
        return Reflect.apply(...arguments);
    }
}
```

下面是一个例子。

```js
const target = function() {return 'I am the target'};

const handler = {
    apply: function() {
        return 'T am the proxy.';
    }
};

let p = new Proxy(target, handler);
p(); // "I am the proxy"
```

上面代码中，变量`p`是 Proxy 的实例，当它作为函数调用时（`p()`），就会被`apply`方法拦截，返回一个字符串。

上面是另一个例子。

```js
let twice = {
    apply(target, ctx, args) {
        return Reflect.apply(...arguments) * 2;
    }
}

let sum = (left, right) => {
    return left + right;
}

let proxy = new Proxy(sum, twice);
proxy(1, 2);    // -> 6
proxy.call(null, 2, 3); // -> 10
proxy.apply(null, [3, 4]);  // -> 14
```

上面代码中，每当执行`proxy`函数（直接调用或`call`和`apply`调用），就会被`apply`方法拦截。

另外，直接`Reflect.apply`方法，也会被拦截。

```js
Reflect.apply(proxy, null, [9, 10]) // 38
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

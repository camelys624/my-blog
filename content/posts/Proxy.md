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

### has()

`has()`方法用来拦截`HasProperty`操作，即判断对象是否具有某个属性时，这个方法会生效。典型的操作就是`in`运算符。

`has()`方法可以接受两个参数，分别是目标对象、需要查询的属性名。

下面的例子使用`has()`方法隐藏某些属性，不被`in`运算符发现。

```js
const handler = {
    has (target, key) {
        if (key[0] === '_') {
            return false;
        }

        return key in target;
    }
};

let target = {_prop: 'foo', prop: 'foo'};
let proxy = new Proxy(target, handler);

'_prop' in proxy;   // false
```

上面代码中，如果原对象的属性名的第一个字符是下划线，`proxy.has()`就会返回`false`，从而不会被`in`运算符发现。

如果原对象不可配置或者禁止扩展，这时`has()`拦截会报错。

```js
let obj = {a: 10};
Object.preventExtensions(obj);

let p = new Proxy(obj, {
    has: function(target, prop) {
        return false;
    }
});

'a' in p    // Uncaught TypeError: 'has' on proxy: trap returned falsish for property 'a' but the proxy target is not extensible
```

上面代码中，`obj`对象禁止扩展，如果使用`has`拦截就会报错。也就是说，如果某个属性不可配置（或者目标对象不可扩展），则`has()`方法就不得“隐藏”（即返回`false`）目标对象的该属性。

值得注意的是，`has()`方法拦截的是`HasProperty`操作，而不是`HasOwnProperty`操作，即`has()`方法不判断一个属性是对象自身的属性，还是继承的属性。

另外，虽然`for...in`循环也用到了`in`运算符，但是`has()`拦截对`for...in`循环不生效。

```js
let stu1 = {name: '张三', score: 59};
let stu2 = {name: '李四', score: 99};

let handler = {
    has(target, prop) {
        if (prop === 'score' && target[prop] < 60) {
            console.log(`${target.name} 不及格`);
            return false;
        }

        return prop in target;
    }
}

let oproxy1 = new Proxy(stu1, handler);
let oproxy2 = new Proxy(stu2, handler);

'score' in oproxy1
// 张三 不及格
// false

'score' in oproxy2
// true

for (let a in oproxy1) {
    console.log(oproxy1[a]);
}

// 张三
//59

for (let b in oproxy2) {
    console.log(oproxy2[b]);
}
// 李四
// 99
```

上面代码中，`has()`拦截只对`in`运算符生效，对`for...in`循环不生效，导致不符合要求的属性没有被`for...in`循环所排除。

### construct()

`construct()`方法用于拦截`new`命令，下面是拦截对象的写法。

```js
const handler = {
    construct (target, args, newTarget) {
        return new target(...args);
    }
}
```

`construct()`方法可以接受三个参数。

- `target`: 目标对象。
- `args`: 构造函数的参数数组。
- `newTarget`: 创造实例对象时，`new`命令作用的构造函数（下面例子的`p`）。

```js
const p = new Proxy(function() {}, {
    construct: function(target, args) {
        console.log('called: ' + args.join(', '));
        return {value: args[0] + 10};
    }
});

(new p(1)).value;
// called: 1
// 11
```

`construct()`方法返回的必须是一个对象，否则会报错。

```js
const p = new Proxy(function() {}, {
    construct: function(target, arguments) {
        return 1;
    }
});

new p() // Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

另外，由于`construct()`拦截的是构造函数，所以**它的目标对象必须是函数**，否则就会报错。

```js
const p = new Proxy({}, {
    construct: function(target, argumentsList) {
        return {}
    }
})

new p() // Uncaught TypeError: p is not a constructor
```

上面例子中，拦截的目标对象不是一个函数，而是一个对象（`new Proxy`的第一个参数），导致报错。

**注意，`construct()`方法中的`this`指向的是`handler`，而不是实例对象。**

```js
const handler = {
    construct: function(target, args) {
        console.log(this === handler);
        return new target(...args);
    }
}

let p = new Proxy(function () {}, handler);
new p() // -> true
```

### deleteProperty()

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除。

```js
let invariant = (key, action) => {
    if (key[0] === '_') {
        throw new Error(`invalid attempt to ${action} private "${key}" property`)
    }
}
const handler = {
    deleteProperty (target, key) {
        invariant(key, 'delete');
        delete target[key];
        return true;
    }
}

let target = {_prop: 'foo'};
let proxy = new Proxy(target, handler);

delete proxy._prop  // Uncaught Error: invalid attempt to delete private "_prop" property
```

上面代码中，`deleteProperty`方法拦截了`delete`操作符，删除第一个字符为下划线的属性会报错。

### defineProperty()

`defineProperty()`方法拦截了`Object.defineProperty()`操作。

```js
const handler = {
    defineProperty (target, key, descriptor) {
        return false;
    }
};

let target = {};

let proxy = new Proxy(target, handler);
proxy.foo = 'bar'

proxy.foo   // -> undefined
```

上面代码中，`defineProperty()`方法内部没有任何操作，只返回`false`，导致添加新属性总是无效。注意，这里的`false`只是用来提示操作失败，本身并不能阻止添加新属性。

注意，如果目标对象不可扩展（non-extensible），则`defineProperty()`不能增加目标对象上不存在的属性，否则会报错。另外，如果目标对象的某个属性不可写（writable）或不可配置（configurable），则`defineProperty()`方法不得改变这两个设置。

### getOwnPropertyDescriptor()

`getOwnPropertyDescriptor()`方法拦截`Object.getOwnPropertyDescriptor()`，返回一个属性描述对象或者`undefined`。

```js
const handler = {
    getOwnPropertyDescriptor(target, key) {
        if (key[0] === '_') {
            return;
        }

        return Object.getOwnPropertyDescriptor(target, key);
    }
};

let target = {_foo: 'bar', baz: 'tar'};
let proxy = new Proxy(target, handler);

Object.getOwnPropertyDescriptor(proxy, 'waz');  // -> undefined
Object.getOwnPropertyDescriptor(proxy, '_foo'); // -> undefined
Object.getOwnPropertyDescriptor(proxy, 'baz');
// -> {value: "tar", writable: true, enumerable: true, configurable: true}
```

上面代码中，`handler.getOwnPropertyDescriptor()`方法对于第一个字符为下划线的属性名会返回`undefined`。

### getPrototypeOf()

`getPrototypeOf()`方法主要用来拦截获取对象原型。具体来说，拦截下面这些操作。

- `Object.prototype.__proto__`
- `Object.prototype.isPrototypeOf()`
- `Object.getPrototypeOf()`
- `Reflect.getPrototypeOf()`
- `instanceof`

下面是一个例子。

```js
let proto = {};
let p = new Proxy({}, {
    getPrototypeOf(target) {
        return proto;
    }
});
Object.getPrototypeOf(p) === proto  // true
```

上面代码中，`getPrototypeOf()`方法拦截`Object.getPrototypeOf()`，返回`proto`对象。

**注意，`getPrototypeOf()`方法的返回值必须是对象或者`null`，否则报错。**另外，如果目标对象不可扩展（non-extensible），`getPrototypeOf()`方法**必须返回*目标对象*的原型对象**。

### isExtensible()

`isExtensible()`方法拦截`Object.isExtensible()`操作。

```js
let p = new Proxy({}, {
    isExtensible: function(target) {
        console.log('called');
        return true;
    }
});

Object.isExtensible(p)
// called
// true
```

上面代码设置了`isExtensible()`方法，在调用`Object,isExtensible`时会输出`called`。

注意，该方法只能返回布尔值，否则返回值会被自动转为布尔值。

这个方法有一个强限制，它的返回值必须与目标对象的`isExtensible`属性保持一致，否则就会抛出错误。

```js
Object.isExtensible(proxy) === Object.isExtensible(target)
```

下面是一个例子。

```js
let p = new Proxy({}, {
    isExtensible: function(target) {
        return true;
    }
});

Object.isExtensible(p); // Uncaught TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target (which is 'true')
```

### ownKeys()

`ownKeys()`方法用来拦截对象自身属性的读取操作。具体来说，拦截以下操作。

- `Object.getOwnPropertyNames()`
- `Object.getOwnPropertySymbols()`
- `Object.keys()`
- `for...in`循环

下面是拦截`Object.keys()`的例子。

```js
let target = {
    a: 1,
    b: 2,
    c: 3
};

const handler = {
    ownKeys(target) {
        return ['a']
    }
};

let proxy = new Proxy(target, handler);

Object.keys(proxy)
//['a']
```

上面代码拦截了对于`target`对象的`Object.keys()`操作，只返回`a`、`b`、`c`三个属性之中的`a`属性。

`for...in`被拦截也只会返回`target`对象中有的属性。

下面的例子是拦截第一个字符为下划线的属性名。

```js
let target = {
    _bar: 'foo',
    _prop: 'bar',
    prop: 'baz'
};

const handler = {
    ownKeys(target) {
        return Reflect.ownKeys(target).filter(key => key[0] !== '_');
    }
};

let proxy = new Proxy(target, handler);
for (let key of Object.keys(proxy)) {
    console.log(target[key]);
}
// baz
```

注意，**使用`Object.keys()`方法时，有三类属性会被`ownKeys()`方法自动过滤，不会返回。**

- 目标对象上不存在的属性
- 属性名为 Symbol 值
- 不可遍历（`enumerable`）的属性

```js
let target = {
    a: 1,
    b: 2,
    c: 3,
    [Symbol.for('secret')]: 4
};

Object.defineProperty(target, 'key', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: 'static'
});

const handler = {
    ownKeys(target) {
        return ['a', 'd', Symbol.for('secret'), 'key'];
    }
};

let proxy = new Proxy(target, handler);

Object.keys(proxy)
//  ['a']
```

上面代码中，`ownKeys()`方法之中，显式返回不存在的属性（`d`）、Symbol 值（`Symbol.for('secret')`）、不可遍历的属性（`key`），结果都被自动过滤掉。

`ownKeys()`方法还可以拦截`Object.getOwnPropertyNames()`。不受限制，**可以返回不属于对象的属性。**

```js
let target = {
    d: 'test1',
    f: 'test2'
}

let p = new Proxy(target, {
    ownKeys: function() {
        return ['a', 'b', 'c']
    }
})

Object.getOwnPropertyNames(p);
// ["a", "b", "c"]
```

`ownKeys()`方法返回的数组成员，**只能是字符串或 Symbol 值**。如果有其它类型的值，或者返回的根本不是数组，就会报错。

```js
let obj = {};

let p = new Proxy(obj, {
    ownKeys: function (target) {
        return [123, true, undefined, null, {}, []]
    }
});

Object.getOwnPropertyNames(p);
// Uncaught TypeError: 123 is not a valid property name
```

上面代码中，`ownKeys()`方法虽然返回一个数组，但是每一个数组成员都不是字符串或者 Symbol 值，因此就报错了。

如果目标对象自身包含不可配置的属性，则该属性必须被`ownKeys()`方法返回，否则报错。

```js
let obj = {};
Object.defineProperty(obj, 'a', {
    configurable: false,
    enumerable: true,
    value: 10
});

let p = new Proxy(obj, {
    ownKeys: function (target) {
        return ['b'];
    }
});

Object.getOwnPropertyNames(p);
// Uncaught TypeError: 'ownKeys' on proxy: trap result did not include 'a'
```

上面代码中，`obj`对象是不可扩展的，这时`ownKeys()`方法返回的数组之中，包含了`obj`对象的多余属性`b`，所以导致了报错。

### preventExtensions()

`preventExtensions()`方法拦截`Object.preventExtensions()`。该方法必须返回一个布尔值，否则会被自动转为布尔值。

这个方法有一个限制，只有目标对象不可扩展时（即`Object.isExtensible(proxy)`为`false`），`proxy.preventExtensions`才能返回`true`，否则会报错。

```js
const proxy = new Proxy({}, {
    preventExtensions: function(target) {
        return true;
    }
});

Object.preventExtensions(proxy);
// Uncaught TypeError: 'preventExtensions' on proxy: trap returned truish but the proxy target is extensible
```

在上面代码中，`proxy.preventExtensions()`方法返回`true`，但这时`Object.isExtensible(proxy)`会返回`true`，因此报错。

为了防止出现这个问题，通常要在`proxy.preventExtensions()`方法里面，调用一次`Object.preventExtensions()`。

```js
// 感觉一点都不妥
let proxy = new Proxy({}, {
    preventExtensions: function(target) {
        console.log('called');
        Object.preventExtensions(target);
        return true;
    }
})

Object.preventExtensions(proxy)
// 'called'
// Proxy {}
```

### setPrototypeOf()

`setPrototypeOf()`方法主要用来拦截`Object.setPrototypeOf()`方法。

下面是一个例子。

```js
const handler = {
    setPrototypeOf (target, proto) {
        throw new Error('Changing the prototype is forbidden');
    }
};

let proto = {};
let target = function () {};
let proxy = new Proxy(target, handler);
Object.setPrototypeOf(proxy, proto);
// Error: Changing the prototype is forbidden
```

上面代码中，只要修改`target`的原型对象，就会报错。

注意，**该方法只能返回布尔值，否则会被自动转为布尔值**。另外，如果目标对象不可扩展（non-extensible），`setPrototypeOf()`方法不得改变目标对象的原型。

## Proxy.revocable()

`Proxy.revocable()`方法返回一个可取消的 Proxy 实例。

```js
let target = {};
const handler = {};

let {proxy, revoke} = Proxy.revocable(target, handler);

proxy.foo = 123;
proxy.foo   // -> 123

revoke();
proxy.foo;
// Uncaught TypeError: Cannot perform 'get' on a proxy that has been revoked
```

`Proxy.revocable()`方法返回一个对象，该对象的`proxy`属性是`Proxy`实例，`revoke`属性是一个函数，可以取消`Proxy`实例。上面代码中，当执行`revoke`函数之后，再访问`Proxy`实例，就会抛出一个错误。

`Proxy.revocable()`的一个使用场景是，目标对象不允许直接访问，必须通过代理访问，一旦访问结束，就收回代理权，不允许再次访问。

## this 问题

虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下，也无法保证与目标对象的行为一致。主要原因就是在 Proxy 代理的情况下，目标对象内部的`this`关键字会指向 Proxy 代理。

```js
const target = {
    m: function () {
        console.log(this === proxy);
    }
}

const handler = {};

const proxy = new Proxy(target, handler);
target.m()  // -> false
proxy.m()   // -> true
```

`Proxy`修改了`this`的指向，其实我觉得还好，本来就是返回的`Proxy`实例，确实应该指向`proxy`。但是他们好像希望`this`指向不变。

下面是一个例子，由于`this`指向的变化，导致 Proxy 无法代理目标对象。

```js
const _name = new WeakMap();

class Person {
    constructor(name) {
        _name.set(this, name);
    }

    get name() {
        return _name.get(this);
    }
}

const jane = new Person('Jane');
jane.name   // 'Jane'

const proxy = new Proxy(jane, {});
proxy.name  // undefined
```

上面代码中，目标对象`jane`的`name`属性，实际保存在外部`WeakMap`对象`_name`上面，通过`this`键区分。由于通过`proxy.name`访问时，`this`指向`proxy`，导致无法取到值，所以返回`undefined`。

此外，有些原生对象的内部属性，只有通过正确的`this`才能拿到，所以 Proxy 也无法代理这些原生对象的属性。

```js
const target = new Date();
const handler = {};
const proxy = new Proxy(target, handler);

proxy.getDate();
// Uncaught TypeError: this is not a Date object.
```

上面代码中，`getDate()`方法只能在`Date`对象实例上面拿到，如果`this`不是`Date`对象实例就会报错。这时，`this`绑定原始对象，就可以解决这个问题。

```js
const target = new Date('2021-05-26');
const handler = {
    get(target, prop) {
        if (prop === 'getDate') {
            return target.getDate.bind(target);
        }
        return Reflect.get(target, prop);
    }
};
const proxy = new Proxy(target, handler);

proxy.getDate() // 26
```

另外，Proxy 拦截函数内部的`this`，指向的是`handler`对象。

```js
const handler = {
    get: function (target, key, receiver) {
        console.log(this === handler);
        return 'Hello, ' + key;
    },
    set: function (target, key, value) {
        console.log(this === handler);
        target[key] = value;
        return true;
    }
}

const proxy = new Proxy({}, handler);

proxy.foo
// true
// Hello, foo

proxy.foo = 1
// true
// 1
```

上面例子中，`get()`和`set()`拦截函数内部的`this`，指向的都是`handler`对象。

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

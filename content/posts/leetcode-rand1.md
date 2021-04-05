---
title: leetcode 链表之和
date: 2020-08-20
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80'
imageAlt: 给定两个链表，返回一个新的链表
---

给出两个**非空**的链表用来表示两个非负的整数。其中，它们各自的位数是按照**逆序**的方式来存储的，并且它们的每个节点只能存储**一位**数字。

如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。

你可以假设除了数字0之外，这两个数都不会以0开头。

**示例：**

```bash
输入: (2 -> 4 -> 3) + (5 -> 6 -> 4)
输出: 7 -> 0 -> 8
原因: 342 + 456 = 807
```

代码如下：

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */

var addTwoNumbers = function(l1, l2) {
    let isTen = 0, l3 = new ListNode(0);
    let lres = l3
    while(l1 || l2) {
        let l1val =!!l1 ? l1.val : 0;
        let l2val = !!l2 ? l2.val : 0;
        l3.next = new ListNode((l1val + l2val + isTen) % 10);
        l3 = l3.next;
        isTen = (l1val + l2val + isTen) > 9 ? 1 : 0;
        l1 = !!l1 ? l1.next : null;
        l2 = !!l2 ? l2.next : null;
    }
    if (isTen!=0){
     l3.next = new ListNode(isTen)
     l3 = l3.next
    }
    return lres.next
};
```

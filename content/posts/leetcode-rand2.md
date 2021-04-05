---
title: leetcode 无重复字符的最长子串
date: 2020-08-26
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80'
imageAlt: 给定一个字符串，找出其中不含有重复字符的最长子串的长度
---

给定一个字符串，找出其中不含有重复字符的最长子串的长度。

**示例 1:**

```text
输入： "abcabcbb"
输出： 3
解释： 因为无重复字符的最长子串是"abc"，所以其长度为3。
```

**示例 2:**

```text
输入： "bbbbb"
输出： 1
解释： 因为无重复字符的最长子串是"b"，所以其长度为 1。
```

**示例 3:**

```text
输入： "pwwkew"
输出： 3
解释： 因为无重复字符的最长子串是 "wke"，所以其长度为3。
```

请注意，你的答案必须是**子串**的长度，"pwke"是一个子序列，不是子串。

#### 答案

```js
/**
 * @param {string} s
 * @return {number}
 * @description 首先定义一个stack数组，里面放不重复的子串，
 *              循环遍历字符串，与stack比较，如果数组里面没有当前字符
 *              将当前字符压入stack，如果有，得到它的位置，将这个重复字符之前的字符（包括这个重复的）出栈，然后压入这个字符
 */
var lengthOfLongestSubstring = function(s) {
    // 循环遍历， max最长子串，stack记录无重复的子串
    let i = 0, max = 0, stack = [];
    while(i < s.length) {
        // 得到重复字符的位置，如果没有返回 -1
        let index = stack.indexOf(s[i]);
        if (index !== -1) {
            // 清除重复字符之前的字符（包括这个重复的）
            stack.splice(0, index + 1)
        }
        stack.push(s[i]);
        if (max < stack.length) max = stack.length;
        i++
    }
    return max;
};
```

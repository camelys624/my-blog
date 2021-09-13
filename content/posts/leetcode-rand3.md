---
title: leetcode 寻找两个正序数组的中位数
date: 2020-09-13
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80'
imageAlt: 给定两个大小为 m 和 n 的正序（从小到大）数组 nums1 和 nums2，找出这两个正序数组的中位数。
---

给定两个大小为 m 和 n 的正序（从小到大） 数组 nums1 和 nums2。

请你找出这两个正序数组的中位数，并且要求算法的时间复杂度O(log(m + n))。你可以假设 *nums1* 和 *nums2* 不会同时是为空。

**示例1：**

```text
nums1 = [1, 3]
nums2 = [2]

则中位数是 2.0
```

**示例2：**

```text
nums1 = [1, 2]
nums2 = [3, 4]

则中位数是 (2 + 3) / 2 = 2.5
```

## 方法一： 二分查找

如果对时间复杂度的要求有log，通常都需要用到二分查找，这道题也可以通过二分查找实现。

根据中位数的定义，当 m + n 是奇数时，中位数是两个有序数组的第`(m + n + 1) / 2`个元素，当 m + n 是偶数时，中位数时两个有序数组中的第`(m + n) / 2` 和 `(m + n) / 2 + 1` 个元素的平均值。因此，这道题可以转化为寻找两个有序数组中的第 `k` 小的数，当 m + n 是奇数时，`k = (m + n + 1) / 2`，为偶数时，第一个 k 为 `(m + n) / 2`，第二个 k 为 `(m + n) / 2 + 1`。

假设两个有序数组分别是 A 和 B。要找到第 k 个元素，我们可以比较 A[k/2 - 1] 和 B[k/2 - 1]。由于 A[k/2 - 1]和B[k/2 - 1]的前面分别有A[0...k/2 - 2]和B[0...k/2 - 2]，即 k/2 -1 个元素，对于 A[k/2 - 1]和B[k/2 -1]中的**较小值**，最多只会有`(k/2 - 1) + (k/2 - 1) <= k - 2`个元素比它小，那么他就不能是第 k 小的数了。

因此我们可以归纳出三种情况：

- 如果 `A[k/2 - 1] - B[k/2 - 1]`，则比A[k/2 - 1]小的数最多只有 A 的前k/2 - 1个数和 B 的前k/2 - 1个数，即比A[k/2 - 1]小的数最多只有k - 2个，因此A[k/2 - 1]不可能是第k个数，A[0]到A[k/2 - 1]也都不可能是第k个数，可以全部排除。
- 如果`A[k/2 - 1] > B[k/2 - 1]`，则可以排除B[0]到B[k/2 - 1]。
- 如果`A[k/2 - 1] = B[k/2 - 1]`，则可以归纳到第一种情况处理。

有以下三种情况需要特殊处理：

- 如果A[k/2 - 1]或者B[k/2 - 1]越界，那么我们可以选取对应数组中的最后一个元素，在这种情况下，我们**必须根据排除的个数减少 k 的值**，而不是直接将 k 减去 k/2。
- 如果一数组为空，说明该数组中的所有元素都被排除，我们可以直接返回另一个数组中第 k 小的元素。
- 如果 `k = 1`，我们只要返回两个数组首元素的最小值即可。[示例](https://leetcode-cn.com/problems/median-of-two-sorted-arrays/solution/xun-zhao-liang-ge-you-xu-shu-zu-de-zhong-wei-s-114/)

### code

```js
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    let length = nums1.length + nums2.length;
    if (length % 2 === 0) {
        // 和为偶数时返回第 length/2 与 length/2 + 1 位元素的平均值
        return (getKNum(nums1, nums2, length / 2) + getKNum(nums1, nums2, length / 2 + 1)) / 2;
    } else {
        // 和为奇数时返回第 (length + 1)/2个元素
        return getKNum(nums1, nums2, (length + 1) / 2);
    }

};

// 获取第 k 小的元素
let getKNum = function (nums1, nums2, k) {
    let length1 = nums1.length,length2 = nums2.length;
    let index1 = 0, index2 = 0;
    while (true) {
       if (index1 == length1) {
           // 如果 nums1循环完，就取nums2中的计算出来的第k位元素
           return nums2[index2 + k -1];
       }

       if (index2 == length2) {
           // 如果 nums2循环完，就取nums1中的计算出来的第k位元素
           return nums1[index1 + k - 1];
       }

       if (k == 1) {
           // 找到第k位，则返回小的那个数
           return Math.min(nums1[index1], nums2[index2])
       }

        let  half = Math.floor(k / 2);
        let _index1 = Math.min(index1 + half, length1) - 1; // 如果越界，则取数组最后一位
        let _index2 = Math.min(index2 + half, length2) - 1;
        if (nums1[_index1] > nums2[_index2]) {
            k = k -(_index2 - index2 + 1);  // k不能直接减去 k/2，需要减去实际排除的个数
            index2 = _index2 + 1;
        } else {
            k = k - (_index1 - index1 + 1);
            index1 = _index1 + 1;
        }
    }
}
```

# Hami-Vuex

> 哈密瓜味的 Vuex ！

**主要特点：**

- 基于 Vuex 构建，可与 Vuex 3 & 4 兼容和混合使用
- 兼容 Vue 2 和 Vue 3，低学习成本，无迁移压力
- 完全的 Typescript 支持，代码提示很友好
- 类似 Pinia 的用法（可能还更简单）

## 开始使用

### 创建 Hami Store 实例

```js
// store/store.js
import { createHamiVuex } from 'hami-vuex'
export const hamiStore = createHamiVuex({
    vuexStore: /* 按照 Vuex 文档创建的 Vuex store 实例 */
})
```

Hami Store 实例用于创建和管理模块，所有业务功能都通过模块实现。

### 创建一个 Counter 模块

```js
// store/counter.js
import { hamiStore } from '@/store/store'

export const counterStore = hamiStore.module({

    // 设置一个唯一名称，方便调试程序和显示错误信息
    $name: 'counter',

    // 定义状态，可以是简单的对象（会自动做深拷贝处理）
    $state: {
        count: 0,
    },

    // 定义状态，也可以是返回状态的函数
    $state() {
        return { count: 0}
    }

    // 定义一个 getter，和 Vue computed 一样
    get double() {
        return this.count + 1
    },

    // 定义一个函数，等价于 Vuex action
    increment() {
        // $patch 是内置的 Vuex mutation，用于更新状态
        this.$patch({
            count: this.count + 1
        })
        // 对于复杂的操作，可以通过回调函数更新状态
        this.$patch(state => {
            state.count = this.count + 1
        })
    },

    // 定义一个异步函数，这也等价于 Vuex action
    async query() {
        let response = await http.get('/counter')
        this.$patch({
            count: response.count
        })
    }
})
```

我们不再需要定义 mutations，用内置的 $patch 就够了，所有的函数都是 actions 。

### 在 Vue 组件中使用 Counter 模块

```js
import { counterStore } from '@/store/counter'

export default {
    computed: {
        double: () => counterStore.double
    },
    methods: {
        increment: counterStore.increment,
    },
    async mounted() {
        await counterStore.query()
    },
    destroyed() {
        // 可以通过 $reset 重置状态
        counterStore.$reset()
    }
}
```

恭喜你，可以尽情享用哈密瓜味的 Vuex 了！

## 联系方式

博客：[Guyskk的博客](https://blog.guyskk.com/) / 公众号：自宅创业

欢迎与我联系交流，备注：Hami-Vuex

<img src="https://github.com/anyant/rssant/raw/master/docs/pictures/guyskk-qrcode.jpg" alt="微信号:guyskk" width="240" height="240" />

技术问题建议通过 issues 提交，方便讨论和搜索查阅。

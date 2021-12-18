# Hami-Vuex

> 哈密瓜味的Vuex! State management for Vue.js

**主要特点：**

- 基于 Vuex 构建，可与 Vuex 3 & 4 兼容和混合使用
- 兼容 Vue 2 和 Vue 3，低学习成本，无迁移压力
- 易于编写模块化的业务代码，Store 文件不再臃肿
- 完全的 TypeScript 支持，代码提示很友好
- 类似 Pinia 的用法（可能还更简单）
- 单元测试 Line Coverage: 100%

## 开始使用

```bash
npm install --save hami-vuex
```

### 创建 Hami Vuex 实例

```js
// store/index.js
import { createHamiVuex } from 'hami-vuex'
export const hamiVuex = createHamiVuex({
    vuexStore: /* 按照 Vuex 文档创建的 Vuex Store 实例 */
})
```

也可以使用默认创建的空 Vuex Store 对象，**Vue 2 + Vuex 3 的写法:**
```js
import Vue from 'vue'
import Vuex from 'vuex'
import { createHamiVuex } from 'hami-vuex'

Vue.use(Vuex)

export const hamiVuex = createHamiVuex({
    /* 可选：Vuex Store 的构造参数 */
})
```

以及 **Vue 3 + Vuex 4 的写法:**
```js
import { createApp } from 'vue'
import { createHamiVuex } from 'hami-vuex'

export const hamiVuex = createHamiVuex({
    /* 可选：Vuex Store 的构造参数 */
})

export const app = createApp()
app.use(hamiVuex)
```

Hami Vuex 实例用于创建和管理 Hami Store，所有业务功能都通过 Hami Store 实现。

### 创建一个 Counter Store

```js
// store/counter.js
import { hamiVuex } from '@/store/index'

// 实现原理：动态注册的 Vuex Module 对象
export const counterStore = hamiVuex.store({

    // 设置一个唯一名称，方便调试程序和显示错误信息
    $name: 'counter',

    // 定义状态，可以是简单的对象（会自动做深拷贝处理）
    $state: {
        count: 0,
    },

    // 定义状态，也可以是返回状态的函数
    $state() {
        return { count: 0 }
    }

    // 定义一个 getter，和 Vue computed 类似
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

### 在 Vue 组件中使用 Counter Store

```js
import { counterStore } from '@/store/counter'

export default {
    computed: {
        // 使用 state 中定义的属性
        count: () => counterStore.count,
        // 使用 getter 定义的属性
        double: () => counterStore.double
    },
    methods: {
        // 使用 action 方法
        increment: counterStore.increment,
    },
    async mounted() {
        // 直接调用 action 方法，以及访问属性（也可以 Store 之间互相调用）
        await counterStore.query()
        console.log(counterStore.count)
    },
    destroyed() {
        // 可以通过 $reset 重置状态
        counterStore.$reset()
    }
}
```

恭喜你，可以尽情享用哈密瓜味的 Vuex 了！

## 高级用法

如果不需要 [Vue SSR 服务端渲染](https://ssr.vuejs.org/zh/)，则可以跳过以下高级用法（大部分情况都不需要）。

在上述基础用法中，Store 对象是 [有状态的单例](https://ssr.vuejs.org/zh/guide/structure.html#%E9%81%BF%E5%85%8D%E7%8A%B6%E6%80%81%E5%8D%95%E4%BE%8B)，在 Vue SSR 中使用这种对象，需要设置 [runInNewContext](https://ssr.vuejs.org/zh/api/#runinnewcontext) 参数为 `true`，这会带来比较大的服务器性能开销。

高级用法可以避免「有状态的单例」，适合在 Vue 3 setup 方法中使用，也可以用于 Vue 选项式写法。

### 定义一个 Counter Store

```js
import { defineHamiStore } from 'hami-vuex'

// 注意：这里是首字母大写的 CounterStore !
export const CounterStore = defineHamiStore({
    /* 这里参数和 hamiVuex.store() 一样 */
})
```

### 使用方法1: 绑定 Vuex Store 实例

```js
const vuexStore = /* Vuex Store 实例 */
const counterStore = CounterStore.use(vuexStore)
await counterStore.query()
console.log(counterStore.count)
```

### 使用方法2: 在 Vue setup 方法中使用

```js
export default {
    setup() {
        const counterStore = CounterStore.use()
        await counterStore.query()
        console.log(counterStore.count)
    },
}
```

### 使用方法3: 在 Vue computed 中使用

```js
export default {
    computed: {
        // 效果类似于 Vuex mapActions, mapGetters
        counterStore: CounterStore.use,
        count: CounterStore.count,
        query: CounterStore.query,
    },
}
```

### 使用方法4: 在 Store 中互相使用

```js
const otherStore = defineHamiStore({
    get counterStore(){
        return CounterStore.use(this)
    },
    get count(){
        return this.counterStore.count
    }
})
```

## 参考和鸣谢

- [Vuex 5 RFC](https://github.com/kiaking/rfcs/blob/vuex-5/active-rfcs/0000-vuex-5.md)
- [Vuex 5 RFC Discussion](https://github.com/vuejs/rfcs/discussions/270)
- [Proposal for Vuex 5](https://github.com/vuejs/vuex/issues/1763)
- [Pinia](https://github.com/vuejs/pinia)

特别感谢以上项目和资料给我带来了很多灵感，也希望 Hami Vuex 能给社区带来新的灵感！

## 设计思路

### 为什么要用「有状态的单例」？

有状态的单例使用更加简单方便，仅在 Vue SSR 方面性能不佳。对于大部分单页应用都不需要 Vue SSR，所以可以放心使用「有状态的单例」，在必要情况下也可以切换到高级用法。

### 为什么要把 getters 和 actions 写在同一层级？

由于 TypeScript 难以对 Vue 选项式接口做类型推断，写在同一层级可以避免这个问题。

具体原理我也不太清楚，以下资料供参考：

- https://github.com/microsoft/TypeScript/pull/14141
- https://github.com/microsoft/TypeScript/issues/13949
- https://github.com/microsoft/TypeScript/issues/12846

### 为什么 $name 和 $state 要加 $ 前缀？

因为把所有字段写在同一层级之后，需要避免名称冲突，所以特殊字段都用 $ 前缀。

### 为什么不用 mutations 了？

用 mutations 的好处是在 devtools 调试更方便，坏处是代码稍微繁琐一些。还有一个问题是，把所有字段写在同一层级之后，难以区分 actions 和 mutations。经过权衡，决定不用 mutations 了。

### 为什么不用 Pinia ？

用过一段时间 Pinia，觉得 devtools 插件支持不太好，不稳定。另外 Pinia 的写法对 Vue 选项式用法不够友好，应该是为了支持 Vue SSR 导致的。

### 为什么基于 Vuex 实现？

我认为 Vuex 本身做的很好，改进一下接口设计就可以达到我要的效果，不需要重复造轮子。而且基于 Vuex 实现，可以最大程度兼容老代码，很容易做平滑迁移。

## 联系方式

博客：[Guyskk的博客](https://blog.guyskk.com/) / 公众号：自宅创业

欢迎与我联系交流，备注：Hami-Vuex

<img src="https://github.com/anyant/rssant/raw/master/docs/pictures/guyskk-qrcode.jpg" alt="微信号:guyskk" width="240" height="240" />

技术问题建议通过 issues 提交，方便讨论和搜索查阅。

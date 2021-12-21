# Hami-Vuex (hami melon flavored)

<p>
  <a href="https://npmjs.com/package/hami-vuex"><img src="https://badgen.net/npm/v/hami-vuex" alt="npm package"></a>
  <a href="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml"><img src="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml/badge.svg?branch=main&event=push" alt="build status"></a>
  <a href="https://codecov.io/github/guyskk/hami-vuex"><img src="https://badgen.net/codecov/c/github/guyskk/hami-vuex/main" alt="code coverage"></a>
</p>

**Features：**

- Build on Vuex, compatible with Vuex 3 & 4
- Also compatible with Vue 2 and Vue 3
- Modular by design, no more fat store
- Completely TypeScript intelligence support
- Unit tests line coverage: 100%

## Usage

```bash
npm install --save hami-vuex
```

### Create Hami Vuex instance

```js
// store/index.js
import { createHamiVuex } from 'hami-vuex'
export const hamiVuex = createHamiVuex({
    vuexStore: /* the Vuex Store instance, created according to Vuex docs */
})
```

Or use the default empty Vuex Store instance, **Vue 2 + Vuex 3 Writing:**
```js
import Vue from 'vue'
import Vuex from 'vuex'
import { createHamiVuex } from 'hami-vuex'

Vue.use(Vuex)

export const hamiVuex = createHamiVuex({
    /* Optional：Vuex Store constructor options */
})
```

And **Vue 3 + Vuex 4 Writing:**
```js
import { createApp } from 'vue'
import { createHamiVuex } from 'hami-vuex'

export const hamiVuex = createHamiVuex({
    /* Optional：Vuex Store constructor options */
})

export const app = createApp()
app.use(hamiVuex)
```

The Hami Vuex instance is for create and manage Hami Store instances, all business logics should implemented by Hami Store instances.

### Create a Counter Store

```js
// store/counter.js
import { hamiVuex } from '@/store/index'

// Internal：dynamic registered Vuex module
export const counterStore = hamiVuex.store({

    // unique name of the store, will appear in devtools
    $name: 'counter',

    // define the state with plain object（will auto deep copy it）
    $state: {
        count: 0,
    },

    // or a function that returns a fresh state
    $state() {
        return { count: 0 }
    }

    // define a getter, similar to Vue computed
    get double() {
        return this.count * 2
    },

    // define an action, similar to Vuex action
    increment() {
        // $patch is builtin Vuex mutation, used for update state
        // it accepts K:V object, will shallow asign to state
        this.$patch({
            count: this.count + 1
        })
        // for complex operation, can use a mutator function
        this.$patch(state => {
            state.count = this.count + 1
        })
    },

    // also define an async action, similar to Vuex action
    async query() {
        let response = await http.get('/counter')
        this.$patch({
            count: response.count
        })
    }
})
```

We don't need define mutations, the builtin $patch mutation can handle all tasks.

### Use Counter Store in Vue component

```js
import { counterStore } from '@/store/counter'

export default {
    computed: {
        // map state properties
        count: () => counterStore.count,
        // map getters
        double: () => counterStore.double
    },
    methods: {
        // map actions
        increment: counterStore.increment,
    },
    async mounted() {
        // call actions, or use properties
        await counterStore.query()
        console.log(counterStore.count)
    },
    destroyed() {
        // the $reset method will reset to initial state
        counterStore.$reset()
    }
}
```

Congratulations, you can enjoy the hami melon flavored Vuex!

## Advanced usage

[Request translate the Advanced usage](https://github.com/guyskk/hami-vuex/issues/new)

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

## References and acknowledgements

- [Vuex 5 RFC](https://github.com/kiaking/rfcs/blob/vuex-5/active-rfcs/0000-vuex-5.md)
- [Vuex 5 RFC Discussion](https://github.com/vuejs/rfcs/discussions/270)
- [Proposal for Vuex 5](https://github.com/vuejs/vuex/issues/1763)
- [Pinia](https://github.com/vuejs/pinia)

特别感谢以上项目和资料给我带来了很多灵感，也希望 Hami Vuex 能给社区带来新的灵感！

## Design considerations

[Request translate the Design considerations](https://github.com/guyskk/hami-vuex/issues/new)

### 为什么要用「有状态的单例」？

有状态的单例使用更加简单方便, 仅在 Vue SSR 方面性能不佳。对于大部分单页应用都不需要 Vue SSR, 所以可以放心使用「有状态的单例」, 在必要情况下也可以切换到高级用法。

### 为什么要把 getters 和 actions 写在同一层级？

由于 TypeScript 难以对 Vue 选项式接口做类型推断, 写在同一层级可以避免这个问题。

具体原因可以参考以下资料：

- https://github.com/microsoft/TypeScript/pull/14141
- https://github.com/microsoft/TypeScript/issues/13949
- https://github.com/microsoft/TypeScript/issues/12846
- https://github.com/microsoft/TypeScript/issues/47150

### 为什么 $name 和 $state 要加 $ 前缀？

因为把所有字段写在同一层级之后, 需要避免名称冲突, 所以特殊字段都用 $ 前缀。

### 为什么不用 mutations 了？

用 mutations 的好处是在 devtools 调试更方便, 坏处是代码稍微繁琐一些。还有一个问题是, 把所有字段写在同一层级之后, 难以区分 actions 和 mutations。经过权衡, 决定不用 mutations 了。

### 为什么不用 Pinia ？

用过一段时间 Pinia, 觉得 devtools 插件支持不太好, 不稳定。另外 Pinia 的写法对 Vue 选项式用法不够友好, 应该是为了支持 Vue SSR 导致的。

### 为什么基于 Vuex 实现？

我认为 Vuex 本身做的很好, 改进一下接口设计就可以达到我要的效果, 不需要重复造轮子。而且基于 Vuex 实现, 可以最大程度兼容老代码, 很容易做平滑迁移。

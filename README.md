# Hami-Vuex 🍈 (hami melon flavored)

<p>
  <a href="https://npmjs.com/package/hami-vuex"><img src="https://badgen.net/npm/v/hami-vuex" alt="npm package"></a>
  <a href="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml"><img src="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml/badge.svg?branch=main&event=push" alt="build status"></a>
  <a href="https://codecov.io/github/guyskk/hami-vuex"><img src="https://badgen.net/codecov/c/github/guyskk/hami-vuex/main" alt="code coverage"></a>
</p>

**[查看中文文档](README-CN.md)**

> Hami melon flavored Vuex! State management for Vue.js

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


### TypeScript Support

Hami-Vuex completely support TypeScript, you can configure TypeScript to make type inference smarter (better code intelligence).

```javascript
// tsconfig.json
{
  "compilerOptions": {
    // this aligns with Vue's browser support
    "target": "es5",
    // this enables stricter inference for data properties on `this`
    "strict": true,
  }
}
```

Detailed instructions: [TypeScript Support - Vue.js](https://vuejs.org/v2/guide/typescript.html)


## Advanced usage

If you don't need [Vue SSR](https://ssr.vuejs.org/zh/), you can skip the following advanced usages (which are not required in most cases).

In the above basic usage, the Store object is a [stateful singleton](https://ssr.vuejs.org/zh/guide/structure.html#%E9%81%BF%E5%85%8D%E7%8A%B6%E6%80%81%E5%8D%95%E4%BE%8B), and using such an object in Vue SSR requires setting the [runInNewContext](https://ssr.vuejs.org/zh/api/#runinnewcontext) parameter to `true`, which incurs a relatively large server performance overhead.

Advanced usage avoids "stateful singletons" and is suitable for use in the Vue 3 setup method, as well as for Vue optional writing.

### Define a Counter Store

```js
import { defineHamiStore } from 'hami-vuex'

// Note: Here is the capitalization of the initials CounterStore !
export const CounterStore = defineHamiStore({
    /* Here the parameters are the same as hamiVuex.store() */
})
```

### Usage 1: Bind a Vuex Store instance

```js
const vuexStore = /* Vuex Store instance */
const counterStore = CounterStore.use(vuexStore)
await counterStore.query()
console.log(counterStore.count)
```

### Usage 2: Used in the Vue setup method

```js
export default {
    setup() {
        const counterStore = CounterStore.use()
        await counterStore.query()
        console.log(counterStore.count)
    },
}
```

### Usage 3: Used in Vue computed

```js
export default {
    computed: {
        // Similar to Vuex mapActions, mapGetters
        counterStore: CounterStore.use,
        count: CounterStore.count,
        query: CounterStore.query,
    },
}
```

### Usage 4: Use each other in the Store

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

Special thanks to the above projects and materials for bringing me a lot of inspiration, and hope that Hami Vuex can bring new inspiration to the community!

## Design considerations

### Why use "stateful singleton"?

Stateful singletons are simpler and more convenient to use, and only perform poorly in terms of Vue SSR. Vue SSR is not required for most single-page applications, so you can use "stateful singleton" with confidence and switch to advanced usage if necessary.

### Why write getters and actions at the same level?

Since TypeScript is difficult to type infer from the Vue optional interface, writing at the same level avoids this problem.

For specific reasons, please refer to the following information:

- https://github.com/microsoft/TypeScript/pull/14141
- https://github.com/microsoft/TypeScript/issues/13949
- https://github.com/microsoft/TypeScript/issues/12846
- https://github.com/microsoft/TypeScript/issues/47150

### Why are `$name` and `$state` prefixed with `$`?

Because all fields need to avoid name conflicts after writing them at the same level, special fields are prefixed with `$`.

### Why not use mutations anymore?

The advantage of using mutations is that it is more convenient to debug in devtools, the disadvantage is that the code is slightly more cumbersome. Another problem is that after writing all fields at the same level, it is difficult to distinguish between actions and mutations. After weighing it, it was decided not to use mutations.

### Why not use Pinia?

After using Pinia for a while, I felt that the devtools plugin support was not very good and unstable. In addition, Pinia is not written in a way that is friendly enough for Vue optional usage, and should be caused by supporting Vue SSR.

### Why is it based on Vuex?

I think Vuex itself does a good job, and improving the interface design can achieve the effect I want, without having to make the wheels repeatedly. And based on the Vuex implementation, it can be compatible with old code to the greatest extent, and it is easy to do smooth migration.

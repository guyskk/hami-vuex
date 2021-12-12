# Hami-Vuex

> 哈密瓜味的 Vuex ！

**主要特点：**

- 基于 Vuex 构建，可与 Vuex 3 & 4 兼容和混合使用
- 兼容 Vue 2 和 Vue 3，低学习成本，无迁移压力
- 完全的 Typescript 支持，代码提示很友好
- 类似 Pinia 的用法（可能还更简单）

## 开始使用

```javascript
// store/store.js
import { createHamiVuex } from 'hami-vuex'

export const hamiStore = createHamiVuex()


// store/counter.js
import { hamiStore } from '@/store/store'

export const counterStore = hamiStore.module({
    $name: 'counter',
    $state: {
        num: 0,
    },
    get double(){
        return this.num + 1
    },
    increase(){
        this.$patch({
            num: this.num + 1
        })
    },
    async query(){
        let response = await http.get('/counter')
        this.$patch({
            num: response.num
        })
    }
})

// use the counterStore
await counterStore.query()
counterStore.increase()
console.log(counterStore.double)
```

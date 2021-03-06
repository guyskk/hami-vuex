# Hami-Vuex ð (hami melon flavored)

<p>
  <a href="https://npmjs.com/package/hami-vuex"><img src="https://badgen.net/npm/v/hami-vuex" alt="npm package"></a>
  <a href="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml"><img src="https://github.com/guyskk/hami-vuex/actions/workflows/test.yml/badge.svg?branch=main&event=push" alt="build status"></a>
  <a href="https://codecov.io/github/guyskk/hami-vuex"><img src="https://badgen.net/codecov/c/github/guyskk/hami-vuex/main" alt="code coverage"></a>
</p>

**[Translate to English](README.md)**

> åå¯çå³çVuex! State management for Vue.js

**ä¸»è¦ç¹ç¹ï¼**

- åºäº Vuex æå»ºï¼å¯ä¸ Vuex 3 & 4 å¼å®¹åæ··åä½¿ç¨
- å¼å®¹ Vue 2 å Vue 3ï¼ä½å­¦ä¹ ææ¬ï¼æ è¿ç§»åå
- æäºç¼åæ¨¡ååçä¸å¡ä»£ç ï¼Store æä»¶ä¸åèè¿
- å®å¨ç TypeScript æ¯æï¼ä»£ç æç¤ºå¾åå¥½
- ååæµè¯ Line Coverage: 100%

## å¼å§ä½¿ç¨

```bash
npm install --save hami-vuex
```

### åå»º Hami Vuex å®ä¾

```js
// store/index.js
import { createHamiVuex } from 'hami-vuex'
export const hamiVuex = createHamiVuex({
    vuexStore: /* æç§ Vuex ææ¡£åå»ºç Vuex Store å®ä¾ */
})
```

ä¹å¯ä»¥ä½¿ç¨é»è®¤åå»ºçç©º Vuex Store å¯¹è±¡ï¼**Vue 2 + Vuex 3 çåæ³:**
```js
import Vue from 'vue'
import Vuex from 'vuex'
import { createHamiVuex } from 'hami-vuex'

Vue.use(Vuex)

export const hamiVuex = createHamiVuex({
    /* å¯éï¼Vuex Store çæé åæ° */
})
```

ä»¥å **Vue 3 + Vuex 4 çåæ³:**
```js
import { createApp } from 'vue'
import { createHamiVuex } from 'hami-vuex'

export const hamiVuex = createHamiVuex({
    /* å¯éï¼Vuex Store çæé åæ° */
})

export const app = createApp()
app.use(hamiVuex)
```

Hami Vuex å®ä¾ç¨äºåå»ºåç®¡ç Hami Storeï¼ææä¸å¡åè½é½éè¿ Hami Store å®ç°ã

### åå»ºä¸ä¸ª Counter Store

```js
// store/counter.js
import { hamiVuex } from '@/store/index'

// å®ç°åçï¼å¨ææ³¨åç Vuex Module å¯¹è±¡
export const counterStore = hamiVuex.store({

    // è®¾ç½®ä¸ä¸ªå¯ä¸åç§°ï¼æ¹ä¾¿è°è¯ç¨åºåæ¾ç¤ºéè¯¯ä¿¡æ¯
    $name: 'counter',

    // å®ä¹ç¶æï¼å¯ä»¥æ¯ç®åçå¯¹è±¡ï¼ä¼èªå¨åæ·±æ·è´å¤çï¼
    $state: {
        count: 0,
    },

    // å®ä¹ç¶æï¼ä¹å¯ä»¥æ¯è¿åç¶æçå½æ°
    $state() {
        return { count: 0 }
    }

    // å®ä¹ä¸ä¸ª getterï¼å Vue computed ç±»ä¼¼
    get double() {
        return this.count * 2
    },

    // å®ä¹ä¸ä¸ªå½æ°ï¼ç­ä»·äº Vuex action
    increment() {
        // $patch æ¯åç½®ç Vuex mutationï¼ç¨äºæ´æ°ç¶æ
        // å¯ä»¥ä¼ é K:V å½¢å¼çå¯¹è±¡ï¼è¿è¡æµæ·è´èµå¼
        this.$patch({
            count: this.count + 1
        })
        // å¯¹äºå¤æçæä½ï¼å¯ä»¥éè¿åè°å½æ°æ´æ°ç¶æ
        this.$patch(state => {
            state.count = this.count + 1
        })
    },

    // å®ä¹ä¸ä¸ªå¼æ­¥å½æ°ï¼è¿ä¹ç­ä»·äº Vuex action
    async query() {
        let response = await http.get('/counter')
        this.$patch({
            count: response.count
        })
    }
})
```

æä»¬ä¸åéè¦å®ä¹ mutationsï¼ç¨åç½®ç $patch å°±å¤äºï¼ææçå½æ°é½æ¯ actions ã

### å¨ Vue ç»ä»¶ä¸­ä½¿ç¨ Counter Store

```js
import { counterStore } from '@/store/counter'

export default {
    computed: {
        // ä½¿ç¨ state ä¸­å®ä¹çå±æ§
        count: () => counterStore.count,
        // ä½¿ç¨ getter å®ä¹çå±æ§
        double: () => counterStore.double
    },
    methods: {
        // ä½¿ç¨ action æ¹æ³
        increment: counterStore.increment,
    },
    async mounted() {
        // ç´æ¥è°ç¨ action æ¹æ³ï¼ä»¥åè®¿é®å±æ§ï¼ä¹å¯ä»¥ Store ä¹é´äºç¸è°ç¨ï¼
        await counterStore.query()
        console.log(counterStore.count)
    },
    destroyed() {
        // å¯ä»¥éè¿ $reset éç½®ç¶æ
        counterStore.$reset()
    }
}
```

æ­åä½ ï¼å¯ä»¥å°½æäº«ç¨åå¯çå³ç Vuex äºï¼

### TypeScriptæ¯æ

Hami-Vuex å®å¨æ¯æ TypeScriptï¼å¯ä»¥éè¿ TypeScript éç½®ï¼è®©ç±»åæ¨æ­æ´æºè½ï¼ä»£ç æç¤ºæ´åå¥½ï¼ã

```javascript
// tsconfig.json
{
  "compilerOptions": {
    // ä¸ Vue çæµè§å¨æ¯æä¿æä¸è´
    "target": "es5",
    // è¿å¯ä»¥å¯¹ `this` ä¸çæ°æ® property è¿è¡æ´ä¸¥æ ¼çæ¨æ­
    "strict": true
  }
}
```

è¯¦ç»è¯´æå¯åèï¼[TypeScript æ¯æ - Vue.js](https://cn.vuejs.org/v2/guide/typescript.html)


## é«çº§ç¨æ³

å¦æä¸éè¦ [Vue SSR æå¡ç«¯æ¸²æ](https://ssr.vuejs.org/zh/)ï¼åå¯ä»¥è·³è¿ä»¥ä¸é«çº§ç¨æ³ï¼å¤§é¨åæåµé½ä¸éè¦ï¼ã

å¨ä¸è¿°åºç¡ç¨æ³ä¸­ï¼Store å¯¹è±¡æ¯ [æç¶æçåä¾](https://ssr.vuejs.org/zh/guide/structure.html#%E9%81%BF%E5%85%8D%E7%8A%B6%E6%80%81%E5%8D%95%E4%BE%8B)ï¼å¨ Vue SSR ä¸­ä½¿ç¨è¿ç§å¯¹è±¡ï¼éè¦è®¾ç½® [runInNewContext](https://ssr.vuejs.org/zh/api/#runinnewcontext) åæ°ä¸º `true`ï¼è¿ä¼å¸¦æ¥æ¯è¾å¤§çæå¡å¨æ§è½å¼éã

é«çº§ç¨æ³å¯ä»¥é¿åãæç¶æçåä¾ãï¼éåå¨ Vue 3 setup æ¹æ³ä¸­ä½¿ç¨ï¼ä¹å¯ä»¥ç¨äº Vue éé¡¹å¼åæ³ã

### å®ä¹ä¸ä¸ª Counter Store

```js
import { defineHamiStore } from 'hami-vuex'

// æ³¨æï¼è¿éæ¯é¦å­æ¯å¤§åç CounterStore !
export const CounterStore = defineHamiStore({
    /* è¿éåæ°å hamiVuex.store() ä¸æ · */
})
```

### ä½¿ç¨æ¹æ³1: ç»å® Vuex Store å®ä¾

```js
const vuexStore = /* Vuex Store å®ä¾ */
const counterStore = CounterStore.use(vuexStore)
await counterStore.query()
console.log(counterStore.count)
```

### ä½¿ç¨æ¹æ³2: å¨ Vue setup æ¹æ³ä¸­ä½¿ç¨

```js
export default {
    setup() {
        const counterStore = CounterStore.use()
        await counterStore.query()
        console.log(counterStore.count)
    },
}
```

### ä½¿ç¨æ¹æ³3: å¨ Vue computed ä¸­ä½¿ç¨

```js
export default {
    computed: {
        // ææç±»ä¼¼äº Vuex mapActions, mapGetters
        counterStore: CounterStore.use,
        count: CounterStore.count,
        query: CounterStore.query,
    },
}
```

### ä½¿ç¨æ¹æ³4: å¨ Store ä¸­äºç¸ä½¿ç¨

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

## åèåé¸£è°¢

- [Vuex 5 RFC](https://github.com/kiaking/rfcs/blob/vuex-5/active-rfcs/0000-vuex-5.md)
- [Vuex 5 RFC Discussion](https://github.com/vuejs/rfcs/discussions/270)
- [Proposal for Vuex 5](https://github.com/vuejs/vuex/issues/1763)
- [Pinia](https://github.com/vuejs/pinia)

ç¹å«æè°¢ä»¥ä¸é¡¹ç®åèµæç»æå¸¦æ¥äºå¾å¤çµæï¼ä¹å¸æ Hami Vuex è½ç»ç¤¾åºå¸¦æ¥æ°ççµæï¼

## è®¾è®¡æè·¯

### ä¸ºä»ä¹è¦ç¨ãæç¶æçåä¾ãï¼

æç¶æçåä¾ä½¿ç¨æ´å ç®åæ¹ä¾¿ï¼ä»å¨ Vue SSR æ¹é¢æ§è½ä¸ä½³ãå¯¹äºå¤§é¨ååé¡µåºç¨é½ä¸éè¦ Vue SSRï¼æä»¥å¯ä»¥æ¾å¿ä½¿ç¨ãæç¶æçåä¾ãï¼å¨å¿è¦æåµä¸ä¹å¯ä»¥åæ¢å°é«çº§ç¨æ³ã

### ä¸ºä»ä¹è¦æ getters å actions åå¨åä¸å±çº§ï¼

ç±äº TypeScript é¾ä»¥å¯¹ Vue éé¡¹å¼æ¥å£åç±»åæ¨æ­ï¼åå¨åä¸å±çº§å¯ä»¥é¿åè¿ä¸ªé®é¢ã

å·ä½åå å¯ä»¥åèä»¥ä¸èµæï¼

- https://github.com/microsoft/TypeScript/pull/14141
- https://github.com/microsoft/TypeScript/issues/13949
- https://github.com/microsoft/TypeScript/issues/12846
- https://github.com/microsoft/TypeScript/issues/47150

### ä¸ºä»ä¹ $name å $state è¦å  $ åç¼ï¼

å ä¸ºæææå­æ®µåå¨åä¸å±çº§ä¹åï¼éè¦é¿ååç§°å²çªï¼æä»¥ç¹æ®å­æ®µé½ç¨ $ åç¼ã

### ä¸ºä»ä¹ä¸ç¨ mutations äºï¼

ç¨ mutations çå¥½å¤æ¯å¨ devtools è°è¯æ´æ¹ä¾¿ï¼åå¤æ¯ä»£ç ç¨å¾®ç¹çä¸äºãè¿æä¸ä¸ªé®é¢æ¯ï¼æææå­æ®µåå¨åä¸å±çº§ä¹åï¼é¾ä»¥åºå actions å mutationsãç»è¿æè¡¡ï¼å³å®ä¸ç¨ mutations äºã

### ä¸ºä»ä¹ä¸ç¨ Pinia ï¼

ç¨è¿ä¸æ®µæ¶é´ Piniaï¼è§å¾ devtools æä»¶æ¯æä¸å¤ªå¥½ï¼ä¸ç¨³å®ãå¦å¤ Pinia çåæ³å¯¹ Vue éé¡¹å¼ç¨æ³ä¸å¤åå¥½ï¼åºè¯¥æ¯ä¸ºäºæ¯æ Vue SSR å¯¼è´çã

### ä¸ºä»ä¹åºäº Vuex å®ç°ï¼

æè®¤ä¸º Vuex æ¬èº«åçå¾å¥½ï¼æ¹è¿ä¸ä¸æ¥å£è®¾è®¡å°±å¯ä»¥è¾¾å°æè¦çææï¼ä¸éè¦éå¤é è½®å­ãèä¸åºäº Vuex å®ç°ï¼å¯ä»¥æå¤§ç¨åº¦å¼å®¹èä»£ç ï¼å¾å®¹æåå¹³æ»è¿ç§»ã

## èç³»æ¹å¼

ææ¯é®é¢å»ºè®®éè¿ issues æäº¤ï¼æ¹ä¾¿è®¨è®ºåæç´¢æ¥éã

åå®¢ï¼[Guyskkçåå®¢](https://blog.guyskk.com/) / å¬ä¼å·ï¼èªå®åä¸

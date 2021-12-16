import Vue from 'vue'
import Vuex from 'vuex'
import { test, expect } from '@jest/globals'
import { defineHamiStore } from '../dist'
import { isNil, isFunction } from '../src/helper'
import { createVuexStore } from '../src/compat'

Vue.use(Vuex)

test('defineHamiStore: empty store', () => {
  const EmptyStore = defineHamiStore({})
  expect(isFunction(EmptyStore.$name))
  expect(isFunction(EmptyStore.$state))
  expect(isFunction(EmptyStore.$reset))
  expect(isFunction(EmptyStore.$patch))

  const vuexStore = createVuexStore()
  const emptyStore = EmptyStore.use(vuexStore)
  expect(!isNil(emptyStore.$name))
  expect(!isNil(emptyStore.$state))
  emptyStore.$patch({})
  emptyStore.$reset()

  const emptyStore2 = EmptyStore.use(vuexStore)
  expect(emptyStore2.$name).toBe(emptyStore.$name)
})

test('defineHamiStore: counter', async () => {
  const CounterStore = defineHamiStore({
    $name: 'counter',
    $state: {
      count: 0,
    },
    get double() {
      return this.count * 2
    },
    increment() {
      this.$patch({ count: this.count + 1 })
      return this.count
    },
    async incrementAndReturnDouble() {
      this.increment()
      return this.double
    },
  })

  const vuexStore = createVuexStore()
  const counterStore = CounterStore.use(vuexStore)

  expect(counterStore.$name).toBe('counter')
  expect(counterStore.$state.count).toBe(0)
  expect(counterStore.count).toBe(0)

  expect(counterStore.increment()).toBe(1)
  expect(counterStore.count).toBe(1)
  expect(counterStore.double).toBe(2)

  const counterStore2 = CounterStore.use(vuexStore)
  expect(counterStore2.count).toBe(1)
  expect(counterStore2.double).toBe(2)

  expect(await counterStore.incrementAndReturnDouble()).toBe(4)
  expect(counterStore.count).toBe(2)
  expect(counterStore.double).toBe(4)

  counterStore.$reset()
  expect(counterStore.$state.count).toBe(0)
  expect(counterStore.count).toBe(0)
  expect(counterStore.double).toBe(0)

  const patchResult = counterStore.$patch((state) => {
    state.count += 1
    return state.count
  })
  expect(patchResult).toBe(1)
  expect(counterStore.$state.count).toBe(1)
  expect(counterStore.count).toBe(1)
  expect(counterStore.double).toBe(2)
})

test('defineHamiStore: counter using', async () => {
  const CounterStore = defineHamiStore({
    $name: 'counter',
    $state: {
      count: 0,
    },
    get double() {
      return this.count * 2
    },
    increment() {
      this.$patch({ count: this.count + 1 })
      return this.count
    },
    async incrementAndReturnDouble() {
      this.increment()
      return this.double
    },
  })

  const vuexStore = createVuexStore()
  const counterStore = CounterStore.use(vuexStore)
  const counterStore2 = CounterStore.use.call({ $store: vuexStore })
  const component = new Vue({
    store: vuexStore,
    computed: {
      counterStore: CounterStore.use,
      $name: CounterStore.$name,
      $state: CounterStore.$state,
      $patch: CounterStore.$patch,
      $reset: CounterStore.$reset,
      count: CounterStore.count,
      double: CounterStore.double,
      increment: CounterStore.increment,
      incrementAndReturnDouble: CounterStore.incrementAndReturnDouble,
    },
  })

  const storeList = Object.entries({
    counterStore,
    counterStore2,
    componentStore: component,
    componentStore2: component.counterStore,
  })

  function forEachStore(fn) {
    storeList.forEach(([name, store]) => {
      try {
        fn(store)
      } catch (e) {
        throw new Error(String(e) + `\nStore: ${name}`)
      }
    })
  }

  forEachStore((store) => {
    expect(store.$name).toBe('counter')
    expect(!isNil(store.$state))
    expect(store.count).toBe(0)
    expect(store.double).toBe(0)
  })

  expect(counterStore.increment()).toBe(1)
  forEachStore((store) => {
    expect(store.count).toBe(1)
    expect(store.double).toBe(2)
  })

  expect(await component.incrementAndReturnDouble()).toBe(4)
  forEachStore((store) => {
    expect(store.count).toBe(2)
    expect(store.double).toBe(4)
  })

  component.$reset()
  forEachStore((store) => {
    expect(store.count).toBe(0)
    expect(store.double).toBe(0)
  })
})

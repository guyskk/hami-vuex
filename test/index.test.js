import { createHamiStore } from 'hami-vuex'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function isNil(value) {
  return value === null || value === undefined
}

function isFunction(value) {
  return typeof value === 'function'
}

test('createHamiStore', () => {
  const hamiStore = createHamiStore()
  expect(!isNil(hamiStore.vuexStore))
  expect(isFunction(hamiStore.module))
})

test('hamiStore.module: empty store', () => {
  const hamiStore = createHamiStore()
  const emptyStore = hamiStore.module({})
  expect(!isNil(emptyStore.$name))
  expect(!isNil(emptyStore.$state))
  expect(isFunction(emptyStore.$reset))
  expect(isFunction(emptyStore.$patch))
  emptyStore.$patch({})
  emptyStore.$reset()
})

test('hamiStore.module: counter', async () => {
  const hamiStore = createHamiStore()
  const counterStore = hamiStore.module({
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
  expect(counterStore.$name).toBe('counter')
  expect(counterStore.$state.count).toBe(0)
  expect(counterStore.count).toBe(0)

  expect(counterStore.increment()).toBe(1)
  expect(counterStore.count).toBe(1)
  expect(counterStore.double).toBe(2)

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

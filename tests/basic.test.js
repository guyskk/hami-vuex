import Vuex from 'vuex'
import { test, expect } from '@jest/globals'
import { createHamiVuex } from '../dist'
import { isNil, isFunction } from './helper'
import { Vue, IS_VUEX_3, createVueApp } from './helper'
import { counterOptions } from './helper'

if (IS_VUEX_3) {
  Vue.use(Vuex)
}

test('createHamiVuex', () => {
  const hamiVuex = createHamiVuex()
  expect(!isNil(hamiVuex.vuexStore))
  expect(isFunction(hamiVuex.store))
  const app = IS_VUEX_3 ? Vue : createVueApp()
  app.use(hamiVuex)
})

test('hamiVuex.store: empty store', () => {
  const hamiVuex = createHamiVuex()
  const emptyStore = hamiVuex.store()
  expect(!isNil(emptyStore.$name))
  expect(!isNil(emptyStore.$state))
  expect(isFunction(emptyStore.$reset))
  expect(isFunction(emptyStore.$patch))
  emptyStore.$patch({})
  emptyStore.$reset()
})

test('hamiVuex.store: dev hot reloading', () => {
  const hamiVuex = createHamiVuex()
  const store1 = hamiVuex.store({
    $name: 'hot',
    $state: { count: 1 },
  })
  expect(store1.count).toBe(1)
  const store2 = hamiVuex.store({
    $name: 'hot',
    $state: { count: 2 },
  })
  expect(store1.count).toBe(2)
  expect(store2.count).toBe(2)
})

test('hamiVuex.store: counter', async () => {
  const hamiVuex = createHamiVuex()
  const counterStore = hamiVuex.store(counterOptions)
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

test('hamiVuex.store: error', async () => {
  const hamiVuex = createHamiVuex()
  expect(() => {
    hamiVuex.store({
      $abc: 123,
    })
  }).toThrow(/is reserved/)
  expect(() => {
    hamiVuex.store({
      abc: 123,
    })
  }).toThrow(/unexpected value/)
  expect(() => {
    hamiVuex.store({
      $state: 123,
    })
  }).toThrow(/should be function or plain object/)
})

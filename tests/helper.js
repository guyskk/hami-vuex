import Vue from 'vue'
import { createVuexStore, IS_VUEX_3 } from '../src/compat'
import { isNil, isFunction } from '../src/helper'

export { createVuexStore, IS_VUEX_3 }
export { isNil, isFunction }

export function createVueApp(options) {
  if (IS_VUEX_3) {
    return new Vue(options)
  } else {
    return Vue.createApp(options)
  }
}

export const counterOptions = {
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
}

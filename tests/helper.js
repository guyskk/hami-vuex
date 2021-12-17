import VueDefault, * as VueAll from 'vue'
import { createVuexStore, IS_VUEX_3 } from '../src/compat'
import { isNil, isFunction } from '../src/helper'

export { createVuexStore, IS_VUEX_3 }
export { isNil, isFunction }

export const Vue = isNil(VueDefault) ? VueAll : VueDefault

export function createVueApp(options) {
  if (IS_VUEX_3) {
    return new Vue(options)
  } else {
    return Vue.createApp(options)
  }
}

export function createDom() {
  document.body.innerHTML = `<div id="app"></div>`
  return document.querySelector('#app')
}

export function createMountedVueApp(vuexStore, options) {
  const appHolder = { value: null }
  if (IS_VUEX_3) {
    options.store = vuexStore
  }
  options.render = function () {
    return null
  }
  options.mounted = function () {
    appHolder.value = this
  }
  const app = createVueApp(options)
  if (!IS_VUEX_3) {
    app.use(vuexStore)
  }
  const dom = createDom()
  if (IS_VUEX_3) {
    app.$mount(dom)
  } else {
    app.mount(dom)
  }
  return appHolder.value
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

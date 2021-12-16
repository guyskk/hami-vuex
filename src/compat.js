import Vuex from 'vuex'
import { isNil } from './helper'

export const IS_VUEX_3 = isNil(Vuex.createStore)

export function createVuexStore(options) {
  if (IS_VUEX_3) {
    return new Vuex.Store(options)
  }
  return Vuex.createStore(options)
}

export function installVuexStore(_Vue, vuexStore) {
  if (!IS_VUEX_3) {
    _Vue.use(vuexStore)
  }
}

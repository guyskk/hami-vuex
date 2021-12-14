import Vuex from 'vuex'
import { isNil } from './helper'

export const IS_VUEX_3 = isNil(Vuex.createStore)

export function createVuexStore(options) {
  if (IS_VUEX_3) {
    return new Vuex.Store(options)
  }
  return Vuex.createStore(options)
}

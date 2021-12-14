import { createVuexStore, IS_VUEX_3 } from './compat'
import { isNil, isFunction } from './helper'

function createHamiVuex(options) {
  if (isNil(options)) {
    options = {}
  }
  let vuexStore = options.vuexStore
  if (isNil(vuexStore)) {
    vuexStore = createVuexStore({
      strict: options.strict,
      devtools: options.devtools,
      plugins: options.plugins,
      state: {},
    })
  }
  const _storeCount = { value: 0 }
  const self = {
    vuexStore: vuexStore,
    install(_Vue) {
      if (!IS_VUEX_3) {
        _Vue.use(vuexStore)
      }
    },
    store(options) {
      const context = { storeId: _storeCount.value, vuexStore: vuexStore }
      _storeCount.value += 1
      return createHamiStore(context, options)
    },
  }
  return self
}

function createHamiStore({ storeId, vuexStore }, options) {
  const define = _extractStoreDefines(options)
  let storeName = define.spec.$name
  if (isNil(storeName)) {
    storeName = `_hami_${storeId.value}`
  }
  const stateFunc = _extractStoreState(define.spec.$state)
  const initialState = stateFunc()

  define.mutations.push(..._defineBuiltinMutations({ vuexStore, storeName, stateFunc }))
  define.getters.push(..._defineBuiltinGetters({ vuexStore, storeName }))

  const self = {
    $name: storeName,
  }
  define.mutations.forEach(([key]) => {
    self[key] = _createMutationMethod(vuexStore, storeName, key)
  })
  define.actions.forEach(([key]) => {
    self[key] = _createActionMethod(vuexStore, storeName, key)
  })
  define.getters.forEach(([key]) => {
    let getterProperty = _createGetterProperty(vuexStore, storeName, key)
    Object.defineProperty(self, key, getterProperty)
  })
  Object.keys(initialState).forEach((key) => {
    let stateProperty = _createStateProperty(vuexStore, storeName, key)
    Object.defineProperty(self, key, stateProperty)
  })

  const getters = _createGetters(define.getters, () => self)
  const mutations = _createMutations(define.mutations, () => self)
  const actions = _createActions(define.actions, () => self)
  // fix dev hot reloading: [vuex] duplicate getter key: namespace/getter
  if (!isNil(vuexStore.state[storeName])) {
    vuexStore.unregisterModule(storeName)
  }
  vuexStore.registerModule(storeName, {
    namespaced: true,
    state: initialState,
    mutations: mutations,
    getters: getters,
    actions: actions,
  })

  return self
}

function _extractStoreState(stateFunc) {
  if (isNil(stateFunc)) {
    stateFunc = () => ({})
  } else if (!isFunction(stateFunc)) {
    const stateJson = JSON.stringify(stateFunc)
    if (isNil(stateJson)) {
      throw new Error('store state should be function or plain object')
    }
    stateFunc = () => JSON.parse(stateJson)
  }
  return stateFunc
}

function _defineBuiltinMutations({ vuexStore, storeName, stateFunc }) {
  function patchMutator(stateMutator) {
    const state = vuexStore.state[storeName]
    return stateMutator.call(undefined, state)
  }
  function patchPartial(partialState) {
    const state = vuexStore.state[storeName]
    Object.keys(partialState).forEach((key) => {
      state[key] = partialState[key]
    })
  }
  return Object.entries({
    $patch(partialStateOrMutator) {
      if (isFunction(partialStateOrMutator)) {
        return patchMutator(partialStateOrMutator)
      } else {
        return patchPartial(partialStateOrMutator)
      }
    },
    $reset() {
      const state = vuexStore.state[storeName]
      const newState = stateFunc()
      // see also: https://github.com/vuejs/vuex/issues/1118
      Object.keys(state).forEach((key) => {
        state[key] = newState[key]
      })
    },
  })
}

function _defineBuiltinGetters({ vuexStore, storeName }) {
  return Object.entries({
    $state() {
      return vuexStore.state[storeName]
    },
  })
}

const MODULE_SPEC_KEYS = { $name: true, $state: true }

function _extractStoreDefines(options) {
  const spec = {}
  const getters = []
  const actions = []
  const descriptors = Object.getOwnPropertyDescriptors(options)
  Object.keys(options).forEach((key) => {
    if (key.startsWith('$')) {
      if (!MODULE_SPEC_KEYS[key]) {
        throw new Error(`key '${key}' is reserved in store options`)
      }
      spec[key] = options[key]
      return
    }
    const getHandler = descriptors[key]
    if (!isNil(getHandler) && !isNil(getHandler.get)) {
      getters.push([key, getHandler.get])
      return
    }
    const actionHandler = options[key]
    if (isFunction(actionHandler)) {
      actions.push([key, actionHandler])
    } else {
      throw new Error(`unexpected value of key '${key}' in store options`)
    }
  })
  return { spec, getters, actions, mutations: [] }
}

function _createMutations(mutationDefines, thisGetter) {
  let mutations = {}
  mutationDefines.forEach(([key, handler]) => {
    mutations[key] = function (_, { params, callback }) {
      callback(handler.apply(thisGetter(), params))
    }
  })
  return mutations
}

function _createMutationMethod(vuexStore, storeName, key) {
  return function () {
    let result = { value: undefined }
    function callback(x) {
      result.value = x
    }
    let params = [].slice.call(arguments)
    vuexStore.commit(`${storeName}/${key}`, { params, callback })
    return result.value
  }
}

function _createGetters(getterDefines, thisGetter) {
  let getters = {}
  getterDefines.forEach(([key, handler]) => {
    getters[key] = function () {
      return handler.apply(thisGetter(), [])
    }
  })
  return getters
}

function _createGetterProperty(vuexStore, storeName, key) {
  return {
    get() {
      return vuexStore.getters[`${storeName}/${key}`]
    },
  }
}

function _createActions(actionDefines, thisGetter) {
  let actions = {}
  actionDefines.forEach(([key, handler]) => {
    actions[key] = function (_, { params, callback }) {
      callback(handler.apply(thisGetter(), params))
    }
  })
  return actions
}

function _createActionMethod(vuexStore, storeName, key) {
  return function () {
    let result = { value: undefined }
    function callback(x) {
      result.value = x
    }
    let params = [].slice.call(arguments)
    vuexStore.dispatch(`${storeName}/${key}`, { params, callback })
    return result.value
  }
}

function _createStateProperty(vuexStore, storeName, key) {
  return {
    get() {
      return vuexStore.state[storeName][key]
    },
  }
}

export { createHamiVuex }

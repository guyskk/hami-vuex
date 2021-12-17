import { createVuexStore, installVuexStore, useVuexStore } from './compat'
import { isNil, isFunction } from './helper'

const VUEX_STORE_KEY = '$store'

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
  const self = {
    vuexStore: vuexStore,
    install(_Vue) {
      installVuexStore(_Vue, vuexStore)
    },
    store(options) {
      const { useStore } = internalDefineHamiStore(options)
      return useStore(vuexStore)
    },
  }
  return self
}

function _isVuexStore(obj) {
  return !isNil(obj) && !isNil(obj.state) && !isNil(obj.getters)
}

function defineHamiStore(options) {
  const { storeKeys, useStore } = internalDefineHamiStore(options)
  function getStore({ that, store, useInject }) {
    // store: vuexStore, hamiStore; that: Vue instance, hamiStore
    for (let candidate of [store, that]) {
      if (_isVuexStore(candidate)) {
        return candidate
      }
      if (!isNil(candidate)) {
        for (let key of [VUEX_STORE_KEY, _internalName.vuexStore]) {
          let vuexStore = candidate[key]
          if (_isVuexStore(vuexStore)) {
            return vuexStore
          }
        }
      }
    }
    if (isNil(store) && useInject) {
      // inject vuex store inside Vue 3 setup hook
      let vuexStore = useVuexStore()
      if (!isNil(vuexStore)) {
        return vuexStore
      }
    }
    throw new Error('vuex store not found')
  }
  function use(store) {
    const vuexStore = getStore({ that: this, store, useInject: true })
    return useStore(vuexStore)
  }
  const using = { use }
  storeKeys.forEach((key) => {
    using[key] = function () {
      const vuexStore = getStore({ that: this, useInject: false })
      return useStore(vuexStore)[key]
    }
  })
  return using
}

const _internalName = {
  store: '$_internal_hami_store',
  storeId: '$_internal_hami_store_id',
  vuexStore: '$_internal_vuex_store',
}
const _storeCount = { value: 0 }

function internalDefineHamiStore(options) {
  if (isNil(options)) {
    options = {}
  }
  const define = _extractStoreDefines(options)
  const storeId = _storeCount.value
  let storeName = define.spec.$name
  if (isNil(storeName)) {
    storeName = `_hami_${storeId}`
  }
  const stateFunc = _extractStoreState(define.spec.$state)
  const stateKeys = Object.keys(stateFunc())

  function register(vuexStore) {
    const self = {
      $name: storeName,
      [_internalName.storeId]: storeId,
      [_internalName.vuexStore]: vuexStore,
    }
    const finalDefine = {
      mutations: define.mutations.concat(
        _defineBuiltinMutations({
          vuexStore,
          storeName,
          stateFunc,
        })
      ),
      getters: define.getters.concat(
        _defineBuiltinGetters({
          vuexStore,
          storeName,
          self,
        })
      ),
      actions: define.actions.concat([]),
    }
    finalDefine.mutations.forEach(([key]) => {
      self[key] = _createMutationMethod(vuexStore, storeName, key)
    })
    finalDefine.actions.forEach(([key]) => {
      self[key] = _createActionMethod(vuexStore, storeName, key)
    })
    finalDefine.getters.forEach(([key]) => {
      let getterProperty = _createGetterProperty(vuexStore, storeName, key)
      Object.defineProperty(self, key, getterProperty)
    })
    stateKeys.forEach((key) => {
      let stateProperty = _createStateProperty(vuexStore, storeName, key)
      Object.defineProperty(self, key, stateProperty)
    })

    const getters = _createGetters(finalDefine.getters, self)
    const mutations = _createMutations(finalDefine.mutations, self)
    const actions = _createActions(finalDefine.actions, self)
    const vuexModuleOptions = {
      namespaced: true,
      state: stateFunc(),
      mutations: mutations,
      getters: getters,
      actions: actions,
    }
    vuexStore.registerModule(storeName, vuexModuleOptions)
    return self
  }

  function useStore(vuexStore) {
    let got = vuexStore.getters[`${storeName}/${_internalName.store}`]
    // fix dev hot reloading: [vuex] duplicate getter key: namespace/getter
    if (!isNil(got) && got[_internalName.storeId] !== storeId) {
      vuexStore.unregisterModule(storeName)
      got = null
    }
    if (isNil(got)) {
      got = register(vuexStore)
    }
    return got
  }

  const mapToKey = ([key]) => key
  const storeKeys = stateKeys.concat(
    ['$name', '$patch', '$reset', '$state'],
    define.mutations.map(mapToKey),
    define.getters.map(mapToKey),
    define.actions.map(mapToKey)
  )

  _storeCount.value += 1
  return { storeKeys, useStore }
}

function _extractStoreState(stateFunc) {
  if (isNil(stateFunc)) {
    stateFunc = () => ({})
  } else if (!isFunction(stateFunc)) {
    const stateJson = JSON.stringify(stateFunc)
    if (isNil(stateJson) || !stateJson.startsWith('{')) {
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

function _defineBuiltinGetters({ vuexStore, storeName, self }) {
  return Object.entries({
    $state() {
      return vuexStore.state[storeName]
    },
    [_internalName.store]() {
      return self
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
    if (key.startsWith('$') || key === 'use') {
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

function _createMutations(mutationDefines, self) {
  let mutations = {}
  mutationDefines.forEach(([key, handler]) => {
    mutations[key] = function (_, { params, callback }) {
      callback(handler.apply(self, params))
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

function _createGetters(getterDefines, self) {
  let getters = {}
  getterDefines.forEach(([key, handler]) => {
    getters[key] = function () {
      return handler.apply(self, [])
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

function _createActions(actionDefines, self) {
  let actions = {}
  actionDefines.forEach(([key, handler]) => {
    actions[key] = function (_, { params, callback }) {
      callback(handler.apply(self, params))
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

export { createHamiVuex, defineHamiStore }

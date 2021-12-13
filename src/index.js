import Vuex from 'vuex'

function isNil(value) {
  return value === null || value === undefined
}

function isFunction(value) {
  return typeof value === 'function'
}

const _IS_VUEX_3 = isNil(Vuex.createStore)

function createVuexStore(options) {
  if (_IS_VUEX_3) {
    return new Vuex.Store(options)
  }
  return Vuex.createStore(options)
}

function createHamiStore(options) {
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
  const _moduleCount = { value: -1 }
  const self = {
    vuexStore: vuexStore,
    install(_Vue) {
      if (!_IS_VUEX_3) {
        _Vue.use(vuexStore)
      }
    },
    module(options) {
      _moduleCount.value += 1
      const context = { moduleId: _moduleCount.value, store: vuexStore }
      return createHamiModule(context, options)
    },
  }
  return self
}

function createHamiModule({ moduleId, store }, options) {
  const define = _extractModuleDefines(options)
  let moduleName = define.spec.$name
  if (isNil(moduleName)) {
    moduleName = `_hami_module_${moduleId.value}`
  }
  const stateFunc = _extractModuleState(define.spec.$state)
  const initialState = stateFunc()

  define.mutations.push(..._defineBuiltinMutations({ store, moduleName, stateFunc }))
  define.getters.push(..._defineBuiltinGetters({ store, moduleName }))

  const self = {
    $name: moduleName,
  }
  define.mutations.forEach(([key]) => {
    self[key] = _createMutationMethod(store, moduleName, key)
  })
  define.actions.forEach(([key]) => {
    self[key] = _createActionMethod(store, moduleName, key)
  })
  define.getters.forEach(([key]) => {
    let getterProperty = _createGetterProperty(store, moduleName, key)
    Object.defineProperty(self, key, getterProperty)
  })
  Object.keys(initialState).forEach((key) => {
    let stateProperty = _createStateProperty(store, moduleName, key)
    Object.defineProperty(self, key, stateProperty)
  })

  const getters = _createGetters(define.getters, () => self)
  const mutations = _createMutations(define.mutations, () => self)
  const actions = _createActions(define.actions, () => self)
  // fix dev hot reloading: [vuex] duplicate getter key: namespace/getter
  if (!isNil(store.state[moduleName])) {
    store.unregisterModule(moduleName)
  }
  store.registerModule(moduleName, {
    namespaced: true,
    state: initialState,
    mutations: mutations,
    getters: getters,
    actions: actions,
  })

  return self
}

function _extractModuleState(stateFunc) {
  if (isNil(stateFunc)) {
    stateFunc = () => ({})
  } else if (!isFunction(stateFunc)) {
    const stateJson = JSON.stringify(stateFunc)
    if (isNil(stateJson)) {
      throw new Error('module state should be function or plain object')
    }
    stateFunc = () => JSON.parse(stateJson)
  }
  return stateFunc
}

function _defineBuiltinMutations({ store, moduleName, stateFunc }) {
  function patchMutator(stateMutator) {
    const state = store.state[moduleName]
    return stateMutator.call(undefined, state)
  }
  function patchPartial(partialState) {
    const state = store.state[moduleName]
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
      const state = store.state[moduleName]
      const newState = stateFunc()
      // see also: https://github.com/vuejs/vuex/issues/1118
      Object.keys(state).forEach((key) => {
        state[key] = newState[key]
      })
    },
  })
}

function _defineBuiltinGetters({ store, moduleName }) {
  return Object.entries({
    $state() {
      return store.state[moduleName]
    },
  })
}

const MODULE_SPEC_KEYS = { $name: true, $state: true }

function _extractModuleDefines(options) {
  const spec = {}
  const getters = []
  const actions = []
  const descriptors = Object.getOwnPropertyDescriptors(options)
  Object.keys(options).forEach((key) => {
    if (key.startsWith('$')) {
      if (!MODULE_SPEC_KEYS[key]) {
        throw new Error(`key '${key}' is reserved in module options`)
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
      throw new Error(`unexpected value of key '${key}' in module options`)
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

function _createMutationMethod(store, moduleName, key) {
  return function () {
    let result = { value: undefined }
    function callback(x) {
      result.value = x
    }
    let params = [].slice.call(arguments)
    store.commit(`${moduleName}/${key}`, { params, callback })
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

function _createGetterProperty(store, moduleName, key) {
  return {
    get() {
      return store.getters[`${moduleName}/${key}`]
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

function _createActionMethod(store, moduleName, key) {
  return function () {
    let result = { value: undefined }
    function callback(x) {
      result.value = x
    }
    let params = [].slice.call(arguments)
    store.dispatch(`${moduleName}/${key}`, { params, callback })
    return result.value
  }
}

function _createStateProperty(store, moduleName, key) {
  return {
    get() {
      return store.state[moduleName][key]
    },
  }
}

export { createHamiStore }

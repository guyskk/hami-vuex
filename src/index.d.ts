// eslint-disable-next-line no-unused-vars
import type Vue from 'vue'
import type { Store as VuexStore } from 'vuex'

declare type Callable = (...args: any) => any
declare type Immutable<T> =
    T extends Array<infer V> ? ReadonlyArray<Immutable<V>> :
    T extends Callable ? (...args: Parameters<T>) => Immutable<ReturnType<T>> :
    T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } :
    T

declare type StateMutator<S, R> = (this: never, state: S) => R

declare type HamiStoreBase<S> = {
    readonly $name: string,
    readonly $state: Immutable<S>,
    $reset(): void,
    $patch<R>(stateMutator: StateMutator<S, R>): R
    $patch(partialState: Partial<S>): void
}

declare type HamiStoreDefine<T> = Immutable<Omit<T, '$name' | '$state'>>

declare type HamiStore<S, T> =
    Immutable<S> &
    HamiStoreDefine<T> &
    HamiStoreBase<S>

declare type HamiStoreState<S> = S | { (this: never): S }

declare type HamiStoreOptions<S, T> = T & {
    $name?: string,
    $state?: HamiStoreState<S>,
} & ThisType<HamiStore<S, T>>

declare interface HamiVuex<VS> {
    readonly vuexStore: VuexStore<VS>,
    install(Vue: any): void;
    store<
        S extends object = {},
        T extends object = {}
    >(options?: HamiStoreOptions<S, T>): HamiStore<S, T>,
}

declare type HamiStoreUsing<S, T> = {
    use(store?: VuexStore<any> | HamiStore<any, any> | Vue): HamiStore<S, T>
} & { [K in keyof HamiStore<S, T>]: () => HamiStore<S, T>[K] }

declare function defineHamiStore<
    S extends object = {},
    T extends object = {}
>(options?: HamiStoreOptions<S, T>): HamiStoreUsing<S, T>

declare type HamiVuexOptions<VS> = {
    readonly vuexStore?: VuexStore<VS>,
    readonly strict?: boolean;
    readonly devtools?: boolean;
    readonly plugins?: any;
}

declare function createHamiVuex<
    VS = {}
>(options?: HamiVuexOptions<VS>): HamiVuex<VS>;

export { createHamiVuex, defineHamiStore }

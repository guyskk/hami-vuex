// eslint-disable-next-line no-unused-vars
import type { Store as VuexStore } from 'vuex'

declare type Callable = (...args: any) => any
declare type Immutable<T> =
    T extends Array<infer V> ? ReadonlyArray<Immutable<V>> :
    T extends Callable ? (...args: Parameters<T>) => Immutable<ReturnType<T>> :
    T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } :
    T

declare type StateMutator<S, R> = (this: never, state: S) => R

declare type HamiModuleBase<S> = {
    readonly $name: string,
    readonly $state: Immutable<S>,
    $reset(): void,
    $patch<R>(stateMutator: StateMutator<S, R>): R
    $patch(partialState: Partial<S>): void
}

declare type HamiModuleDefine<T> = Immutable<Omit<T, '$name' | '$state'>>

declare type HamiModule<S, T> =
    Immutable<S> &
    HamiModuleDefine<T> &
    HamiModuleBase<S>

declare type HamiModuleState<S> = S | { (this: never): S }

declare type HamiModuleOptions<S, T> = T & {
    $name?: string,
    $state?: HamiModuleState<S>,
} & ThisType<HamiModule<S, T>>

declare interface HamiStore<VS> {
    readonly vuexStore: VuexStore<VS>,
    install(Vue: any): void;
    module<
        S extends object = {},
        T extends object = {}
    >(options: HamiModuleOptions<S, T>): HamiModule<S, T>,
}

declare type HamiStoreOptions<VS> = {
    readonly vuexStore?: VuexStore<VS>,
    readonly strict?: boolean;
    readonly devtools?: boolean;
    readonly plugins?: any;
}

declare function createHamiStore<VS = {}>(options?: HamiStoreOptions<VS>): HamiStore<VS>;

export { createHamiStore }

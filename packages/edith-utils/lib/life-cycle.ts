/**
 * Hooks 中如何实现 Class Component 生命周期
 * @author wangzhe
 */
import { useState, useEffect } from 'react';

// construct
export function useConstruct(fn: any) {
  // useState 传入初始化函数 fn 只会执行一次
  useState(fn);
}

// componentDidMount
export function useDidMount(fn: any) {
  // 依赖项给空数组，只会执行一次
  useEffect(fn, []);
}

// componentDidUpdate
export function useDidUpdate(fn: any) {
  // 依赖项不传值，任何触发的 render 都会执行
  useEffect(fn);
}

// componentWillUnmount
export function useUnMount(fn: any) {
  useEffect(() => fn, []);
}
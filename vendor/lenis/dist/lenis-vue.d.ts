import Lenis, { LenisOptions, ScrollCallback } from "lenis";
import { ComputedRef, HTMLAttributes, Plugin } from "vue";

//#region packages/vue/src/provider.d.ts
type LenisExposed = {
  wrapper?: HTMLDivElement;
  content?: HTMLDivElement;
  lenis?: Lenis;
};
declare const VueLenisImpl: DefineComponent<ExtractPropTypes<{
  root: {
    type: PropType<boolean>;
    default: boolean;
  };
  autoRaf: {
    type: PropType<boolean>;
    default: boolean;
  };
  options: {
    type: PropType<LenisOptions>;
    default: () => {};
  };
  props: {
    type: PropType<HTMLAttributes>;
    default: () => {};
  };
}>, () => VNode<RendererNode, RendererElement, {
  [key: string]: any;
}> | VNode<RendererNode, RendererElement, {
  [key: string]: any;
}>[] | undefined, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{
  root: {
    type: PropType<boolean>;
    default: boolean;
  };
  autoRaf: {
    type: PropType<boolean>;
    default: boolean;
  };
  options: {
    type: PropType<LenisOptions>;
    default: () => {};
  };
  props: {
    type: PropType<HTMLAttributes>;
    default: () => {};
  };
}>> & Readonly<{}>, {
  props: HTMLAttributes;
  root: boolean;
  autoRaf: boolean;
  options: LenisOptions;
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;
declare const VueLenis: typeof VueLenisImpl & {
  new (): LenisExposed;
};
declare const vueLenisPlugin: Plugin;
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    'vue-lenis': typeof VueLenis;
  }
}
//#endregion
//#region packages/vue/src/use-lenis.d.ts
declare function useLenis(callback?: ScrollCallback, priority?: number): ComputedRef<Lenis | undefined>;
//#endregion
export { VueLenis as Lenis, VueLenis, vueLenisPlugin as default, useLenis };
//# sourceMappingURL=lenis-vue.d.ts.map
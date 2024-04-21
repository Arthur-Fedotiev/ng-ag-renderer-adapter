import { ComponentRef, Type } from '@angular/core';
import { AgGridComponentManager } from './ag-grid-component-manager';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, ICellRendererComp } from 'ag-grid-community';

export type ICellRendererAdapterAugmentedParams<
  TData = unknown,
  TValue = unknown,
> = ICellRendererParams<TData, TValue> & {
  component: Type<ICellRendererAngularComp>;
  nativeRendererAdapterOptions?: AgGridNativeRendererAdapterOptions;
};

export interface AugmentedNativeRendereContext {
  componentManager: AgGridComponentManager;
}

export interface AgGridNativeRendererAdapterOptions {
  ngRendererActivationEvents?: string[];
  hostElement?: HTMLElement | AgGridNativeRendererHostElFactory;
}

export type AgGridNativeRendererHostElFactory = (
  params: ICellRendererAdapterAugmentedParams,
) => HTMLElement;

export const DEFAULT_NATIVE_RENDERER_ADAPTER: Required<AgGridNativeRendererAdapterOptions> =
  {
    ngRendererActivationEvents: ['mouseover'],
    hostElement(params) {
      const hostElement = document.createElement('div');
      hostElement.className = 'native-renderer';
      hostElement.style.width = '100%';
      hostElement.innerHTML = `<span>${params.value}</span>`;
      return hostElement;
    },
  };

export class AgGridNativeRendererAdapter implements ICellRendererComp {
  private activeComponent: ComponentRef<ICellRendererAngularComp> | null = null;
  private hostEl!: HTMLElement;
  private params!: ICellRendererAdapterAugmentedParams;
  private normalizedOptions!: Required<AgGridNativeRendererAdapterOptions>;
  private onActivated: (e: Event) => void = () => {};
  private activationCbId?: ReturnType<typeof requestIdleCallback>;
  private initComponentTimeoutId?: ReturnType<typeof setTimeout>;

  private get componentManager() {
    return this.params.context.componentManager;
  }

  init(params: ICellRendererAdapterAugmentedParams): void {
    if (!this.verifyParams(params)) {
      return;
    }

    this.normalizedOptions = {
      ...DEFAULT_NATIVE_RENDERER_ADAPTER,
      ...(params.nativeRendererAdapterOptions ?? {}),
    };

    this.params = params;
    this.hostEl = this.createHostElemt();
    this.scheduleActivation(this.hostEl, params);
  }

  destroy(): void {
    this.activeComponent &&
      this.componentManager.releaseComponent(this.activeComponent);
    this.initComponentTimeoutId && clearTimeout(this.initComponentTimeoutId);
    this.activationCbId && cancelIdleCallback(this.activationCbId);
  }

  refresh(params: ICellRendererAdapterAugmentedParams): boolean {
    return this.activeComponent
      ? this.activeComponent.instance.refresh(params)
      : false;
  }

  getGui() {
    return this.hostEl;
  }

  private verifyParams(
    params: ICellRendererAdapterAugmentedParams,
  ): params is ICellRendererAdapterAugmentedParams & {
    context: AugmentedNativeRendereContext;
  } {
    if (!params.context?.componentManager) {
      throw new Error(
        `In order to use the "AgGridNativeRendererAdapter" component, you must provide an instance of "AgGridComponentManager" in the grid context at the "componentManager" property.`,
      );
    }

    if (!params.component) {
      throw new Error(
        `You must provide a component to the "AgGridNativeRendererAdapter" component at "cellRendererParams.component"`,
      );
    }

    return true;
  }

  private createHostElemt() {
    if (!this.normalizedOptions.hostElement) {
      return (
        DEFAULT_NATIVE_RENDERER_ADAPTER.hostElement as AgGridNativeRendererHostElFactory
      )(this.params!);
    }

    return typeof this.normalizedOptions.hostElement === 'function'
      ? this.normalizedOptions.hostElement(this.params!)
      : this.normalizedOptions.hostElement;
  }

  scheduleActivation(
    hostElement: HTMLElement,
    params: ICellRendererAdapterAugmentedParams,
  ): void {
    this.onActivated = () => {
      this.initComponentTimeoutId = setTimeout(() =>
        this.initComponent(hostElement, params),
      );
    };

    const attachListenersCb = () => {
      this.normalizedOptions.ngRendererActivationEvents.forEach((event) => {
        hostElement.addEventListener(event, this.onActivated, {
          passive: true,
        });
      });

      params.eGridCell.addEventListener('focus', this.onActivated, {
        passive: true,
      });
    };

    this.activationCbId = requestIdleCallback(attachListenersCb, {
      timeout: 1_000,
    });
  }

  private initComponent(
    hostElement: HTMLElement,
    params: ICellRendererAdapterAugmentedParams,
  ) {
    if (this.activeComponent) {
      return;
    }

    this.activeComponent = (
      params.context.componentManager as AgGridComponentManager
    ).createComponent(params.component, params, hostElement);
  }
}

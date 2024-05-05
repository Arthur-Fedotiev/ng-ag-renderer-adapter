import { ComponentRef } from '@angular/core';
import { AgGridComponentManager } from './ag-grid-component-manager';
import { ICellRendererComp } from 'ag-grid-community';
import {
  AgGridNativeRendererAdapterOptions,
  ICellRendererAdapterAugmentedParams,
  AgGridNativeRendererHostElFactory,
  AugmentedNativeRendereContext,
  CellRendererAngularManageableComponent,
} from './models';

/**
 * The default options for the native renderer adapter.
 */
export const DEFAULT_NATIVE_RENDERER_ADAPTER: Required<AgGridNativeRendererAdapterOptions> & {
  hostElement: AgGridNativeRendererHostElFactory;
} = {
  ngRendererActivationEvents: ['mouseover'],
  hostElement(params) {
    const hostElement = document.createElement('div');
    hostElement.className = 'native-renderer';
    hostElement.style.width = '100%';
    hostElement.innerHTML = `<span>${params.value}</span>`;
    return hostElement;
  },
};

/**
 * `AgGridNativeRendererAdapter` is AG grid's native cell renderer that renderers provided by consumer
 * HTML element and swaps it with the Angular component Cell renderer when the user interacts with the cell.
 * It's goal to improve the performance of the grid by rendering the cell content with a native renderer
 * and only swapping it with the Angular component when the user interacts with the individual cell.
 * In such a way, the grid can render a large number of cells without the performance penalty which comes with
 * Angular component rendering and associated change detection.
 *
 *
 */
export class AgGridNativeRendererAdapter implements ICellRendererComp {
  private activeComponent: ComponentRef<CellRendererAngularManageableComponent> | null =
    null;
  private hostEl!: HTMLElement;
  private params!: ICellRendererAdapterAugmentedParams;
  private normalizedOptions!: Required<AgGridNativeRendererAdapterOptions>;
  private onActivated: (e: Event) => void = () => {};
  private idelyScheduledActivationListener?: ReturnType<
    typeof requestIdleCallback
  >;
  private initComponentTimeoutId?: ReturnType<typeof setTimeout>;

  private get componentManager() {
    return this.params.context.componentManager;
  }

  /**
   *  Initializes the native renderer adapter. It creates the host element and schedules the activation of the Angular component
   * when the user interacts with the cell (e.g. mouseover, focus)
   *
   * @param params The cell renderer params augmented with the context of the grid.
   * @returns  void
   */
  init(params: ICellRendererAdapterAugmentedParams) {
    if (!this.isParamsAugmented(params)) {
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

  /**
   * Destroys the native renderer adapter. It releases the active Angular component and clears the scheduled component initialization.
   *
   * @returns void
   */
  destroy() {
    this.cancelActivationListenerAttachmentIfScheduled();
    this.clearComponentInitializationIfScheduled();
    this.releaseActiveComponentIfInitialized();
  }

  /**
   * Refreshes the active Angular component with the new params.
   *
   * @param params The new params to refresh the component with.
   * @returns boolean
   */
  refresh(params: ICellRendererAdapterAugmentedParams) {
    return this.activeComponent
      ? this.activeComponent.instance.refresh(params)
      : false;
  }

  /**
   * Gets the GUI of the native renderer adapter.
   *
   * @returns HTMLElement
   */
  getGui() {
    return this.hostEl;
  }

  private createHostElemt() {
    return typeof this.normalizedOptions.hostElement === 'function'
      ? this.normalizedOptions.hostElement(this.params!)
      : this.normalizedOptions.hostElement;
  }

  private scheduleActivation(
    hostElement: HTMLElement,
    params: ICellRendererAdapterAugmentedParams,
  ) {
    this.onActivated = () => {
      this.initComponentTimeoutId = setTimeout(() => {
        this.initComponent(hostElement, params);
      });
    };

    const attachListenersCb = () => {
      this.attachUserInteractionListeners(hostElement);
      this.attachCellFocusListener(params);
    };

    this.scheduleActivationListenerAttachment(attachListenersCb);
  }

  private attachUserInteractionListeners(hostElement: HTMLElement) {
    this.normalizedOptions.ngRendererActivationEvents.forEach((event) => {
      hostElement.addEventListener(event, this.onActivated, {
        passive: true,
      });
    });
  }
  private attachCellFocusListener(params: ICellRendererAdapterAugmentedParams) {
    params.eGridCell.addEventListener('focus', this.onActivated, {
      passive: true,
    });
  }

  private scheduleActivationListenerAttachment(attachListenersCb: () => void) {
    this.idelyScheduledActivationListener = requestIdleCallback(
      attachListenersCb,
      {
        timeout: 50,
      },
    );
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
    ).createComponent(params.component, hostElement, params);
  }

  private isParamsAugmented(
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

  private releaseActiveComponentIfInitialized() {
    if (this.isComponentInitializationComplete()) {
      this.componentManager.releaseComponent(this.activeComponent);
    }
  }

  private clearComponentInitializationIfScheduled() {
    if (this.isComponentInitializationScheduled()) {
      clearTimeout(this.initComponentTimeoutId);
    }
  }

  private cancelActivationListenerAttachmentIfScheduled() {
    if (this.isActivationListenerAattachmentScheduled()) {
      cancelIdleCallback(this.idelyScheduledActivationListener!);
    }
  }

  private isComponentInitializationComplete() {
    return Boolean(this.activeComponent);
  }

  private isComponentInitializationScheduled() {
    return Boolean(this.initComponentTimeoutId);
  }

  private isActivationListenerAattachmentScheduled() {
    return Boolean(this.idelyScheduledActivationListener);
  }
}

import { ComponentRef } from '@angular/core';
import { AgGridComponentManager } from './ag-grid-component-manager';
import { ICellRendererComp } from 'ag-grid-community';
import {
  AgGridNativeRendererAdapterOptions,
  ICellRendererAdapterAugmentedParams,
  AgGridNativeRendererHostElFactory,
  AugmentedNativeRendererContext,
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
    this.clearEventListeners();
    this.releaseActiveComponentIfInitialized();
  }

  /**
   * Refreshes the active Angular component with the new params.
   * If the component is not initialized, it returns false to indicate that the refresh should be handled by the native renderer.
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

  /**
   * Uses the provided host element factory/HTML-element to create the host
   * element being a placeholder shown to the user. It is specific
   * for the use case and will be eventually swapped with Angular cell renderer.
   */
  private createHostElemt() {
    return typeof this.normalizedOptions.hostElement === 'function'
      ? this.normalizedOptions.hostElement(this.params!)
      : this.normalizedOptions.hostElement;
  }

  /**
   * Schedules the activation of the Angular component when the user interacts with the cell.
   * It attaches the activation listeners to the host element and the cell focus event in next tick.
   */
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

  /**
   * Attaches the user interaction listeners to the host element.
   * The listeners are defined in the `ngRendererActivationEvents` property of the `AgGridNativeRendererAdapterOptions`.
   * It uses the passive event listener to avoid blocking the main thread when the user interacts with the cell.
   * @param hostElement The host element to attach the listeners to.
   * {@see https://github.com/Arthur-Fedotiev/ng-ag-renderer-adapter/blob/6f00ea76f371aa7d1b29fbccba16876a97e94f5b/src/app/ag-native-renderer-adapter/ag-grid-native-renderer-adapter.ts#L61}
   */
  private attachUserInteractionListeners(hostElement: HTMLElement) {
    this.normalizedOptions.ngRendererActivationEvents.forEach((event) => {
      hostElement.addEventListener(event, this.onActivated, {
        passive: true,
        once: true,
      });
    });
  }

  /**
   * Attaches the focus event listener to the cell element.
   * It's used to activate the Angular component when the cell is focused.
   * It uses the passive event listener to avoid blocking the main thread when the user interacts with the cell.
   */
  private attachCellFocusListener(params: ICellRendererAdapterAugmentedParams) {
    params.eGridCell.addEventListener('focus', this.onActivated, {
      passive: true,
      once: true,
    });
  }

  /**
   * It uses the `requestIdleCallback` to schedule the activation listener attachment in the next idle period,
   * which allows the browser to perform high-priority tasks first (e.g. rendering, user input handling)
   */
  private scheduleActivationListenerAttachment(attachListenersCb: () => void) {
    this.idelyScheduledActivationListener = requestIdleCallback(
      attachListenersCb,
      {
        timeout: 50,
      },
    );
  }

  /**
   * Initializes the Angular component with the provided host element and params.
   * It uses the `AgGridComponentManager` to create the component and attach it to the host element.
   */
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

  /**
   * Checks if the provided params are augmented with the grid context and the component.
   * It throws an error if the context or the component is missing.
   */
  private isParamsAugmented(
    params: ICellRendererAdapterAugmentedParams,
  ): params is ICellRendererAdapterAugmentedParams & {
    context: AugmentedNativeRendererContext;
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

  private clearEventListeners() {
    this.hostEl.removeEventListener('mouseover', this.onActivated);
    this.params.eGridCell.removeEventListener('focus', this.onActivated);
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

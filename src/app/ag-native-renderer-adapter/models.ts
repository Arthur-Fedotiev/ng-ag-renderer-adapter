import { Type } from '@angular/core';
import { AgFrameworkComponent } from 'ag-grid-angular';
import { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { AgGridComponentManager } from './ag-grid-component-manager';

export type CellRendererAngularManageableComponent<
  TData = unknown,
  TValue = unknown,
> = AgFrameworkComponent<ICellRendererAdapterAugmentedParams<TData, TValue>> &
  ICellRenderer<TData>;

export type ICellRendererAdapterAugmentedParams<
  TData = unknown,
  TValue = unknown,
> = ICellRendererParams<TData, TValue> & {
  /**
   * The context for the renderer, which must include the component manager,
   * used component instances, and manage its lifecycle.
   */
  context: AugmentedNativeRendererContext;
  /**
   * The Angular component to be used as a Cell Renderer when activated.
   */
  component: Type<CellRendererAngularManageableComponent>;
  /**
   * Options for the native renderer adapter to customize its behavior (see {@link AgGridNativeRendererAdapterOptions}).
   */
  nativeRendererAdapterOptions?: AgGridNativeRendererAdapterOptions;
};

/**
 * The context for the renderer, which must include the component manager,
 */
export interface AugmentedNativeRendererContext {
  /**
   * The component manager used to create and manage the lifecycle of the Angular components ({@link AgGridComponentManager}).
   */
  componentManager: AgGridComponentManager;
}

/**
 * Options for the native renderer adapter to customize its behavior.
 */
export interface AgGridNativeRendererAdapterOptions {
  /**
   * The list of events that will activate the Angular component renderer.
   * @default ['mouseover']
   */
  ngRendererActivationEvents?: string[];
  /**
   * The host element for the native renderer. It can be a HTMLElement or a factory function that returns an HTMLElement.
   * @default A div element with the class "native-renderer" and a span element with the value of the cell.
   */
  hostElement?: HTMLElement | AgGridNativeRendererHostElFactory;
}

/**
 * A factory function that creates a host element for the native renderer.
 */
export type AgGridNativeRendererHostElFactory = (
  params: ICellRendererAdapterAugmentedParams,
) => HTMLElement;

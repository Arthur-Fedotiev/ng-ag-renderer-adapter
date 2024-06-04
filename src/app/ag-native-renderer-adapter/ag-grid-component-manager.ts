import {
  Injectable,
  inject,
  Injector,
  ApplicationRef,
  EnvironmentInjector,
  Type,
  ComponentRef,
  createComponent,
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Injectable()
export abstract class AngularComponentManager<
  TComponent = unknown,
  TParams = unknown,
> {
  protected readonly elementInjector = inject(Injector);
  protected readonly appRef = inject(ApplicationRef);
  protected readonly envInjector = inject(EnvironmentInjector);

  /**
   * Creates an Angular component of the given type and attaches it to the given host element.
   * Also attaches the Component View to the ApplicationRef (Change Detection).
   * @param type The type of the component to create.
   * @param host The host element to attach the component to.
   * @param params The parameters to pass to the component initialization method
   * @returns The created ComponentRef ({@link ComponentRef}) of the created component.
   */
  abstract createComponent(
    type: Type<TComponent>,
    host: HTMLElement,
    params?: TParams,
  ): ComponentRef<TComponent>;

  /**
   * Releases the given component from the Angular application:
   * - Detaches the Component View from the ApplicationRef (Change Detection).
   * - Destroys the component.
   * @param componentRef The component to release.
   */
  abstract releaseComponent(componentRef: ComponentRef<TComponent>): void;
}

/**
 * Concrete implementation of the AngularComponentManager for the AgGrid components.
 * It creates and manages the lifecycle of the Angular components used as cell renderers in AgGrid.
 * @see AngularComponentManager
 *
 */
@Injectable({
  providedIn: 'root',
})
export class AgGridComponentManager extends AngularComponentManager<
  ICellRendererAngularComp,
  ICellRendererParams
> {
  override createComponent(
    type: Type<ICellRendererAngularComp>,
    parentEl: HTMLElement,
    params: ICellRendererParams,
  ) {
    const componentRef = createComponent(type, {
      environmentInjector: this.envInjector,
      elementInjector: this.elementInjector,
      hostElement: parentEl,
    });

    this.appRef.attachView(componentRef.hostView);
    componentRef.instance.agInit(params);

    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }

  override releaseComponent(
    componentRef: ComponentRef<ICellRendererAngularComp>,
  ): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}

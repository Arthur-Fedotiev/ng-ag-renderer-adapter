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

/**

 * `AgGridComponentManagerImpl` is a concrete implementation of `AgGridComponentManager`.

 * It creates an Angular component of the given type and append to the given DOM node to be rendered in the grid.

 * It also registers the newly created ref using the `ApplicationRef` instance to include

 * the component view into change detection cycles.

 *  The `releaseComponent` method destroys a given component when it is no longer needed.

 */

@Injectable({
  providedIn: 'root',
})
export class AgGridComponentManager {
  private readonly elementInjector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);

  createComponent(
    type: Type<ICellRendererAngularComp>,
    params: ICellRendererParams,
    parentEl: HTMLElement,
  ): ComponentRef<ICellRendererAngularComp> {
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

  releaseComponent(ref: ComponentRef<ICellRendererAngularComp>): void {
    ref.destroy();
  }
}

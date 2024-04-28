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
import { ICellRendererAdapterAugmentedParams } from './models';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Injectable()
export abstract class AngularComponentManager<
  TComponent = unknown,
  TParams = unknown,
> {
  protected readonly elementInjector = inject(Injector);
  protected readonly appRef = inject(ApplicationRef);
  protected readonly envInjector = inject(EnvironmentInjector);

  abstract createComponent(
    type: Type<TComponent>,
    host: HTMLElement,
    params?: TParams,
  ): ComponentRef<TComponent>;

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
  ICellRendererAdapterAugmentedParams
> {
  override createComponent(
    type: Type<ICellRendererAngularComp>,
    parentEl: HTMLElement,
    params: ICellRendererAdapterAugmentedParams,
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

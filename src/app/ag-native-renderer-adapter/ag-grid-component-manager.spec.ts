import { TestBed } from '@angular/core/testing';
import {
  ComponentRef,
  ApplicationRef,
  Injector,
  Component,
} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { AgGridComponentManager } from './ag-grid-component-manager';
import { ICellRendererParams } from 'ag-grid-community';

describe('AgGridComponentManager', () => {
  it('should create a component and return the component reference', () => {
    const { componentManager, appRef, type } = setup();
    const host = document.createElement('div');
    const params = { value: 'test' } as ICellRendererParams;

    const componentRef = componentManager.createComponent(
      type,
      host,
      params,
    ) as ComponentRef<TestAngularRendererComponent>;

    expect(appRef.attachView).toHaveBeenCalledWith(componentRef.hostView);
    expect(componentRef.instance.params).toBe(params);
  });
});

function setup() {
  TestBed.configureTestingModule({
    providers: [
      AgGridComponentManager,
      {
        provide: ApplicationRef,
        useValue: jasmine.createSpyObj('ApplicationRef', ['attachView']),
      },
      {
        provide: Injector,
        useValue: jasmine.createSpyObj('Injector', ['get']),
      },
    ],
  });

  return {
    componentManager: TestBed.inject(AgGridComponentManager),
    appRef: TestBed.inject(ApplicationRef),
    elementInjector: TestBed.inject(Injector),
    type: TestAngularRendererComponent,
  };
}

@Component({
  selector: 'test-angular-renderer',
  template: `<div>{{ params.value }}</div>`,
  standalone: true,
})
export class TestAngularRendererComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }
}

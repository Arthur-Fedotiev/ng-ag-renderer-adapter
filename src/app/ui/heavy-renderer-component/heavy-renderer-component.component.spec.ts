import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeavyRendererComponentComponent } from './heavy-renderer-component.component';

describe('HeavyRendererComponentComponent', () => {
  let component: HeavyRendererComponentComponent;
  let fixture: ComponentFixture<HeavyRendererComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeavyRendererComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeavyRendererComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

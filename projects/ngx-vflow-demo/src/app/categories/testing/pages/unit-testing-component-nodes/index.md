# {{ NgDocPage.title }}

To simplify writing isolated tests for component nodes, you can use the `provideCustomNodeMocks` function. This helps prevent dependency injection (DI) errors that occur when a node is used outside the scope of the `VflowComponent`.

```ts
@Component({
  standalone: true,
  template: `<div resizable><handle /></div>`,
  imports: [Vflow]
})
class TestCustomNodeComponent extends CustomNodeComponent { }

describe(('TestCustomNodeComponent'), () => {
  let component: TestCustomNodeComponent;
  let fixture: ComponentFixture<TestCustomNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCustomNodeComponent],
      providers: [provideCustomNodeMocks()]
    });

    fixture = TestBed.createComponent(TestCustomNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // should create without DI errors
    expect(component).toBeTruthy();
  });
})
```

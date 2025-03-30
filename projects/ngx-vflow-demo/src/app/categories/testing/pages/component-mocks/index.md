# {{ NgDocPage.title }}

The library provides mocks for every public component to simplify testing in a Node environment (e.g., Jest). The naming convention for importing real and mock components follows this pattern: `\*Component` → `\*MockComponent`. For example, `VflowComponent` has a corresponding mock, `VflowMockComponent`.

In the testing environment, you should replace real components with their mock counterparts. For example, to mock the entire library, you should:

```ts
@Component({
  template: `<vflow #vflow />`,
  standalone: true,
  imports: [Vflow],
})
class YourComponent {
  // It's important to not reference to VflowComponent class directly
  // viewChild(VflowComponent) like this
  // because in testing env it changed to VflowMockComponent
  // but the line below works corretly in both environments
  public vflow = viewChild<VflowComponent>('vflow');

  ...
}

describe('YourComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YourComponent],
    })
      // override imprort of Vflow with mocks
      .overrideComponent(YourComponent, {
        remove: {
          imports: [Vflow],
        },
        add: {
          imports: [VflowMocks],
        },
      })
      .compileComponents();
  });
});
```

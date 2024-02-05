import { Directive, Injector, inject, runInInjectionContext } from "@angular/core";

export function InjectionContext(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    let result

    if (this instanceof WithInjectorDirective) {
      runInInjectionContext(this.injector, () => {
        result = originalMethod.apply(this, args);
      })
    } else {
      throw new Error('Class that contains decorated method must extends WithInjectorDirective class')
    }

    return result;
  };

  // Return the modified descriptor
  return descriptor;
}

@Directive()
export abstract class WithInjectorDirective {
  public readonly injector = inject(Injector)
}

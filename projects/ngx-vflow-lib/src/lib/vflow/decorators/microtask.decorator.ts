export function Microtask(target: any, key: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => void>) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    queueMicrotask(() => {
      originalMethod?.apply(this, args)
    })
  };

  // Return the modified descriptor
  return descriptor;
}

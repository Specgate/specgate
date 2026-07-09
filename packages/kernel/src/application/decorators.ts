export function RequireTenant() {
  return function (constructor: new (...args: unknown[]) => object) {
    Object.defineProperty(constructor.prototype, "requiresTenant", {
      get() {
        return true;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

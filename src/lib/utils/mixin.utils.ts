function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
      );
    });
  });
}

function applyMixinsAndInstanate(derivedCtor: any, constructors: any[]){
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
      );
    });
  });
  return new Proxy(derivedCtor, {
    construct(target: any, argArray: any[], newTarget: Function): object {
      const Target = new target(...argArray);
      const instantated = constructors.map(constructor => new constructor())
      for (const obj of instantated) {
        const propertiesName = Object.getOwnPropertyNames(obj)
        for (const propName of propertiesName) {
          Target[propName] = obj[propName];
        }
      }
      return Target;
    },
  });
}

export { applyMixins, applyMixinsAndInstanate };

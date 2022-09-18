import type { Converter, Generalize, ValueOf } from '../types';

const nonEmptyString = (value: string) => value || undefined;

export const stringConverter: Converter<string> = {
  parse: nonEmptyString,
  serialize: nonEmptyString,
};

export const numberConverter: Converter<number> = {
  parse(value) {
    if (value) {
      const _value = +value;

      if (isNaN(_value)) {
        throw new Error('NaN');
      }

      return _value;
    }
  },
  serialize: String,
};

export const booleanConverter: Converter<boolean> = {
  parse(value) {
    if (value) {
      return value === 'true';
    }
  },
  serialize: String,
};

export const getArrayConverter = <T>(
  itemConverter: Converter<T>,
  separator: string = ','
): Converter<T[]> => {
  return {
    parse(value) {
      if (value) {
        return value.split(separator).map(itemConverter.parse) as T[];
      }
    },
    serialize(value) {
      if (value.length) {
        return value.map(itemConverter.serialize).join(separator);
      }
    },
  };
};

const throwError = (value: any, arr: any[]) => {
  throw new Error(`${value} is not found in [${arr.join(', ')}]`);
};

export const getOneOfConverter = <T extends {} | []>(
  generalConverter: Converter<Generalize<ValueOf<T>>>,
  possibleValues: T
): Converter<ValueOf<T>> => {
  const arr: ValueOf<T>[] = Array.isArray(possibleValues)
    ? possibleValues
    : Object.values(possibleValues);

  const possibleSet = new Set<string>();

  for (let i = arr.length; i--; ) {
    possibleSet.add(generalConverter.serialize(arr[i] as any)!);
  }

  return {
    parse(value) {
      if (possibleSet.has(value)) {
        return generalConverter.parse(value) as ValueOf<T>;
      }

      throwError(value, arr);
    },
    serialize(value) {
      const serializedValue = generalConverter.serialize(
        value as Generalize<ValueOf<T>>
      );

      if (possibleSet.has(serializedValue!)) {
        return serializedValue;
      }

      throwError(value, arr);
    },
  };
};

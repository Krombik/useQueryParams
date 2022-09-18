export type MappedHistory = {
  listen(listener: (search: string) => void): () => void;
  push(search: string): void;
  replace(search: string): void;
};

export type Converter<T> = {
  serialize(value: T): string | undefined;
  parse(value: string): T | undefined;
};

type Primitive = number | string | boolean | null;

type Stringified<T> = T extends Primitive ? `${T}` : string;

export type QueryParamsState<
  P extends AnyRecord,
  Key extends StringOrNever<keyof P> = StringOrNever<keyof P>
> = {
  params: { [key in Key]: P[key] };
  serializedParams: {
    [key in Key]: undefined extends Extract<P[key], undefined>
      ? Stringified<Exclude<P[key], undefined>> | undefined
      : Stringified<P[key]>;
  };
};

export type SchemaItem<T = unknown> = {
  converter: Converter<NonNullable<T>>;
} & (null extends Extract<T, null>
  ? { nullable: true }
  : { nullable?: false }) &
  (undefined extends Extract<T, undefined>
    ? { required?: false; defaultValue?: undefined }
    : { required?: false; defaultValue: T | (() => T) } | { required: true });

export type Schema<P extends AnyRecord> = {
  [key in keyof P]: SchemaItem<P[key]>;
};

export type AnyRecord = Record<string, any>;

export type StringOrNever<T> = T extends string ? T : never;

type AnyArray<T> = Array<T> | ReadonlyArray<T>;

export type ValueOf<T> = T extends AnyArray<infer K>
  ? K
  : T extends {}
  ? T[keyof T]
  : never;

export type PartOf<T, KP> = Partial<T> & {
  [K in keyof KP]-?: K extends keyof T ? T[K] : never;
};

export type Generalize<T> = T extends string
  ? string
  : T extends number
  ? number
  : T;

export type Errors<P extends AnyRecord = AnyRecord> = {
  readonly [key in keyof P]?: true;
};

export type Private<T extends {}> = UnionToIntersection<UnionOfPrivate<T>>;

type UnionOfPrivate<T extends {}> = {
  [key in keyof T]: key extends string ? { [K in `_${key}`]: T[key] } : never;
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I extends {}
    ? I
    : never
  : never;

export type PrimitiveRecord = Record<
  string,
  Primitive | AnyArray<Primitive> | undefined
>;

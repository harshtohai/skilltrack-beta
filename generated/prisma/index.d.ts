
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Programme
 * 
 */
export type Programme = $Result.DefaultSelection<Prisma.$ProgrammePayload>
/**
 * Model Cohort
 * 
 */
export type Cohort = $Result.DefaultSelection<Prisma.$CohortPayload>
/**
 * Model Trainee
 * 
 */
export type Trainee = $Result.DefaultSelection<Prisma.$TraineePayload>
/**
 * Model Enrolment
 * 
 */
export type Enrolment = $Result.DefaultSelection<Prisma.$EnrolmentPayload>
/**
 * Model FollowupEvent
 * 
 */
export type FollowupEvent = $Result.DefaultSelection<Prisma.$FollowupEventPayload>
/**
 * Model BotSession
 * 
 */
export type BotSession = $Result.DefaultSelection<Prisma.$BotSessionPayload>
/**
 * Model EmploymentClaim
 * 
 */
export type EmploymentClaim = $Result.DefaultSelection<Prisma.$EmploymentClaimPayload>
/**
 * Model OutcomeEvent
 * 
 */
export type OutcomeEvent = $Result.DefaultSelection<Prisma.$OutcomeEventPayload>
/**
 * Model VerificationRequest
 * 
 */
export type VerificationRequest = $Result.DefaultSelection<Prisma.$VerificationRequestPayload>
/**
 * Model AuditEvent
 * 
 */
export type AuditEvent = $Result.DefaultSelection<Prisma.$AuditEventPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OutcomeStatus: {
  EMPLOYED: 'EMPLOYED',
  SELF_EMPLOYED: 'SELF_EMPLOYED',
  APPRENTICE: 'APPRENTICE',
  LOOKING: 'LOOKING',
  NOT_WORKING: 'NOT_WORKING',
  UNKNOWN: 'UNKNOWN'
};

export type OutcomeStatus = (typeof OutcomeStatus)[keyof typeof OutcomeStatus]


export const VerificationStatus: {
  UNKNOWN: 'UNKNOWN',
  SELF_REPORTED: 'SELF_REPORTED',
  PROVIDER_CONFIRMED: 'PROVIDER_CONFIRMED',
  EMPLOYER_CONFIRMED: 'EMPLOYER_CONFIRMED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  SYSTEM_VERIFIED: 'SYSTEM_VERIFIED',
  CONFLICT: 'CONFLICT'
};

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus]


export const SalaryBand: {
  LT_10K: 'LT_10K',
  B_10_20K: 'B_10_20K',
  B_20_35K: 'B_20_35K',
  B_35_50K: 'B_35_50K',
  GT_50K: 'GT_50K'
};

export type SalaryBand = (typeof SalaryBand)[keyof typeof SalaryBand]


export const NonPlacementReason: {
  NO_JOBS: 'NO_JOBS',
  SKILLS_MISMATCH: 'SKILLS_MISMATCH',
  FAMILY: 'FAMILY',
  HEALTH: 'HEALTH',
  OTHER: 'OTHER'
};

export type NonPlacementReason = (typeof NonPlacementReason)[keyof typeof NonPlacementReason]


export const FollowupStatus: {
  SCHEDULED: 'SCHEDULED',
  SENT: 'SENT',
  RESPONDED: 'RESPONDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED'
};

export type FollowupStatus = (typeof FollowupStatus)[keyof typeof FollowupStatus]


export const Channel: {
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
  EMAIL: 'EMAIL'
};

export type Channel = (typeof Channel)[keyof typeof Channel]


export const BotSessionState: {
  AWAITING_STATUS: 'AWAITING_STATUS',
  AWAITING_EMPLOYER_NAME: 'AWAITING_EMPLOYER_NAME',
  AWAITING_ROLE: 'AWAITING_ROLE',
  AWAITING_SALARY_BAND: 'AWAITING_SALARY_BAND',
  AWAITING_NON_PLACEMENT_REASON: 'AWAITING_NON_PLACEMENT_REASON',
  DONE: 'DONE'
};

export type BotSessionState = (typeof BotSessionState)[keyof typeof BotSessionState]


export const ActorType: {
  ADMIN: 'ADMIN',
  TRAINEE: 'TRAINEE',
  EMPLOYER: 'EMPLOYER',
  SYSTEM: 'SYSTEM'
};

export type ActorType = (typeof ActorType)[keyof typeof ActorType]

}

export type OutcomeStatus = $Enums.OutcomeStatus

export const OutcomeStatus: typeof $Enums.OutcomeStatus

export type VerificationStatus = $Enums.VerificationStatus

export const VerificationStatus: typeof $Enums.VerificationStatus

export type SalaryBand = $Enums.SalaryBand

export const SalaryBand: typeof $Enums.SalaryBand

export type NonPlacementReason = $Enums.NonPlacementReason

export const NonPlacementReason: typeof $Enums.NonPlacementReason

export type FollowupStatus = $Enums.FollowupStatus

export const FollowupStatus: typeof $Enums.FollowupStatus

export type Channel = $Enums.Channel

export const Channel: typeof $Enums.Channel

export type BotSessionState = $Enums.BotSessionState

export const BotSessionState: typeof $Enums.BotSessionState

export type ActorType = $Enums.ActorType

export const ActorType: typeof $Enums.ActorType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Programmes
 * const programmes = await prisma.programme.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Programmes
   * const programmes = await prisma.programme.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.programme`: Exposes CRUD operations for the **Programme** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Programmes
    * const programmes = await prisma.programme.findMany()
    * ```
    */
  get programme(): Prisma.ProgrammeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cohort`: Exposes CRUD operations for the **Cohort** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cohorts
    * const cohorts = await prisma.cohort.findMany()
    * ```
    */
  get cohort(): Prisma.CohortDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trainee`: Exposes CRUD operations for the **Trainee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trainees
    * const trainees = await prisma.trainee.findMany()
    * ```
    */
  get trainee(): Prisma.TraineeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.enrolment`: Exposes CRUD operations for the **Enrolment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Enrolments
    * const enrolments = await prisma.enrolment.findMany()
    * ```
    */
  get enrolment(): Prisma.EnrolmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.followupEvent`: Exposes CRUD operations for the **FollowupEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FollowupEvents
    * const followupEvents = await prisma.followupEvent.findMany()
    * ```
    */
  get followupEvent(): Prisma.FollowupEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.botSession`: Exposes CRUD operations for the **BotSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BotSessions
    * const botSessions = await prisma.botSession.findMany()
    * ```
    */
  get botSession(): Prisma.BotSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.employmentClaim`: Exposes CRUD operations for the **EmploymentClaim** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmploymentClaims
    * const employmentClaims = await prisma.employmentClaim.findMany()
    * ```
    */
  get employmentClaim(): Prisma.EmploymentClaimDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outcomeEvent`: Exposes CRUD operations for the **OutcomeEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutcomeEvents
    * const outcomeEvents = await prisma.outcomeEvent.findMany()
    * ```
    */
  get outcomeEvent(): Prisma.OutcomeEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verificationRequest`: Exposes CRUD operations for the **VerificationRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VerificationRequests
    * const verificationRequests = await prisma.verificationRequest.findMany()
    * ```
    */
  get verificationRequest(): Prisma.VerificationRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditEvent`: Exposes CRUD operations for the **AuditEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditEvents
    * const auditEvents = await prisma.auditEvent.findMany()
    * ```
    */
  get auditEvent(): Prisma.AuditEventDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Programme: 'Programme',
    Cohort: 'Cohort',
    Trainee: 'Trainee',
    Enrolment: 'Enrolment',
    FollowupEvent: 'FollowupEvent',
    BotSession: 'BotSession',
    EmploymentClaim: 'EmploymentClaim',
    OutcomeEvent: 'OutcomeEvent',
    VerificationRequest: 'VerificationRequest',
    AuditEvent: 'AuditEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "programme" | "cohort" | "trainee" | "enrolment" | "followupEvent" | "botSession" | "employmentClaim" | "outcomeEvent" | "verificationRequest" | "auditEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Programme: {
        payload: Prisma.$ProgrammePayload<ExtArgs>
        fields: Prisma.ProgrammeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProgrammeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProgrammeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          findFirst: {
            args: Prisma.ProgrammeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProgrammeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          findMany: {
            args: Prisma.ProgrammeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>[]
          }
          create: {
            args: Prisma.ProgrammeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          createMany: {
            args: Prisma.ProgrammeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProgrammeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>[]
          }
          delete: {
            args: Prisma.ProgrammeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          update: {
            args: Prisma.ProgrammeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          deleteMany: {
            args: Prisma.ProgrammeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProgrammeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProgrammeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>[]
          }
          upsert: {
            args: Prisma.ProgrammeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgrammePayload>
          }
          aggregate: {
            args: Prisma.ProgrammeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgramme>
          }
          groupBy: {
            args: Prisma.ProgrammeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgrammeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProgrammeCountArgs<ExtArgs>
            result: $Utils.Optional<ProgrammeCountAggregateOutputType> | number
          }
        }
      }
      Cohort: {
        payload: Prisma.$CohortPayload<ExtArgs>
        fields: Prisma.CohortFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CohortFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CohortFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          findFirst: {
            args: Prisma.CohortFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CohortFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          findMany: {
            args: Prisma.CohortFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>[]
          }
          create: {
            args: Prisma.CohortCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          createMany: {
            args: Prisma.CohortCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CohortCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>[]
          }
          delete: {
            args: Prisma.CohortDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          update: {
            args: Prisma.CohortUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          deleteMany: {
            args: Prisma.CohortDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CohortUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CohortUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>[]
          }
          upsert: {
            args: Prisma.CohortUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CohortPayload>
          }
          aggregate: {
            args: Prisma.CohortAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCohort>
          }
          groupBy: {
            args: Prisma.CohortGroupByArgs<ExtArgs>
            result: $Utils.Optional<CohortGroupByOutputType>[]
          }
          count: {
            args: Prisma.CohortCountArgs<ExtArgs>
            result: $Utils.Optional<CohortCountAggregateOutputType> | number
          }
        }
      }
      Trainee: {
        payload: Prisma.$TraineePayload<ExtArgs>
        fields: Prisma.TraineeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TraineeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TraineeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          findFirst: {
            args: Prisma.TraineeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TraineeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          findMany: {
            args: Prisma.TraineeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>[]
          }
          create: {
            args: Prisma.TraineeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          createMany: {
            args: Prisma.TraineeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TraineeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>[]
          }
          delete: {
            args: Prisma.TraineeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          update: {
            args: Prisma.TraineeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          deleteMany: {
            args: Prisma.TraineeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TraineeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TraineeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>[]
          }
          upsert: {
            args: Prisma.TraineeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TraineePayload>
          }
          aggregate: {
            args: Prisma.TraineeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainee>
          }
          groupBy: {
            args: Prisma.TraineeGroupByArgs<ExtArgs>
            result: $Utils.Optional<TraineeGroupByOutputType>[]
          }
          count: {
            args: Prisma.TraineeCountArgs<ExtArgs>
            result: $Utils.Optional<TraineeCountAggregateOutputType> | number
          }
        }
      }
      Enrolment: {
        payload: Prisma.$EnrolmentPayload<ExtArgs>
        fields: Prisma.EnrolmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EnrolmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EnrolmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          findFirst: {
            args: Prisma.EnrolmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EnrolmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          findMany: {
            args: Prisma.EnrolmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>[]
          }
          create: {
            args: Prisma.EnrolmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          createMany: {
            args: Prisma.EnrolmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EnrolmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>[]
          }
          delete: {
            args: Prisma.EnrolmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          update: {
            args: Prisma.EnrolmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          deleteMany: {
            args: Prisma.EnrolmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EnrolmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EnrolmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>[]
          }
          upsert: {
            args: Prisma.EnrolmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnrolmentPayload>
          }
          aggregate: {
            args: Prisma.EnrolmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEnrolment>
          }
          groupBy: {
            args: Prisma.EnrolmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<EnrolmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.EnrolmentCountArgs<ExtArgs>
            result: $Utils.Optional<EnrolmentCountAggregateOutputType> | number
          }
        }
      }
      FollowupEvent: {
        payload: Prisma.$FollowupEventPayload<ExtArgs>
        fields: Prisma.FollowupEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FollowupEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FollowupEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          findFirst: {
            args: Prisma.FollowupEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FollowupEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          findMany: {
            args: Prisma.FollowupEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>[]
          }
          create: {
            args: Prisma.FollowupEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          createMany: {
            args: Prisma.FollowupEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FollowupEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>[]
          }
          delete: {
            args: Prisma.FollowupEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          update: {
            args: Prisma.FollowupEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          deleteMany: {
            args: Prisma.FollowupEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FollowupEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FollowupEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>[]
          }
          upsert: {
            args: Prisma.FollowupEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowupEventPayload>
          }
          aggregate: {
            args: Prisma.FollowupEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFollowupEvent>
          }
          groupBy: {
            args: Prisma.FollowupEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<FollowupEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.FollowupEventCountArgs<ExtArgs>
            result: $Utils.Optional<FollowupEventCountAggregateOutputType> | number
          }
        }
      }
      BotSession: {
        payload: Prisma.$BotSessionPayload<ExtArgs>
        fields: Prisma.BotSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BotSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BotSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          findFirst: {
            args: Prisma.BotSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BotSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          findMany: {
            args: Prisma.BotSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>[]
          }
          create: {
            args: Prisma.BotSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          createMany: {
            args: Prisma.BotSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BotSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>[]
          }
          delete: {
            args: Prisma.BotSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          update: {
            args: Prisma.BotSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          deleteMany: {
            args: Prisma.BotSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BotSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BotSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>[]
          }
          upsert: {
            args: Prisma.BotSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotSessionPayload>
          }
          aggregate: {
            args: Prisma.BotSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBotSession>
          }
          groupBy: {
            args: Prisma.BotSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<BotSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.BotSessionCountArgs<ExtArgs>
            result: $Utils.Optional<BotSessionCountAggregateOutputType> | number
          }
        }
      }
      EmploymentClaim: {
        payload: Prisma.$EmploymentClaimPayload<ExtArgs>
        fields: Prisma.EmploymentClaimFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmploymentClaimFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmploymentClaimFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          findFirst: {
            args: Prisma.EmploymentClaimFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmploymentClaimFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          findMany: {
            args: Prisma.EmploymentClaimFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>[]
          }
          create: {
            args: Prisma.EmploymentClaimCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          createMany: {
            args: Prisma.EmploymentClaimCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmploymentClaimCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>[]
          }
          delete: {
            args: Prisma.EmploymentClaimDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          update: {
            args: Prisma.EmploymentClaimUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          deleteMany: {
            args: Prisma.EmploymentClaimDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmploymentClaimUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmploymentClaimUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>[]
          }
          upsert: {
            args: Prisma.EmploymentClaimUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmploymentClaimPayload>
          }
          aggregate: {
            args: Prisma.EmploymentClaimAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmploymentClaim>
          }
          groupBy: {
            args: Prisma.EmploymentClaimGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmploymentClaimGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmploymentClaimCountArgs<ExtArgs>
            result: $Utils.Optional<EmploymentClaimCountAggregateOutputType> | number
          }
        }
      }
      OutcomeEvent: {
        payload: Prisma.$OutcomeEventPayload<ExtArgs>
        fields: Prisma.OutcomeEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutcomeEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutcomeEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          findFirst: {
            args: Prisma.OutcomeEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutcomeEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          findMany: {
            args: Prisma.OutcomeEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>[]
          }
          create: {
            args: Prisma.OutcomeEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          createMany: {
            args: Prisma.OutcomeEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutcomeEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>[]
          }
          delete: {
            args: Prisma.OutcomeEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          update: {
            args: Prisma.OutcomeEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          deleteMany: {
            args: Prisma.OutcomeEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutcomeEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutcomeEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>[]
          }
          upsert: {
            args: Prisma.OutcomeEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomeEventPayload>
          }
          aggregate: {
            args: Prisma.OutcomeEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutcomeEvent>
          }
          groupBy: {
            args: Prisma.OutcomeEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutcomeEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutcomeEventCountArgs<ExtArgs>
            result: $Utils.Optional<OutcomeEventCountAggregateOutputType> | number
          }
        }
      }
      VerificationRequest: {
        payload: Prisma.$VerificationRequestPayload<ExtArgs>
        fields: Prisma.VerificationRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          findFirst: {
            args: Prisma.VerificationRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          findMany: {
            args: Prisma.VerificationRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>[]
          }
          create: {
            args: Prisma.VerificationRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          createMany: {
            args: Prisma.VerificationRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>[]
          }
          delete: {
            args: Prisma.VerificationRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          update: {
            args: Prisma.VerificationRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          deleteMany: {
            args: Prisma.VerificationRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>[]
          }
          upsert: {
            args: Prisma.VerificationRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationRequestPayload>
          }
          aggregate: {
            args: Prisma.VerificationRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerificationRequest>
          }
          groupBy: {
            args: Prisma.VerificationRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationRequestCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationRequestCountAggregateOutputType> | number
          }
        }
      }
      AuditEvent: {
        payload: Prisma.$AuditEventPayload<ExtArgs>
        fields: Prisma.AuditEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          findFirst: {
            args: Prisma.AuditEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          findMany: {
            args: Prisma.AuditEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          create: {
            args: Prisma.AuditEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          createMany: {
            args: Prisma.AuditEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          delete: {
            args: Prisma.AuditEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          update: {
            args: Prisma.AuditEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          deleteMany: {
            args: Prisma.AuditEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>[]
          }
          upsert: {
            args: Prisma.AuditEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditEventPayload>
          }
          aggregate: {
            args: Prisma.AuditEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditEvent>
          }
          groupBy: {
            args: Prisma.AuditEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditEventCountArgs<ExtArgs>
            result: $Utils.Optional<AuditEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    programme?: ProgrammeOmit
    cohort?: CohortOmit
    trainee?: TraineeOmit
    enrolment?: EnrolmentOmit
    followupEvent?: FollowupEventOmit
    botSession?: BotSessionOmit
    employmentClaim?: EmploymentClaimOmit
    outcomeEvent?: OutcomeEventOmit
    verificationRequest?: VerificationRequestOmit
    auditEvent?: AuditEventOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ProgrammeCountOutputType
   */

  export type ProgrammeCountOutputType = {
    cohorts: number
  }

  export type ProgrammeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cohorts?: boolean | ProgrammeCountOutputTypeCountCohortsArgs
  }

  // Custom InputTypes
  /**
   * ProgrammeCountOutputType without action
   */
  export type ProgrammeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgrammeCountOutputType
     */
    select?: ProgrammeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProgrammeCountOutputType without action
   */
  export type ProgrammeCountOutputTypeCountCohortsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CohortWhereInput
  }


  /**
   * Count Type CohortCountOutputType
   */

  export type CohortCountOutputType = {
    enrolments: number
    followupEvents: number
  }

  export type CohortCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    enrolments?: boolean | CohortCountOutputTypeCountEnrolmentsArgs
    followupEvents?: boolean | CohortCountOutputTypeCountFollowupEventsArgs
  }

  // Custom InputTypes
  /**
   * CohortCountOutputType without action
   */
  export type CohortCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CohortCountOutputType
     */
    select?: CohortCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CohortCountOutputType without action
   */
  export type CohortCountOutputTypeCountEnrolmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EnrolmentWhereInput
  }

  /**
   * CohortCountOutputType without action
   */
  export type CohortCountOutputTypeCountFollowupEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowupEventWhereInput
  }


  /**
   * Count Type TraineeCountOutputType
   */

  export type TraineeCountOutputType = {
    enrolments: number
    followupEvents: number
    botSessions: number
    employmentClaims: number
    outcomeEvents: number
  }

  export type TraineeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    enrolments?: boolean | TraineeCountOutputTypeCountEnrolmentsArgs
    followupEvents?: boolean | TraineeCountOutputTypeCountFollowupEventsArgs
    botSessions?: boolean | TraineeCountOutputTypeCountBotSessionsArgs
    employmentClaims?: boolean | TraineeCountOutputTypeCountEmploymentClaimsArgs
    outcomeEvents?: boolean | TraineeCountOutputTypeCountOutcomeEventsArgs
  }

  // Custom InputTypes
  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TraineeCountOutputType
     */
    select?: TraineeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeCountEnrolmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EnrolmentWhereInput
  }

  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeCountFollowupEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowupEventWhereInput
  }

  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeCountBotSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotSessionWhereInput
  }

  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeCountEmploymentClaimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmploymentClaimWhereInput
  }

  /**
   * TraineeCountOutputType without action
   */
  export type TraineeCountOutputTypeCountOutcomeEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeEventWhereInput
  }


  /**
   * Count Type FollowupEventCountOutputType
   */

  export type FollowupEventCountOutputType = {
    botSessions: number
    employmentClaims: number
  }

  export type FollowupEventCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    botSessions?: boolean | FollowupEventCountOutputTypeCountBotSessionsArgs
    employmentClaims?: boolean | FollowupEventCountOutputTypeCountEmploymentClaimsArgs
  }

  // Custom InputTypes
  /**
   * FollowupEventCountOutputType without action
   */
  export type FollowupEventCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEventCountOutputType
     */
    select?: FollowupEventCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FollowupEventCountOutputType without action
   */
  export type FollowupEventCountOutputTypeCountBotSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotSessionWhereInput
  }

  /**
   * FollowupEventCountOutputType without action
   */
  export type FollowupEventCountOutputTypeCountEmploymentClaimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmploymentClaimWhereInput
  }


  /**
   * Count Type EmploymentClaimCountOutputType
   */

  export type EmploymentClaimCountOutputType = {
    verificationRequests: number
    outcomeEvents: number
  }

  export type EmploymentClaimCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    verificationRequests?: boolean | EmploymentClaimCountOutputTypeCountVerificationRequestsArgs
    outcomeEvents?: boolean | EmploymentClaimCountOutputTypeCountOutcomeEventsArgs
  }

  // Custom InputTypes
  /**
   * EmploymentClaimCountOutputType without action
   */
  export type EmploymentClaimCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaimCountOutputType
     */
    select?: EmploymentClaimCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmploymentClaimCountOutputType without action
   */
  export type EmploymentClaimCountOutputTypeCountVerificationRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationRequestWhereInput
  }

  /**
   * EmploymentClaimCountOutputType without action
   */
  export type EmploymentClaimCountOutputTypeCountOutcomeEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeEventWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Programme
   */

  export type AggregateProgramme = {
    _count: ProgrammeCountAggregateOutputType | null
    _min: ProgrammeMinAggregateOutputType | null
    _max: ProgrammeMaxAggregateOutputType | null
  }

  export type ProgrammeMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProgrammeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProgrammeCountAggregateOutputType = {
    id: number
    name: number
    code: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProgrammeMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProgrammeMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProgrammeCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProgrammeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Programme to aggregate.
     */
    where?: ProgrammeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Programmes to fetch.
     */
    orderBy?: ProgrammeOrderByWithRelationInput | ProgrammeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProgrammeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Programmes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Programmes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Programmes
    **/
    _count?: true | ProgrammeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgrammeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgrammeMaxAggregateInputType
  }

  export type GetProgrammeAggregateType<T extends ProgrammeAggregateArgs> = {
        [P in keyof T & keyof AggregateProgramme]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgramme[P]>
      : GetScalarType<T[P], AggregateProgramme[P]>
  }




  export type ProgrammeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgrammeWhereInput
    orderBy?: ProgrammeOrderByWithAggregationInput | ProgrammeOrderByWithAggregationInput[]
    by: ProgrammeScalarFieldEnum[] | ProgrammeScalarFieldEnum
    having?: ProgrammeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgrammeCountAggregateInputType | true
    _min?: ProgrammeMinAggregateInputType
    _max?: ProgrammeMaxAggregateInputType
  }

  export type ProgrammeGroupByOutputType = {
    id: string
    name: string
    code: string
    createdAt: Date
    updatedAt: Date
    _count: ProgrammeCountAggregateOutputType | null
    _min: ProgrammeMinAggregateOutputType | null
    _max: ProgrammeMaxAggregateOutputType | null
  }

  type GetProgrammeGroupByPayload<T extends ProgrammeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgrammeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgrammeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgrammeGroupByOutputType[P]>
            : GetScalarType<T[P], ProgrammeGroupByOutputType[P]>
        }
      >
    >


  export type ProgrammeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cohorts?: boolean | Programme$cohortsArgs<ExtArgs>
    _count?: boolean | ProgrammeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["programme"]>

  export type ProgrammeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["programme"]>

  export type ProgrammeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["programme"]>

  export type ProgrammeSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProgrammeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "createdAt" | "updatedAt", ExtArgs["result"]["programme"]>
  export type ProgrammeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cohorts?: boolean | Programme$cohortsArgs<ExtArgs>
    _count?: boolean | ProgrammeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProgrammeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProgrammeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProgrammePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Programme"
    objects: {
      cohorts: Prisma.$CohortPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["programme"]>
    composites: {}
  }

  type ProgrammeGetPayload<S extends boolean | null | undefined | ProgrammeDefaultArgs> = $Result.GetResult<Prisma.$ProgrammePayload, S>

  type ProgrammeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProgrammeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProgrammeCountAggregateInputType | true
    }

  export interface ProgrammeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Programme'], meta: { name: 'Programme' } }
    /**
     * Find zero or one Programme that matches the filter.
     * @param {ProgrammeFindUniqueArgs} args - Arguments to find a Programme
     * @example
     * // Get one Programme
     * const programme = await prisma.programme.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProgrammeFindUniqueArgs>(args: SelectSubset<T, ProgrammeFindUniqueArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Programme that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProgrammeFindUniqueOrThrowArgs} args - Arguments to find a Programme
     * @example
     * // Get one Programme
     * const programme = await prisma.programme.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProgrammeFindUniqueOrThrowArgs>(args: SelectSubset<T, ProgrammeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Programme that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeFindFirstArgs} args - Arguments to find a Programme
     * @example
     * // Get one Programme
     * const programme = await prisma.programme.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProgrammeFindFirstArgs>(args?: SelectSubset<T, ProgrammeFindFirstArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Programme that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeFindFirstOrThrowArgs} args - Arguments to find a Programme
     * @example
     * // Get one Programme
     * const programme = await prisma.programme.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProgrammeFindFirstOrThrowArgs>(args?: SelectSubset<T, ProgrammeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Programmes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Programmes
     * const programmes = await prisma.programme.findMany()
     * 
     * // Get first 10 Programmes
     * const programmes = await prisma.programme.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const programmeWithIdOnly = await prisma.programme.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProgrammeFindManyArgs>(args?: SelectSubset<T, ProgrammeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Programme.
     * @param {ProgrammeCreateArgs} args - Arguments to create a Programme.
     * @example
     * // Create one Programme
     * const Programme = await prisma.programme.create({
     *   data: {
     *     // ... data to create a Programme
     *   }
     * })
     * 
     */
    create<T extends ProgrammeCreateArgs>(args: SelectSubset<T, ProgrammeCreateArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Programmes.
     * @param {ProgrammeCreateManyArgs} args - Arguments to create many Programmes.
     * @example
     * // Create many Programmes
     * const programme = await prisma.programme.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProgrammeCreateManyArgs>(args?: SelectSubset<T, ProgrammeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Programmes and returns the data saved in the database.
     * @param {ProgrammeCreateManyAndReturnArgs} args - Arguments to create many Programmes.
     * @example
     * // Create many Programmes
     * const programme = await prisma.programme.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Programmes and only return the `id`
     * const programmeWithIdOnly = await prisma.programme.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProgrammeCreateManyAndReturnArgs>(args?: SelectSubset<T, ProgrammeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Programme.
     * @param {ProgrammeDeleteArgs} args - Arguments to delete one Programme.
     * @example
     * // Delete one Programme
     * const Programme = await prisma.programme.delete({
     *   where: {
     *     // ... filter to delete one Programme
     *   }
     * })
     * 
     */
    delete<T extends ProgrammeDeleteArgs>(args: SelectSubset<T, ProgrammeDeleteArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Programme.
     * @param {ProgrammeUpdateArgs} args - Arguments to update one Programme.
     * @example
     * // Update one Programme
     * const programme = await prisma.programme.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProgrammeUpdateArgs>(args: SelectSubset<T, ProgrammeUpdateArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Programmes.
     * @param {ProgrammeDeleteManyArgs} args - Arguments to filter Programmes to delete.
     * @example
     * // Delete a few Programmes
     * const { count } = await prisma.programme.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProgrammeDeleteManyArgs>(args?: SelectSubset<T, ProgrammeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Programmes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Programmes
     * const programme = await prisma.programme.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProgrammeUpdateManyArgs>(args: SelectSubset<T, ProgrammeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Programmes and returns the data updated in the database.
     * @param {ProgrammeUpdateManyAndReturnArgs} args - Arguments to update many Programmes.
     * @example
     * // Update many Programmes
     * const programme = await prisma.programme.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Programmes and only return the `id`
     * const programmeWithIdOnly = await prisma.programme.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProgrammeUpdateManyAndReturnArgs>(args: SelectSubset<T, ProgrammeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Programme.
     * @param {ProgrammeUpsertArgs} args - Arguments to update or create a Programme.
     * @example
     * // Update or create a Programme
     * const programme = await prisma.programme.upsert({
     *   create: {
     *     // ... data to create a Programme
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Programme we want to update
     *   }
     * })
     */
    upsert<T extends ProgrammeUpsertArgs>(args: SelectSubset<T, ProgrammeUpsertArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Programmes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeCountArgs} args - Arguments to filter Programmes to count.
     * @example
     * // Count the number of Programmes
     * const count = await prisma.programme.count({
     *   where: {
     *     // ... the filter for the Programmes we want to count
     *   }
     * })
    **/
    count<T extends ProgrammeCountArgs>(
      args?: Subset<T, ProgrammeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgrammeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Programme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProgrammeAggregateArgs>(args: Subset<T, ProgrammeAggregateArgs>): Prisma.PrismaPromise<GetProgrammeAggregateType<T>>

    /**
     * Group by Programme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgrammeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProgrammeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProgrammeGroupByArgs['orderBy'] }
        : { orderBy?: ProgrammeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProgrammeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgrammeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Programme model
   */
  readonly fields: ProgrammeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Programme.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProgrammeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cohorts<T extends Programme$cohortsArgs<ExtArgs> = {}>(args?: Subset<T, Programme$cohortsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Programme model
   */
  interface ProgrammeFieldRefs {
    readonly id: FieldRef<"Programme", 'String'>
    readonly name: FieldRef<"Programme", 'String'>
    readonly code: FieldRef<"Programme", 'String'>
    readonly createdAt: FieldRef<"Programme", 'DateTime'>
    readonly updatedAt: FieldRef<"Programme", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Programme findUnique
   */
  export type ProgrammeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter, which Programme to fetch.
     */
    where: ProgrammeWhereUniqueInput
  }

  /**
   * Programme findUniqueOrThrow
   */
  export type ProgrammeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter, which Programme to fetch.
     */
    where: ProgrammeWhereUniqueInput
  }

  /**
   * Programme findFirst
   */
  export type ProgrammeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter, which Programme to fetch.
     */
    where?: ProgrammeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Programmes to fetch.
     */
    orderBy?: ProgrammeOrderByWithRelationInput | ProgrammeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Programmes.
     */
    cursor?: ProgrammeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Programmes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Programmes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Programmes.
     */
    distinct?: ProgrammeScalarFieldEnum | ProgrammeScalarFieldEnum[]
  }

  /**
   * Programme findFirstOrThrow
   */
  export type ProgrammeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter, which Programme to fetch.
     */
    where?: ProgrammeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Programmes to fetch.
     */
    orderBy?: ProgrammeOrderByWithRelationInput | ProgrammeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Programmes.
     */
    cursor?: ProgrammeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Programmes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Programmes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Programmes.
     */
    distinct?: ProgrammeScalarFieldEnum | ProgrammeScalarFieldEnum[]
  }

  /**
   * Programme findMany
   */
  export type ProgrammeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter, which Programmes to fetch.
     */
    where?: ProgrammeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Programmes to fetch.
     */
    orderBy?: ProgrammeOrderByWithRelationInput | ProgrammeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Programmes.
     */
    cursor?: ProgrammeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Programmes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Programmes.
     */
    skip?: number
    distinct?: ProgrammeScalarFieldEnum | ProgrammeScalarFieldEnum[]
  }

  /**
   * Programme create
   */
  export type ProgrammeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * The data needed to create a Programme.
     */
    data: XOR<ProgrammeCreateInput, ProgrammeUncheckedCreateInput>
  }

  /**
   * Programme createMany
   */
  export type ProgrammeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Programmes.
     */
    data: ProgrammeCreateManyInput | ProgrammeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Programme createManyAndReturn
   */
  export type ProgrammeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * The data used to create many Programmes.
     */
    data: ProgrammeCreateManyInput | ProgrammeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Programme update
   */
  export type ProgrammeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * The data needed to update a Programme.
     */
    data: XOR<ProgrammeUpdateInput, ProgrammeUncheckedUpdateInput>
    /**
     * Choose, which Programme to update.
     */
    where: ProgrammeWhereUniqueInput
  }

  /**
   * Programme updateMany
   */
  export type ProgrammeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Programmes.
     */
    data: XOR<ProgrammeUpdateManyMutationInput, ProgrammeUncheckedUpdateManyInput>
    /**
     * Filter which Programmes to update
     */
    where?: ProgrammeWhereInput
    /**
     * Limit how many Programmes to update.
     */
    limit?: number
  }

  /**
   * Programme updateManyAndReturn
   */
  export type ProgrammeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * The data used to update Programmes.
     */
    data: XOR<ProgrammeUpdateManyMutationInput, ProgrammeUncheckedUpdateManyInput>
    /**
     * Filter which Programmes to update
     */
    where?: ProgrammeWhereInput
    /**
     * Limit how many Programmes to update.
     */
    limit?: number
  }

  /**
   * Programme upsert
   */
  export type ProgrammeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * The filter to search for the Programme to update in case it exists.
     */
    where: ProgrammeWhereUniqueInput
    /**
     * In case the Programme found by the `where` argument doesn't exist, create a new Programme with this data.
     */
    create: XOR<ProgrammeCreateInput, ProgrammeUncheckedCreateInput>
    /**
     * In case the Programme was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProgrammeUpdateInput, ProgrammeUncheckedUpdateInput>
  }

  /**
   * Programme delete
   */
  export type ProgrammeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
    /**
     * Filter which Programme to delete.
     */
    where: ProgrammeWhereUniqueInput
  }

  /**
   * Programme deleteMany
   */
  export type ProgrammeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Programmes to delete
     */
    where?: ProgrammeWhereInput
    /**
     * Limit how many Programmes to delete.
     */
    limit?: number
  }

  /**
   * Programme.cohorts
   */
  export type Programme$cohortsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    where?: CohortWhereInput
    orderBy?: CohortOrderByWithRelationInput | CohortOrderByWithRelationInput[]
    cursor?: CohortWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CohortScalarFieldEnum | CohortScalarFieldEnum[]
  }

  /**
   * Programme without action
   */
  export type ProgrammeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Programme
     */
    select?: ProgrammeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Programme
     */
    omit?: ProgrammeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgrammeInclude<ExtArgs> | null
  }


  /**
   * Model Cohort
   */

  export type AggregateCohort = {
    _count: CohortCountAggregateOutputType | null
    _min: CohortMinAggregateOutputType | null
    _max: CohortMaxAggregateOutputType | null
  }

  export type CohortMinAggregateOutputType = {
    id: string | null
    programmeId: string | null
    name: string | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CohortMaxAggregateOutputType = {
    id: string | null
    programmeId: string | null
    name: string | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CohortCountAggregateOutputType = {
    id: number
    programmeId: number
    name: number
    startDate: number
    endDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CohortMinAggregateInputType = {
    id?: true
    programmeId?: true
    name?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CohortMaxAggregateInputType = {
    id?: true
    programmeId?: true
    name?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CohortCountAggregateInputType = {
    id?: true
    programmeId?: true
    name?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CohortAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cohort to aggregate.
     */
    where?: CohortWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cohorts to fetch.
     */
    orderBy?: CohortOrderByWithRelationInput | CohortOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CohortWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cohorts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cohorts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cohorts
    **/
    _count?: true | CohortCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CohortMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CohortMaxAggregateInputType
  }

  export type GetCohortAggregateType<T extends CohortAggregateArgs> = {
        [P in keyof T & keyof AggregateCohort]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCohort[P]>
      : GetScalarType<T[P], AggregateCohort[P]>
  }




  export type CohortGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CohortWhereInput
    orderBy?: CohortOrderByWithAggregationInput | CohortOrderByWithAggregationInput[]
    by: CohortScalarFieldEnum[] | CohortScalarFieldEnum
    having?: CohortScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CohortCountAggregateInputType | true
    _min?: CohortMinAggregateInputType
    _max?: CohortMaxAggregateInputType
  }

  export type CohortGroupByOutputType = {
    id: string
    programmeId: string
    name: string
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
    _count: CohortCountAggregateOutputType | null
    _min: CohortMinAggregateOutputType | null
    _max: CohortMaxAggregateOutputType | null
  }

  type GetCohortGroupByPayload<T extends CohortGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CohortGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CohortGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CohortGroupByOutputType[P]>
            : GetScalarType<T[P], CohortGroupByOutputType[P]>
        }
      >
    >


  export type CohortSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    programmeId?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
    enrolments?: boolean | Cohort$enrolmentsArgs<ExtArgs>
    followupEvents?: boolean | Cohort$followupEventsArgs<ExtArgs>
    _count?: boolean | CohortCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cohort"]>

  export type CohortSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    programmeId?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cohort"]>

  export type CohortSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    programmeId?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cohort"]>

  export type CohortSelectScalar = {
    id?: boolean
    programmeId?: boolean
    name?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CohortOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "programmeId" | "name" | "startDate" | "endDate" | "createdAt" | "updatedAt", ExtArgs["result"]["cohort"]>
  export type CohortInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
    enrolments?: boolean | Cohort$enrolmentsArgs<ExtArgs>
    followupEvents?: boolean | Cohort$followupEventsArgs<ExtArgs>
    _count?: boolean | CohortCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CohortIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
  }
  export type CohortIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    programme?: boolean | ProgrammeDefaultArgs<ExtArgs>
  }

  export type $CohortPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cohort"
    objects: {
      programme: Prisma.$ProgrammePayload<ExtArgs>
      enrolments: Prisma.$EnrolmentPayload<ExtArgs>[]
      followupEvents: Prisma.$FollowupEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      programmeId: string
      name: string
      startDate: Date
      endDate: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cohort"]>
    composites: {}
  }

  type CohortGetPayload<S extends boolean | null | undefined | CohortDefaultArgs> = $Result.GetResult<Prisma.$CohortPayload, S>

  type CohortCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CohortFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CohortCountAggregateInputType | true
    }

  export interface CohortDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cohort'], meta: { name: 'Cohort' } }
    /**
     * Find zero or one Cohort that matches the filter.
     * @param {CohortFindUniqueArgs} args - Arguments to find a Cohort
     * @example
     * // Get one Cohort
     * const cohort = await prisma.cohort.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CohortFindUniqueArgs>(args: SelectSubset<T, CohortFindUniqueArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cohort that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CohortFindUniqueOrThrowArgs} args - Arguments to find a Cohort
     * @example
     * // Get one Cohort
     * const cohort = await prisma.cohort.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CohortFindUniqueOrThrowArgs>(args: SelectSubset<T, CohortFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cohort that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortFindFirstArgs} args - Arguments to find a Cohort
     * @example
     * // Get one Cohort
     * const cohort = await prisma.cohort.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CohortFindFirstArgs>(args?: SelectSubset<T, CohortFindFirstArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cohort that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortFindFirstOrThrowArgs} args - Arguments to find a Cohort
     * @example
     * // Get one Cohort
     * const cohort = await prisma.cohort.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CohortFindFirstOrThrowArgs>(args?: SelectSubset<T, CohortFindFirstOrThrowArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cohorts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cohorts
     * const cohorts = await prisma.cohort.findMany()
     * 
     * // Get first 10 Cohorts
     * const cohorts = await prisma.cohort.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cohortWithIdOnly = await prisma.cohort.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CohortFindManyArgs>(args?: SelectSubset<T, CohortFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cohort.
     * @param {CohortCreateArgs} args - Arguments to create a Cohort.
     * @example
     * // Create one Cohort
     * const Cohort = await prisma.cohort.create({
     *   data: {
     *     // ... data to create a Cohort
     *   }
     * })
     * 
     */
    create<T extends CohortCreateArgs>(args: SelectSubset<T, CohortCreateArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cohorts.
     * @param {CohortCreateManyArgs} args - Arguments to create many Cohorts.
     * @example
     * // Create many Cohorts
     * const cohort = await prisma.cohort.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CohortCreateManyArgs>(args?: SelectSubset<T, CohortCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cohorts and returns the data saved in the database.
     * @param {CohortCreateManyAndReturnArgs} args - Arguments to create many Cohorts.
     * @example
     * // Create many Cohorts
     * const cohort = await prisma.cohort.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cohorts and only return the `id`
     * const cohortWithIdOnly = await prisma.cohort.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CohortCreateManyAndReturnArgs>(args?: SelectSubset<T, CohortCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cohort.
     * @param {CohortDeleteArgs} args - Arguments to delete one Cohort.
     * @example
     * // Delete one Cohort
     * const Cohort = await prisma.cohort.delete({
     *   where: {
     *     // ... filter to delete one Cohort
     *   }
     * })
     * 
     */
    delete<T extends CohortDeleteArgs>(args: SelectSubset<T, CohortDeleteArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cohort.
     * @param {CohortUpdateArgs} args - Arguments to update one Cohort.
     * @example
     * // Update one Cohort
     * const cohort = await prisma.cohort.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CohortUpdateArgs>(args: SelectSubset<T, CohortUpdateArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cohorts.
     * @param {CohortDeleteManyArgs} args - Arguments to filter Cohorts to delete.
     * @example
     * // Delete a few Cohorts
     * const { count } = await prisma.cohort.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CohortDeleteManyArgs>(args?: SelectSubset<T, CohortDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cohorts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cohorts
     * const cohort = await prisma.cohort.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CohortUpdateManyArgs>(args: SelectSubset<T, CohortUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cohorts and returns the data updated in the database.
     * @param {CohortUpdateManyAndReturnArgs} args - Arguments to update many Cohorts.
     * @example
     * // Update many Cohorts
     * const cohort = await prisma.cohort.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cohorts and only return the `id`
     * const cohortWithIdOnly = await prisma.cohort.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CohortUpdateManyAndReturnArgs>(args: SelectSubset<T, CohortUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cohort.
     * @param {CohortUpsertArgs} args - Arguments to update or create a Cohort.
     * @example
     * // Update or create a Cohort
     * const cohort = await prisma.cohort.upsert({
     *   create: {
     *     // ... data to create a Cohort
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cohort we want to update
     *   }
     * })
     */
    upsert<T extends CohortUpsertArgs>(args: SelectSubset<T, CohortUpsertArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cohorts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortCountArgs} args - Arguments to filter Cohorts to count.
     * @example
     * // Count the number of Cohorts
     * const count = await prisma.cohort.count({
     *   where: {
     *     // ... the filter for the Cohorts we want to count
     *   }
     * })
    **/
    count<T extends CohortCountArgs>(
      args?: Subset<T, CohortCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CohortCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cohort.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CohortAggregateArgs>(args: Subset<T, CohortAggregateArgs>): Prisma.PrismaPromise<GetCohortAggregateType<T>>

    /**
     * Group by Cohort.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CohortGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CohortGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CohortGroupByArgs['orderBy'] }
        : { orderBy?: CohortGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CohortGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCohortGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cohort model
   */
  readonly fields: CohortFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cohort.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CohortClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    programme<T extends ProgrammeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProgrammeDefaultArgs<ExtArgs>>): Prisma__ProgrammeClient<$Result.GetResult<Prisma.$ProgrammePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    enrolments<T extends Cohort$enrolmentsArgs<ExtArgs> = {}>(args?: Subset<T, Cohort$enrolmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    followupEvents<T extends Cohort$followupEventsArgs<ExtArgs> = {}>(args?: Subset<T, Cohort$followupEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cohort model
   */
  interface CohortFieldRefs {
    readonly id: FieldRef<"Cohort", 'String'>
    readonly programmeId: FieldRef<"Cohort", 'String'>
    readonly name: FieldRef<"Cohort", 'String'>
    readonly startDate: FieldRef<"Cohort", 'DateTime'>
    readonly endDate: FieldRef<"Cohort", 'DateTime'>
    readonly createdAt: FieldRef<"Cohort", 'DateTime'>
    readonly updatedAt: FieldRef<"Cohort", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cohort findUnique
   */
  export type CohortFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter, which Cohort to fetch.
     */
    where: CohortWhereUniqueInput
  }

  /**
   * Cohort findUniqueOrThrow
   */
  export type CohortFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter, which Cohort to fetch.
     */
    where: CohortWhereUniqueInput
  }

  /**
   * Cohort findFirst
   */
  export type CohortFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter, which Cohort to fetch.
     */
    where?: CohortWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cohorts to fetch.
     */
    orderBy?: CohortOrderByWithRelationInput | CohortOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cohorts.
     */
    cursor?: CohortWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cohorts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cohorts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cohorts.
     */
    distinct?: CohortScalarFieldEnum | CohortScalarFieldEnum[]
  }

  /**
   * Cohort findFirstOrThrow
   */
  export type CohortFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter, which Cohort to fetch.
     */
    where?: CohortWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cohorts to fetch.
     */
    orderBy?: CohortOrderByWithRelationInput | CohortOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cohorts.
     */
    cursor?: CohortWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cohorts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cohorts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cohorts.
     */
    distinct?: CohortScalarFieldEnum | CohortScalarFieldEnum[]
  }

  /**
   * Cohort findMany
   */
  export type CohortFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter, which Cohorts to fetch.
     */
    where?: CohortWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cohorts to fetch.
     */
    orderBy?: CohortOrderByWithRelationInput | CohortOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cohorts.
     */
    cursor?: CohortWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cohorts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cohorts.
     */
    skip?: number
    distinct?: CohortScalarFieldEnum | CohortScalarFieldEnum[]
  }

  /**
   * Cohort create
   */
  export type CohortCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * The data needed to create a Cohort.
     */
    data: XOR<CohortCreateInput, CohortUncheckedCreateInput>
  }

  /**
   * Cohort createMany
   */
  export type CohortCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cohorts.
     */
    data: CohortCreateManyInput | CohortCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cohort createManyAndReturn
   */
  export type CohortCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * The data used to create many Cohorts.
     */
    data: CohortCreateManyInput | CohortCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cohort update
   */
  export type CohortUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * The data needed to update a Cohort.
     */
    data: XOR<CohortUpdateInput, CohortUncheckedUpdateInput>
    /**
     * Choose, which Cohort to update.
     */
    where: CohortWhereUniqueInput
  }

  /**
   * Cohort updateMany
   */
  export type CohortUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cohorts.
     */
    data: XOR<CohortUpdateManyMutationInput, CohortUncheckedUpdateManyInput>
    /**
     * Filter which Cohorts to update
     */
    where?: CohortWhereInput
    /**
     * Limit how many Cohorts to update.
     */
    limit?: number
  }

  /**
   * Cohort updateManyAndReturn
   */
  export type CohortUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * The data used to update Cohorts.
     */
    data: XOR<CohortUpdateManyMutationInput, CohortUncheckedUpdateManyInput>
    /**
     * Filter which Cohorts to update
     */
    where?: CohortWhereInput
    /**
     * Limit how many Cohorts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cohort upsert
   */
  export type CohortUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * The filter to search for the Cohort to update in case it exists.
     */
    where: CohortWhereUniqueInput
    /**
     * In case the Cohort found by the `where` argument doesn't exist, create a new Cohort with this data.
     */
    create: XOR<CohortCreateInput, CohortUncheckedCreateInput>
    /**
     * In case the Cohort was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CohortUpdateInput, CohortUncheckedUpdateInput>
  }

  /**
   * Cohort delete
   */
  export type CohortDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
    /**
     * Filter which Cohort to delete.
     */
    where: CohortWhereUniqueInput
  }

  /**
   * Cohort deleteMany
   */
  export type CohortDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cohorts to delete
     */
    where?: CohortWhereInput
    /**
     * Limit how many Cohorts to delete.
     */
    limit?: number
  }

  /**
   * Cohort.enrolments
   */
  export type Cohort$enrolmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    where?: EnrolmentWhereInput
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    cursor?: EnrolmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EnrolmentScalarFieldEnum | EnrolmentScalarFieldEnum[]
  }

  /**
   * Cohort.followupEvents
   */
  export type Cohort$followupEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    where?: FollowupEventWhereInput
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    cursor?: FollowupEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowupEventScalarFieldEnum | FollowupEventScalarFieldEnum[]
  }

  /**
   * Cohort without action
   */
  export type CohortDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cohort
     */
    select?: CohortSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cohort
     */
    omit?: CohortOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CohortInclude<ExtArgs> | null
  }


  /**
   * Model Trainee
   */

  export type AggregateTrainee = {
    _count: TraineeCountAggregateOutputType | null
    _min: TraineeMinAggregateOutputType | null
    _max: TraineeMaxAggregateOutputType | null
  }

  export type TraineeMinAggregateOutputType = {
    id: string | null
    publicId: string | null
    fullName: string | null
    phoneE164: string | null
    email: string | null
    district: string | null
    language: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TraineeMaxAggregateOutputType = {
    id: string | null
    publicId: string | null
    fullName: string | null
    phoneE164: string | null
    email: string | null
    district: string | null
    language: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TraineeCountAggregateOutputType = {
    id: number
    publicId: number
    fullName: number
    phoneE164: number
    email: number
    district: number
    language: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TraineeMinAggregateInputType = {
    id?: true
    publicId?: true
    fullName?: true
    phoneE164?: true
    email?: true
    district?: true
    language?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TraineeMaxAggregateInputType = {
    id?: true
    publicId?: true
    fullName?: true
    phoneE164?: true
    email?: true
    district?: true
    language?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TraineeCountAggregateInputType = {
    id?: true
    publicId?: true
    fullName?: true
    phoneE164?: true
    email?: true
    district?: true
    language?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TraineeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trainee to aggregate.
     */
    where?: TraineeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trainees to fetch.
     */
    orderBy?: TraineeOrderByWithRelationInput | TraineeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TraineeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trainees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trainees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trainees
    **/
    _count?: true | TraineeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TraineeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TraineeMaxAggregateInputType
  }

  export type GetTraineeAggregateType<T extends TraineeAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainee[P]>
      : GetScalarType<T[P], AggregateTrainee[P]>
  }




  export type TraineeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TraineeWhereInput
    orderBy?: TraineeOrderByWithAggregationInput | TraineeOrderByWithAggregationInput[]
    by: TraineeScalarFieldEnum[] | TraineeScalarFieldEnum
    having?: TraineeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TraineeCountAggregateInputType | true
    _min?: TraineeMinAggregateInputType
    _max?: TraineeMaxAggregateInputType
  }

  export type TraineeGroupByOutputType = {
    id: string
    publicId: string
    fullName: string
    phoneE164: string
    email: string | null
    district: string
    language: string
    createdAt: Date
    updatedAt: Date
    _count: TraineeCountAggregateOutputType | null
    _min: TraineeMinAggregateOutputType | null
    _max: TraineeMaxAggregateOutputType | null
  }

  type GetTraineeGroupByPayload<T extends TraineeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TraineeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TraineeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TraineeGroupByOutputType[P]>
            : GetScalarType<T[P], TraineeGroupByOutputType[P]>
        }
      >
    >


  export type TraineeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    publicId?: boolean
    fullName?: boolean
    phoneE164?: boolean
    email?: boolean
    district?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    enrolments?: boolean | Trainee$enrolmentsArgs<ExtArgs>
    followupEvents?: boolean | Trainee$followupEventsArgs<ExtArgs>
    botSessions?: boolean | Trainee$botSessionsArgs<ExtArgs>
    employmentClaims?: boolean | Trainee$employmentClaimsArgs<ExtArgs>
    outcomeEvents?: boolean | Trainee$outcomeEventsArgs<ExtArgs>
    _count?: boolean | TraineeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trainee"]>

  export type TraineeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    publicId?: boolean
    fullName?: boolean
    phoneE164?: boolean
    email?: boolean
    district?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["trainee"]>

  export type TraineeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    publicId?: boolean
    fullName?: boolean
    phoneE164?: boolean
    email?: boolean
    district?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["trainee"]>

  export type TraineeSelectScalar = {
    id?: boolean
    publicId?: boolean
    fullName?: boolean
    phoneE164?: boolean
    email?: boolean
    district?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TraineeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "publicId" | "fullName" | "phoneE164" | "email" | "district" | "language" | "createdAt" | "updatedAt", ExtArgs["result"]["trainee"]>
  export type TraineeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    enrolments?: boolean | Trainee$enrolmentsArgs<ExtArgs>
    followupEvents?: boolean | Trainee$followupEventsArgs<ExtArgs>
    botSessions?: boolean | Trainee$botSessionsArgs<ExtArgs>
    employmentClaims?: boolean | Trainee$employmentClaimsArgs<ExtArgs>
    outcomeEvents?: boolean | Trainee$outcomeEventsArgs<ExtArgs>
    _count?: boolean | TraineeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TraineeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TraineeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TraineePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trainee"
    objects: {
      enrolments: Prisma.$EnrolmentPayload<ExtArgs>[]
      followupEvents: Prisma.$FollowupEventPayload<ExtArgs>[]
      botSessions: Prisma.$BotSessionPayload<ExtArgs>[]
      employmentClaims: Prisma.$EmploymentClaimPayload<ExtArgs>[]
      outcomeEvents: Prisma.$OutcomeEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      publicId: string
      fullName: string
      phoneE164: string
      email: string | null
      district: string
      language: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["trainee"]>
    composites: {}
  }

  type TraineeGetPayload<S extends boolean | null | undefined | TraineeDefaultArgs> = $Result.GetResult<Prisma.$TraineePayload, S>

  type TraineeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TraineeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TraineeCountAggregateInputType | true
    }

  export interface TraineeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trainee'], meta: { name: 'Trainee' } }
    /**
     * Find zero or one Trainee that matches the filter.
     * @param {TraineeFindUniqueArgs} args - Arguments to find a Trainee
     * @example
     * // Get one Trainee
     * const trainee = await prisma.trainee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TraineeFindUniqueArgs>(args: SelectSubset<T, TraineeFindUniqueArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Trainee that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TraineeFindUniqueOrThrowArgs} args - Arguments to find a Trainee
     * @example
     * // Get one Trainee
     * const trainee = await prisma.trainee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TraineeFindUniqueOrThrowArgs>(args: SelectSubset<T, TraineeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trainee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeFindFirstArgs} args - Arguments to find a Trainee
     * @example
     * // Get one Trainee
     * const trainee = await prisma.trainee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TraineeFindFirstArgs>(args?: SelectSubset<T, TraineeFindFirstArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trainee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeFindFirstOrThrowArgs} args - Arguments to find a Trainee
     * @example
     * // Get one Trainee
     * const trainee = await prisma.trainee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TraineeFindFirstOrThrowArgs>(args?: SelectSubset<T, TraineeFindFirstOrThrowArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Trainees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trainees
     * const trainees = await prisma.trainee.findMany()
     * 
     * // Get first 10 Trainees
     * const trainees = await prisma.trainee.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const traineeWithIdOnly = await prisma.trainee.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TraineeFindManyArgs>(args?: SelectSubset<T, TraineeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Trainee.
     * @param {TraineeCreateArgs} args - Arguments to create a Trainee.
     * @example
     * // Create one Trainee
     * const Trainee = await prisma.trainee.create({
     *   data: {
     *     // ... data to create a Trainee
     *   }
     * })
     * 
     */
    create<T extends TraineeCreateArgs>(args: SelectSubset<T, TraineeCreateArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Trainees.
     * @param {TraineeCreateManyArgs} args - Arguments to create many Trainees.
     * @example
     * // Create many Trainees
     * const trainee = await prisma.trainee.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TraineeCreateManyArgs>(args?: SelectSubset<T, TraineeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trainees and returns the data saved in the database.
     * @param {TraineeCreateManyAndReturnArgs} args - Arguments to create many Trainees.
     * @example
     * // Create many Trainees
     * const trainee = await prisma.trainee.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trainees and only return the `id`
     * const traineeWithIdOnly = await prisma.trainee.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TraineeCreateManyAndReturnArgs>(args?: SelectSubset<T, TraineeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Trainee.
     * @param {TraineeDeleteArgs} args - Arguments to delete one Trainee.
     * @example
     * // Delete one Trainee
     * const Trainee = await prisma.trainee.delete({
     *   where: {
     *     // ... filter to delete one Trainee
     *   }
     * })
     * 
     */
    delete<T extends TraineeDeleteArgs>(args: SelectSubset<T, TraineeDeleteArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Trainee.
     * @param {TraineeUpdateArgs} args - Arguments to update one Trainee.
     * @example
     * // Update one Trainee
     * const trainee = await prisma.trainee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TraineeUpdateArgs>(args: SelectSubset<T, TraineeUpdateArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Trainees.
     * @param {TraineeDeleteManyArgs} args - Arguments to filter Trainees to delete.
     * @example
     * // Delete a few Trainees
     * const { count } = await prisma.trainee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TraineeDeleteManyArgs>(args?: SelectSubset<T, TraineeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trainees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trainees
     * const trainee = await prisma.trainee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TraineeUpdateManyArgs>(args: SelectSubset<T, TraineeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trainees and returns the data updated in the database.
     * @param {TraineeUpdateManyAndReturnArgs} args - Arguments to update many Trainees.
     * @example
     * // Update many Trainees
     * const trainee = await prisma.trainee.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Trainees and only return the `id`
     * const traineeWithIdOnly = await prisma.trainee.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TraineeUpdateManyAndReturnArgs>(args: SelectSubset<T, TraineeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Trainee.
     * @param {TraineeUpsertArgs} args - Arguments to update or create a Trainee.
     * @example
     * // Update or create a Trainee
     * const trainee = await prisma.trainee.upsert({
     *   create: {
     *     // ... data to create a Trainee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trainee we want to update
     *   }
     * })
     */
    upsert<T extends TraineeUpsertArgs>(args: SelectSubset<T, TraineeUpsertArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Trainees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeCountArgs} args - Arguments to filter Trainees to count.
     * @example
     * // Count the number of Trainees
     * const count = await prisma.trainee.count({
     *   where: {
     *     // ... the filter for the Trainees we want to count
     *   }
     * })
    **/
    count<T extends TraineeCountArgs>(
      args?: Subset<T, TraineeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TraineeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trainee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TraineeAggregateArgs>(args: Subset<T, TraineeAggregateArgs>): Prisma.PrismaPromise<GetTraineeAggregateType<T>>

    /**
     * Group by Trainee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TraineeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TraineeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TraineeGroupByArgs['orderBy'] }
        : { orderBy?: TraineeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TraineeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTraineeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trainee model
   */
  readonly fields: TraineeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trainee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TraineeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    enrolments<T extends Trainee$enrolmentsArgs<ExtArgs> = {}>(args?: Subset<T, Trainee$enrolmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    followupEvents<T extends Trainee$followupEventsArgs<ExtArgs> = {}>(args?: Subset<T, Trainee$followupEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    botSessions<T extends Trainee$botSessionsArgs<ExtArgs> = {}>(args?: Subset<T, Trainee$botSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    employmentClaims<T extends Trainee$employmentClaimsArgs<ExtArgs> = {}>(args?: Subset<T, Trainee$employmentClaimsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outcomeEvents<T extends Trainee$outcomeEventsArgs<ExtArgs> = {}>(args?: Subset<T, Trainee$outcomeEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trainee model
   */
  interface TraineeFieldRefs {
    readonly id: FieldRef<"Trainee", 'String'>
    readonly publicId: FieldRef<"Trainee", 'String'>
    readonly fullName: FieldRef<"Trainee", 'String'>
    readonly phoneE164: FieldRef<"Trainee", 'String'>
    readonly email: FieldRef<"Trainee", 'String'>
    readonly district: FieldRef<"Trainee", 'String'>
    readonly language: FieldRef<"Trainee", 'String'>
    readonly createdAt: FieldRef<"Trainee", 'DateTime'>
    readonly updatedAt: FieldRef<"Trainee", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Trainee findUnique
   */
  export type TraineeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter, which Trainee to fetch.
     */
    where: TraineeWhereUniqueInput
  }

  /**
   * Trainee findUniqueOrThrow
   */
  export type TraineeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter, which Trainee to fetch.
     */
    where: TraineeWhereUniqueInput
  }

  /**
   * Trainee findFirst
   */
  export type TraineeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter, which Trainee to fetch.
     */
    where?: TraineeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trainees to fetch.
     */
    orderBy?: TraineeOrderByWithRelationInput | TraineeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trainees.
     */
    cursor?: TraineeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trainees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trainees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trainees.
     */
    distinct?: TraineeScalarFieldEnum | TraineeScalarFieldEnum[]
  }

  /**
   * Trainee findFirstOrThrow
   */
  export type TraineeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter, which Trainee to fetch.
     */
    where?: TraineeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trainees to fetch.
     */
    orderBy?: TraineeOrderByWithRelationInput | TraineeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trainees.
     */
    cursor?: TraineeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trainees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trainees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trainees.
     */
    distinct?: TraineeScalarFieldEnum | TraineeScalarFieldEnum[]
  }

  /**
   * Trainee findMany
   */
  export type TraineeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter, which Trainees to fetch.
     */
    where?: TraineeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trainees to fetch.
     */
    orderBy?: TraineeOrderByWithRelationInput | TraineeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trainees.
     */
    cursor?: TraineeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trainees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trainees.
     */
    skip?: number
    distinct?: TraineeScalarFieldEnum | TraineeScalarFieldEnum[]
  }

  /**
   * Trainee create
   */
  export type TraineeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * The data needed to create a Trainee.
     */
    data: XOR<TraineeCreateInput, TraineeUncheckedCreateInput>
  }

  /**
   * Trainee createMany
   */
  export type TraineeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trainees.
     */
    data: TraineeCreateManyInput | TraineeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trainee createManyAndReturn
   */
  export type TraineeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * The data used to create many Trainees.
     */
    data: TraineeCreateManyInput | TraineeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trainee update
   */
  export type TraineeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * The data needed to update a Trainee.
     */
    data: XOR<TraineeUpdateInput, TraineeUncheckedUpdateInput>
    /**
     * Choose, which Trainee to update.
     */
    where: TraineeWhereUniqueInput
  }

  /**
   * Trainee updateMany
   */
  export type TraineeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trainees.
     */
    data: XOR<TraineeUpdateManyMutationInput, TraineeUncheckedUpdateManyInput>
    /**
     * Filter which Trainees to update
     */
    where?: TraineeWhereInput
    /**
     * Limit how many Trainees to update.
     */
    limit?: number
  }

  /**
   * Trainee updateManyAndReturn
   */
  export type TraineeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * The data used to update Trainees.
     */
    data: XOR<TraineeUpdateManyMutationInput, TraineeUncheckedUpdateManyInput>
    /**
     * Filter which Trainees to update
     */
    where?: TraineeWhereInput
    /**
     * Limit how many Trainees to update.
     */
    limit?: number
  }

  /**
   * Trainee upsert
   */
  export type TraineeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * The filter to search for the Trainee to update in case it exists.
     */
    where: TraineeWhereUniqueInput
    /**
     * In case the Trainee found by the `where` argument doesn't exist, create a new Trainee with this data.
     */
    create: XOR<TraineeCreateInput, TraineeUncheckedCreateInput>
    /**
     * In case the Trainee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TraineeUpdateInput, TraineeUncheckedUpdateInput>
  }

  /**
   * Trainee delete
   */
  export type TraineeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
    /**
     * Filter which Trainee to delete.
     */
    where: TraineeWhereUniqueInput
  }

  /**
   * Trainee deleteMany
   */
  export type TraineeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trainees to delete
     */
    where?: TraineeWhereInput
    /**
     * Limit how many Trainees to delete.
     */
    limit?: number
  }

  /**
   * Trainee.enrolments
   */
  export type Trainee$enrolmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    where?: EnrolmentWhereInput
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    cursor?: EnrolmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EnrolmentScalarFieldEnum | EnrolmentScalarFieldEnum[]
  }

  /**
   * Trainee.followupEvents
   */
  export type Trainee$followupEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    where?: FollowupEventWhereInput
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    cursor?: FollowupEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowupEventScalarFieldEnum | FollowupEventScalarFieldEnum[]
  }

  /**
   * Trainee.botSessions
   */
  export type Trainee$botSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    where?: BotSessionWhereInput
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    cursor?: BotSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BotSessionScalarFieldEnum | BotSessionScalarFieldEnum[]
  }

  /**
   * Trainee.employmentClaims
   */
  export type Trainee$employmentClaimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    where?: EmploymentClaimWhereInput
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    cursor?: EmploymentClaimWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmploymentClaimScalarFieldEnum | EmploymentClaimScalarFieldEnum[]
  }

  /**
   * Trainee.outcomeEvents
   */
  export type Trainee$outcomeEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    where?: OutcomeEventWhereInput
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    cursor?: OutcomeEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutcomeEventScalarFieldEnum | OutcomeEventScalarFieldEnum[]
  }

  /**
   * Trainee without action
   */
  export type TraineeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trainee
     */
    select?: TraineeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trainee
     */
    omit?: TraineeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TraineeInclude<ExtArgs> | null
  }


  /**
   * Model Enrolment
   */

  export type AggregateEnrolment = {
    _count: EnrolmentCountAggregateOutputType | null
    _min: EnrolmentMinAggregateOutputType | null
    _max: EnrolmentMaxAggregateOutputType | null
  }

  export type EnrolmentMinAggregateOutputType = {
    id: string | null
    traineeId: string | null
    cohortId: string | null
    certificationDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EnrolmentMaxAggregateOutputType = {
    id: string | null
    traineeId: string | null
    cohortId: string | null
    certificationDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EnrolmentCountAggregateOutputType = {
    id: number
    traineeId: number
    cohortId: number
    certificationDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EnrolmentMinAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    certificationDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EnrolmentMaxAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    certificationDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EnrolmentCountAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    certificationDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EnrolmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Enrolment to aggregate.
     */
    where?: EnrolmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Enrolments to fetch.
     */
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EnrolmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Enrolments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Enrolments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Enrolments
    **/
    _count?: true | EnrolmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EnrolmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EnrolmentMaxAggregateInputType
  }

  export type GetEnrolmentAggregateType<T extends EnrolmentAggregateArgs> = {
        [P in keyof T & keyof AggregateEnrolment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEnrolment[P]>
      : GetScalarType<T[P], AggregateEnrolment[P]>
  }




  export type EnrolmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EnrolmentWhereInput
    orderBy?: EnrolmentOrderByWithAggregationInput | EnrolmentOrderByWithAggregationInput[]
    by: EnrolmentScalarFieldEnum[] | EnrolmentScalarFieldEnum
    having?: EnrolmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EnrolmentCountAggregateInputType | true
    _min?: EnrolmentMinAggregateInputType
    _max?: EnrolmentMaxAggregateInputType
  }

  export type EnrolmentGroupByOutputType = {
    id: string
    traineeId: string
    cohortId: string
    certificationDate: Date
    createdAt: Date
    updatedAt: Date
    _count: EnrolmentCountAggregateOutputType | null
    _min: EnrolmentMinAggregateOutputType | null
    _max: EnrolmentMaxAggregateOutputType | null
  }

  type GetEnrolmentGroupByPayload<T extends EnrolmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EnrolmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EnrolmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EnrolmentGroupByOutputType[P]>
            : GetScalarType<T[P], EnrolmentGroupByOutputType[P]>
        }
      >
    >


  export type EnrolmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    certificationDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["enrolment"]>

  export type EnrolmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    certificationDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["enrolment"]>

  export type EnrolmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    certificationDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["enrolment"]>

  export type EnrolmentSelectScalar = {
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    certificationDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EnrolmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traineeId" | "cohortId" | "certificationDate" | "createdAt" | "updatedAt", ExtArgs["result"]["enrolment"]>
  export type EnrolmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }
  export type EnrolmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }
  export type EnrolmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }

  export type $EnrolmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Enrolment"
    objects: {
      trainee: Prisma.$TraineePayload<ExtArgs>
      cohort: Prisma.$CohortPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traineeId: string
      cohortId: string
      certificationDate: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["enrolment"]>
    composites: {}
  }

  type EnrolmentGetPayload<S extends boolean | null | undefined | EnrolmentDefaultArgs> = $Result.GetResult<Prisma.$EnrolmentPayload, S>

  type EnrolmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EnrolmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EnrolmentCountAggregateInputType | true
    }

  export interface EnrolmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Enrolment'], meta: { name: 'Enrolment' } }
    /**
     * Find zero or one Enrolment that matches the filter.
     * @param {EnrolmentFindUniqueArgs} args - Arguments to find a Enrolment
     * @example
     * // Get one Enrolment
     * const enrolment = await prisma.enrolment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EnrolmentFindUniqueArgs>(args: SelectSubset<T, EnrolmentFindUniqueArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Enrolment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EnrolmentFindUniqueOrThrowArgs} args - Arguments to find a Enrolment
     * @example
     * // Get one Enrolment
     * const enrolment = await prisma.enrolment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EnrolmentFindUniqueOrThrowArgs>(args: SelectSubset<T, EnrolmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Enrolment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentFindFirstArgs} args - Arguments to find a Enrolment
     * @example
     * // Get one Enrolment
     * const enrolment = await prisma.enrolment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EnrolmentFindFirstArgs>(args?: SelectSubset<T, EnrolmentFindFirstArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Enrolment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentFindFirstOrThrowArgs} args - Arguments to find a Enrolment
     * @example
     * // Get one Enrolment
     * const enrolment = await prisma.enrolment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EnrolmentFindFirstOrThrowArgs>(args?: SelectSubset<T, EnrolmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Enrolments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Enrolments
     * const enrolments = await prisma.enrolment.findMany()
     * 
     * // Get first 10 Enrolments
     * const enrolments = await prisma.enrolment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const enrolmentWithIdOnly = await prisma.enrolment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EnrolmentFindManyArgs>(args?: SelectSubset<T, EnrolmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Enrolment.
     * @param {EnrolmentCreateArgs} args - Arguments to create a Enrolment.
     * @example
     * // Create one Enrolment
     * const Enrolment = await prisma.enrolment.create({
     *   data: {
     *     // ... data to create a Enrolment
     *   }
     * })
     * 
     */
    create<T extends EnrolmentCreateArgs>(args: SelectSubset<T, EnrolmentCreateArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Enrolments.
     * @param {EnrolmentCreateManyArgs} args - Arguments to create many Enrolments.
     * @example
     * // Create many Enrolments
     * const enrolment = await prisma.enrolment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EnrolmentCreateManyArgs>(args?: SelectSubset<T, EnrolmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Enrolments and returns the data saved in the database.
     * @param {EnrolmentCreateManyAndReturnArgs} args - Arguments to create many Enrolments.
     * @example
     * // Create many Enrolments
     * const enrolment = await prisma.enrolment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Enrolments and only return the `id`
     * const enrolmentWithIdOnly = await prisma.enrolment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EnrolmentCreateManyAndReturnArgs>(args?: SelectSubset<T, EnrolmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Enrolment.
     * @param {EnrolmentDeleteArgs} args - Arguments to delete one Enrolment.
     * @example
     * // Delete one Enrolment
     * const Enrolment = await prisma.enrolment.delete({
     *   where: {
     *     // ... filter to delete one Enrolment
     *   }
     * })
     * 
     */
    delete<T extends EnrolmentDeleteArgs>(args: SelectSubset<T, EnrolmentDeleteArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Enrolment.
     * @param {EnrolmentUpdateArgs} args - Arguments to update one Enrolment.
     * @example
     * // Update one Enrolment
     * const enrolment = await prisma.enrolment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EnrolmentUpdateArgs>(args: SelectSubset<T, EnrolmentUpdateArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Enrolments.
     * @param {EnrolmentDeleteManyArgs} args - Arguments to filter Enrolments to delete.
     * @example
     * // Delete a few Enrolments
     * const { count } = await prisma.enrolment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EnrolmentDeleteManyArgs>(args?: SelectSubset<T, EnrolmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Enrolments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Enrolments
     * const enrolment = await prisma.enrolment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EnrolmentUpdateManyArgs>(args: SelectSubset<T, EnrolmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Enrolments and returns the data updated in the database.
     * @param {EnrolmentUpdateManyAndReturnArgs} args - Arguments to update many Enrolments.
     * @example
     * // Update many Enrolments
     * const enrolment = await prisma.enrolment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Enrolments and only return the `id`
     * const enrolmentWithIdOnly = await prisma.enrolment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EnrolmentUpdateManyAndReturnArgs>(args: SelectSubset<T, EnrolmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Enrolment.
     * @param {EnrolmentUpsertArgs} args - Arguments to update or create a Enrolment.
     * @example
     * // Update or create a Enrolment
     * const enrolment = await prisma.enrolment.upsert({
     *   create: {
     *     // ... data to create a Enrolment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Enrolment we want to update
     *   }
     * })
     */
    upsert<T extends EnrolmentUpsertArgs>(args: SelectSubset<T, EnrolmentUpsertArgs<ExtArgs>>): Prisma__EnrolmentClient<$Result.GetResult<Prisma.$EnrolmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Enrolments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentCountArgs} args - Arguments to filter Enrolments to count.
     * @example
     * // Count the number of Enrolments
     * const count = await prisma.enrolment.count({
     *   where: {
     *     // ... the filter for the Enrolments we want to count
     *   }
     * })
    **/
    count<T extends EnrolmentCountArgs>(
      args?: Subset<T, EnrolmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EnrolmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Enrolment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EnrolmentAggregateArgs>(args: Subset<T, EnrolmentAggregateArgs>): Prisma.PrismaPromise<GetEnrolmentAggregateType<T>>

    /**
     * Group by Enrolment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnrolmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EnrolmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EnrolmentGroupByArgs['orderBy'] }
        : { orderBy?: EnrolmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EnrolmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEnrolmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Enrolment model
   */
  readonly fields: EnrolmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Enrolment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EnrolmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trainee<T extends TraineeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TraineeDefaultArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cohort<T extends CohortDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CohortDefaultArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Enrolment model
   */
  interface EnrolmentFieldRefs {
    readonly id: FieldRef<"Enrolment", 'String'>
    readonly traineeId: FieldRef<"Enrolment", 'String'>
    readonly cohortId: FieldRef<"Enrolment", 'String'>
    readonly certificationDate: FieldRef<"Enrolment", 'DateTime'>
    readonly createdAt: FieldRef<"Enrolment", 'DateTime'>
    readonly updatedAt: FieldRef<"Enrolment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Enrolment findUnique
   */
  export type EnrolmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter, which Enrolment to fetch.
     */
    where: EnrolmentWhereUniqueInput
  }

  /**
   * Enrolment findUniqueOrThrow
   */
  export type EnrolmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter, which Enrolment to fetch.
     */
    where: EnrolmentWhereUniqueInput
  }

  /**
   * Enrolment findFirst
   */
  export type EnrolmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter, which Enrolment to fetch.
     */
    where?: EnrolmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Enrolments to fetch.
     */
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Enrolments.
     */
    cursor?: EnrolmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Enrolments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Enrolments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Enrolments.
     */
    distinct?: EnrolmentScalarFieldEnum | EnrolmentScalarFieldEnum[]
  }

  /**
   * Enrolment findFirstOrThrow
   */
  export type EnrolmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter, which Enrolment to fetch.
     */
    where?: EnrolmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Enrolments to fetch.
     */
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Enrolments.
     */
    cursor?: EnrolmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Enrolments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Enrolments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Enrolments.
     */
    distinct?: EnrolmentScalarFieldEnum | EnrolmentScalarFieldEnum[]
  }

  /**
   * Enrolment findMany
   */
  export type EnrolmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter, which Enrolments to fetch.
     */
    where?: EnrolmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Enrolments to fetch.
     */
    orderBy?: EnrolmentOrderByWithRelationInput | EnrolmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Enrolments.
     */
    cursor?: EnrolmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Enrolments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Enrolments.
     */
    skip?: number
    distinct?: EnrolmentScalarFieldEnum | EnrolmentScalarFieldEnum[]
  }

  /**
   * Enrolment create
   */
  export type EnrolmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Enrolment.
     */
    data: XOR<EnrolmentCreateInput, EnrolmentUncheckedCreateInput>
  }

  /**
   * Enrolment createMany
   */
  export type EnrolmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Enrolments.
     */
    data: EnrolmentCreateManyInput | EnrolmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Enrolment createManyAndReturn
   */
  export type EnrolmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * The data used to create many Enrolments.
     */
    data: EnrolmentCreateManyInput | EnrolmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Enrolment update
   */
  export type EnrolmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Enrolment.
     */
    data: XOR<EnrolmentUpdateInput, EnrolmentUncheckedUpdateInput>
    /**
     * Choose, which Enrolment to update.
     */
    where: EnrolmentWhereUniqueInput
  }

  /**
   * Enrolment updateMany
   */
  export type EnrolmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Enrolments.
     */
    data: XOR<EnrolmentUpdateManyMutationInput, EnrolmentUncheckedUpdateManyInput>
    /**
     * Filter which Enrolments to update
     */
    where?: EnrolmentWhereInput
    /**
     * Limit how many Enrolments to update.
     */
    limit?: number
  }

  /**
   * Enrolment updateManyAndReturn
   */
  export type EnrolmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * The data used to update Enrolments.
     */
    data: XOR<EnrolmentUpdateManyMutationInput, EnrolmentUncheckedUpdateManyInput>
    /**
     * Filter which Enrolments to update
     */
    where?: EnrolmentWhereInput
    /**
     * Limit how many Enrolments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Enrolment upsert
   */
  export type EnrolmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Enrolment to update in case it exists.
     */
    where: EnrolmentWhereUniqueInput
    /**
     * In case the Enrolment found by the `where` argument doesn't exist, create a new Enrolment with this data.
     */
    create: XOR<EnrolmentCreateInput, EnrolmentUncheckedCreateInput>
    /**
     * In case the Enrolment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EnrolmentUpdateInput, EnrolmentUncheckedUpdateInput>
  }

  /**
   * Enrolment delete
   */
  export type EnrolmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
    /**
     * Filter which Enrolment to delete.
     */
    where: EnrolmentWhereUniqueInput
  }

  /**
   * Enrolment deleteMany
   */
  export type EnrolmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Enrolments to delete
     */
    where?: EnrolmentWhereInput
    /**
     * Limit how many Enrolments to delete.
     */
    limit?: number
  }

  /**
   * Enrolment without action
   */
  export type EnrolmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Enrolment
     */
    select?: EnrolmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Enrolment
     */
    omit?: EnrolmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnrolmentInclude<ExtArgs> | null
  }


  /**
   * Model FollowupEvent
   */

  export type AggregateFollowupEvent = {
    _count: FollowupEventCountAggregateOutputType | null
    _avg: FollowupEventAvgAggregateOutputType | null
    _sum: FollowupEventSumAggregateOutputType | null
    _min: FollowupEventMinAggregateOutputType | null
    _max: FollowupEventMaxAggregateOutputType | null
  }

  export type FollowupEventAvgAggregateOutputType = {
    checkpointDays: number | null
  }

  export type FollowupEventSumAggregateOutputType = {
    checkpointDays: number | null
  }

  export type FollowupEventMinAggregateOutputType = {
    id: string | null
    traineeId: string | null
    cohortId: string | null
    checkpointDays: number | null
    status: $Enums.FollowupStatus | null
    channel: $Enums.Channel | null
    sentAt: Date | null
    respondedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FollowupEventMaxAggregateOutputType = {
    id: string | null
    traineeId: string | null
    cohortId: string | null
    checkpointDays: number | null
    status: $Enums.FollowupStatus | null
    channel: $Enums.Channel | null
    sentAt: Date | null
    respondedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FollowupEventCountAggregateOutputType = {
    id: number
    traineeId: number
    cohortId: number
    checkpointDays: number
    status: number
    channel: number
    sentAt: number
    respondedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FollowupEventAvgAggregateInputType = {
    checkpointDays?: true
  }

  export type FollowupEventSumAggregateInputType = {
    checkpointDays?: true
  }

  export type FollowupEventMinAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    checkpointDays?: true
    status?: true
    channel?: true
    sentAt?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FollowupEventMaxAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    checkpointDays?: true
    status?: true
    channel?: true
    sentAt?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FollowupEventCountAggregateInputType = {
    id?: true
    traineeId?: true
    cohortId?: true
    checkpointDays?: true
    status?: true
    channel?: true
    sentAt?: true
    respondedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FollowupEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowupEvent to aggregate.
     */
    where?: FollowupEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowupEvents to fetch.
     */
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FollowupEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowupEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowupEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FollowupEvents
    **/
    _count?: true | FollowupEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FollowupEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FollowupEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FollowupEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FollowupEventMaxAggregateInputType
  }

  export type GetFollowupEventAggregateType<T extends FollowupEventAggregateArgs> = {
        [P in keyof T & keyof AggregateFollowupEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFollowupEvent[P]>
      : GetScalarType<T[P], AggregateFollowupEvent[P]>
  }




  export type FollowupEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowupEventWhereInput
    orderBy?: FollowupEventOrderByWithAggregationInput | FollowupEventOrderByWithAggregationInput[]
    by: FollowupEventScalarFieldEnum[] | FollowupEventScalarFieldEnum
    having?: FollowupEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FollowupEventCountAggregateInputType | true
    _avg?: FollowupEventAvgAggregateInputType
    _sum?: FollowupEventSumAggregateInputType
    _min?: FollowupEventMinAggregateInputType
    _max?: FollowupEventMaxAggregateInputType
  }

  export type FollowupEventGroupByOutputType = {
    id: string
    traineeId: string
    cohortId: string
    checkpointDays: number
    status: $Enums.FollowupStatus
    channel: $Enums.Channel
    sentAt: Date | null
    respondedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: FollowupEventCountAggregateOutputType | null
    _avg: FollowupEventAvgAggregateOutputType | null
    _sum: FollowupEventSumAggregateOutputType | null
    _min: FollowupEventMinAggregateOutputType | null
    _max: FollowupEventMaxAggregateOutputType | null
  }

  type GetFollowupEventGroupByPayload<T extends FollowupEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FollowupEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FollowupEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FollowupEventGroupByOutputType[P]>
            : GetScalarType<T[P], FollowupEventGroupByOutputType[P]>
        }
      >
    >


  export type FollowupEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    checkpointDays?: boolean
    status?: boolean
    channel?: boolean
    sentAt?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
    botSessions?: boolean | FollowupEvent$botSessionsArgs<ExtArgs>
    employmentClaims?: boolean | FollowupEvent$employmentClaimsArgs<ExtArgs>
    _count?: boolean | FollowupEventCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followupEvent"]>

  export type FollowupEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    checkpointDays?: boolean
    status?: boolean
    channel?: boolean
    sentAt?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followupEvent"]>

  export type FollowupEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    checkpointDays?: boolean
    status?: boolean
    channel?: boolean
    sentAt?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followupEvent"]>

  export type FollowupEventSelectScalar = {
    id?: boolean
    traineeId?: boolean
    cohortId?: boolean
    checkpointDays?: boolean
    status?: boolean
    channel?: boolean
    sentAt?: boolean
    respondedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FollowupEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traineeId" | "cohortId" | "checkpointDays" | "status" | "channel" | "sentAt" | "respondedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["followupEvent"]>
  export type FollowupEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
    botSessions?: boolean | FollowupEvent$botSessionsArgs<ExtArgs>
    employmentClaims?: boolean | FollowupEvent$employmentClaimsArgs<ExtArgs>
    _count?: boolean | FollowupEventCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FollowupEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }
  export type FollowupEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    cohort?: boolean | CohortDefaultArgs<ExtArgs>
  }

  export type $FollowupEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FollowupEvent"
    objects: {
      trainee: Prisma.$TraineePayload<ExtArgs>
      cohort: Prisma.$CohortPayload<ExtArgs>
      botSessions: Prisma.$BotSessionPayload<ExtArgs>[]
      employmentClaims: Prisma.$EmploymentClaimPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traineeId: string
      cohortId: string
      checkpointDays: number
      status: $Enums.FollowupStatus
      channel: $Enums.Channel
      sentAt: Date | null
      respondedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["followupEvent"]>
    composites: {}
  }

  type FollowupEventGetPayload<S extends boolean | null | undefined | FollowupEventDefaultArgs> = $Result.GetResult<Prisma.$FollowupEventPayload, S>

  type FollowupEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FollowupEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FollowupEventCountAggregateInputType | true
    }

  export interface FollowupEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FollowupEvent'], meta: { name: 'FollowupEvent' } }
    /**
     * Find zero or one FollowupEvent that matches the filter.
     * @param {FollowupEventFindUniqueArgs} args - Arguments to find a FollowupEvent
     * @example
     * // Get one FollowupEvent
     * const followupEvent = await prisma.followupEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FollowupEventFindUniqueArgs>(args: SelectSubset<T, FollowupEventFindUniqueArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FollowupEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FollowupEventFindUniqueOrThrowArgs} args - Arguments to find a FollowupEvent
     * @example
     * // Get one FollowupEvent
     * const followupEvent = await prisma.followupEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FollowupEventFindUniqueOrThrowArgs>(args: SelectSubset<T, FollowupEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FollowupEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventFindFirstArgs} args - Arguments to find a FollowupEvent
     * @example
     * // Get one FollowupEvent
     * const followupEvent = await prisma.followupEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FollowupEventFindFirstArgs>(args?: SelectSubset<T, FollowupEventFindFirstArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FollowupEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventFindFirstOrThrowArgs} args - Arguments to find a FollowupEvent
     * @example
     * // Get one FollowupEvent
     * const followupEvent = await prisma.followupEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FollowupEventFindFirstOrThrowArgs>(args?: SelectSubset<T, FollowupEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FollowupEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FollowupEvents
     * const followupEvents = await prisma.followupEvent.findMany()
     * 
     * // Get first 10 FollowupEvents
     * const followupEvents = await prisma.followupEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const followupEventWithIdOnly = await prisma.followupEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FollowupEventFindManyArgs>(args?: SelectSubset<T, FollowupEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FollowupEvent.
     * @param {FollowupEventCreateArgs} args - Arguments to create a FollowupEvent.
     * @example
     * // Create one FollowupEvent
     * const FollowupEvent = await prisma.followupEvent.create({
     *   data: {
     *     // ... data to create a FollowupEvent
     *   }
     * })
     * 
     */
    create<T extends FollowupEventCreateArgs>(args: SelectSubset<T, FollowupEventCreateArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FollowupEvents.
     * @param {FollowupEventCreateManyArgs} args - Arguments to create many FollowupEvents.
     * @example
     * // Create many FollowupEvents
     * const followupEvent = await prisma.followupEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FollowupEventCreateManyArgs>(args?: SelectSubset<T, FollowupEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FollowupEvents and returns the data saved in the database.
     * @param {FollowupEventCreateManyAndReturnArgs} args - Arguments to create many FollowupEvents.
     * @example
     * // Create many FollowupEvents
     * const followupEvent = await prisma.followupEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FollowupEvents and only return the `id`
     * const followupEventWithIdOnly = await prisma.followupEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FollowupEventCreateManyAndReturnArgs>(args?: SelectSubset<T, FollowupEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FollowupEvent.
     * @param {FollowupEventDeleteArgs} args - Arguments to delete one FollowupEvent.
     * @example
     * // Delete one FollowupEvent
     * const FollowupEvent = await prisma.followupEvent.delete({
     *   where: {
     *     // ... filter to delete one FollowupEvent
     *   }
     * })
     * 
     */
    delete<T extends FollowupEventDeleteArgs>(args: SelectSubset<T, FollowupEventDeleteArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FollowupEvent.
     * @param {FollowupEventUpdateArgs} args - Arguments to update one FollowupEvent.
     * @example
     * // Update one FollowupEvent
     * const followupEvent = await prisma.followupEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FollowupEventUpdateArgs>(args: SelectSubset<T, FollowupEventUpdateArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FollowupEvents.
     * @param {FollowupEventDeleteManyArgs} args - Arguments to filter FollowupEvents to delete.
     * @example
     * // Delete a few FollowupEvents
     * const { count } = await prisma.followupEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FollowupEventDeleteManyArgs>(args?: SelectSubset<T, FollowupEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FollowupEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FollowupEvents
     * const followupEvent = await prisma.followupEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FollowupEventUpdateManyArgs>(args: SelectSubset<T, FollowupEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FollowupEvents and returns the data updated in the database.
     * @param {FollowupEventUpdateManyAndReturnArgs} args - Arguments to update many FollowupEvents.
     * @example
     * // Update many FollowupEvents
     * const followupEvent = await prisma.followupEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FollowupEvents and only return the `id`
     * const followupEventWithIdOnly = await prisma.followupEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FollowupEventUpdateManyAndReturnArgs>(args: SelectSubset<T, FollowupEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FollowupEvent.
     * @param {FollowupEventUpsertArgs} args - Arguments to update or create a FollowupEvent.
     * @example
     * // Update or create a FollowupEvent
     * const followupEvent = await prisma.followupEvent.upsert({
     *   create: {
     *     // ... data to create a FollowupEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FollowupEvent we want to update
     *   }
     * })
     */
    upsert<T extends FollowupEventUpsertArgs>(args: SelectSubset<T, FollowupEventUpsertArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FollowupEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventCountArgs} args - Arguments to filter FollowupEvents to count.
     * @example
     * // Count the number of FollowupEvents
     * const count = await prisma.followupEvent.count({
     *   where: {
     *     // ... the filter for the FollowupEvents we want to count
     *   }
     * })
    **/
    count<T extends FollowupEventCountArgs>(
      args?: Subset<T, FollowupEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FollowupEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FollowupEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FollowupEventAggregateArgs>(args: Subset<T, FollowupEventAggregateArgs>): Prisma.PrismaPromise<GetFollowupEventAggregateType<T>>

    /**
     * Group by FollowupEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowupEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FollowupEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FollowupEventGroupByArgs['orderBy'] }
        : { orderBy?: FollowupEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FollowupEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFollowupEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FollowupEvent model
   */
  readonly fields: FollowupEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FollowupEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FollowupEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trainee<T extends TraineeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TraineeDefaultArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cohort<T extends CohortDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CohortDefaultArgs<ExtArgs>>): Prisma__CohortClient<$Result.GetResult<Prisma.$CohortPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    botSessions<T extends FollowupEvent$botSessionsArgs<ExtArgs> = {}>(args?: Subset<T, FollowupEvent$botSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    employmentClaims<T extends FollowupEvent$employmentClaimsArgs<ExtArgs> = {}>(args?: Subset<T, FollowupEvent$employmentClaimsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FollowupEvent model
   */
  interface FollowupEventFieldRefs {
    readonly id: FieldRef<"FollowupEvent", 'String'>
    readonly traineeId: FieldRef<"FollowupEvent", 'String'>
    readonly cohortId: FieldRef<"FollowupEvent", 'String'>
    readonly checkpointDays: FieldRef<"FollowupEvent", 'Int'>
    readonly status: FieldRef<"FollowupEvent", 'FollowupStatus'>
    readonly channel: FieldRef<"FollowupEvent", 'Channel'>
    readonly sentAt: FieldRef<"FollowupEvent", 'DateTime'>
    readonly respondedAt: FieldRef<"FollowupEvent", 'DateTime'>
    readonly createdAt: FieldRef<"FollowupEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"FollowupEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FollowupEvent findUnique
   */
  export type FollowupEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter, which FollowupEvent to fetch.
     */
    where: FollowupEventWhereUniqueInput
  }

  /**
   * FollowupEvent findUniqueOrThrow
   */
  export type FollowupEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter, which FollowupEvent to fetch.
     */
    where: FollowupEventWhereUniqueInput
  }

  /**
   * FollowupEvent findFirst
   */
  export type FollowupEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter, which FollowupEvent to fetch.
     */
    where?: FollowupEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowupEvents to fetch.
     */
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowupEvents.
     */
    cursor?: FollowupEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowupEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowupEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowupEvents.
     */
    distinct?: FollowupEventScalarFieldEnum | FollowupEventScalarFieldEnum[]
  }

  /**
   * FollowupEvent findFirstOrThrow
   */
  export type FollowupEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter, which FollowupEvent to fetch.
     */
    where?: FollowupEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowupEvents to fetch.
     */
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowupEvents.
     */
    cursor?: FollowupEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowupEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowupEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowupEvents.
     */
    distinct?: FollowupEventScalarFieldEnum | FollowupEventScalarFieldEnum[]
  }

  /**
   * FollowupEvent findMany
   */
  export type FollowupEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter, which FollowupEvents to fetch.
     */
    where?: FollowupEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowupEvents to fetch.
     */
    orderBy?: FollowupEventOrderByWithRelationInput | FollowupEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FollowupEvents.
     */
    cursor?: FollowupEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowupEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowupEvents.
     */
    skip?: number
    distinct?: FollowupEventScalarFieldEnum | FollowupEventScalarFieldEnum[]
  }

  /**
   * FollowupEvent create
   */
  export type FollowupEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * The data needed to create a FollowupEvent.
     */
    data: XOR<FollowupEventCreateInput, FollowupEventUncheckedCreateInput>
  }

  /**
   * FollowupEvent createMany
   */
  export type FollowupEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FollowupEvents.
     */
    data: FollowupEventCreateManyInput | FollowupEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FollowupEvent createManyAndReturn
   */
  export type FollowupEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * The data used to create many FollowupEvents.
     */
    data: FollowupEventCreateManyInput | FollowupEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FollowupEvent update
   */
  export type FollowupEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * The data needed to update a FollowupEvent.
     */
    data: XOR<FollowupEventUpdateInput, FollowupEventUncheckedUpdateInput>
    /**
     * Choose, which FollowupEvent to update.
     */
    where: FollowupEventWhereUniqueInput
  }

  /**
   * FollowupEvent updateMany
   */
  export type FollowupEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FollowupEvents.
     */
    data: XOR<FollowupEventUpdateManyMutationInput, FollowupEventUncheckedUpdateManyInput>
    /**
     * Filter which FollowupEvents to update
     */
    where?: FollowupEventWhereInput
    /**
     * Limit how many FollowupEvents to update.
     */
    limit?: number
  }

  /**
   * FollowupEvent updateManyAndReturn
   */
  export type FollowupEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * The data used to update FollowupEvents.
     */
    data: XOR<FollowupEventUpdateManyMutationInput, FollowupEventUncheckedUpdateManyInput>
    /**
     * Filter which FollowupEvents to update
     */
    where?: FollowupEventWhereInput
    /**
     * Limit how many FollowupEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FollowupEvent upsert
   */
  export type FollowupEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * The filter to search for the FollowupEvent to update in case it exists.
     */
    where: FollowupEventWhereUniqueInput
    /**
     * In case the FollowupEvent found by the `where` argument doesn't exist, create a new FollowupEvent with this data.
     */
    create: XOR<FollowupEventCreateInput, FollowupEventUncheckedCreateInput>
    /**
     * In case the FollowupEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FollowupEventUpdateInput, FollowupEventUncheckedUpdateInput>
  }

  /**
   * FollowupEvent delete
   */
  export type FollowupEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
    /**
     * Filter which FollowupEvent to delete.
     */
    where: FollowupEventWhereUniqueInput
  }

  /**
   * FollowupEvent deleteMany
   */
  export type FollowupEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowupEvents to delete
     */
    where?: FollowupEventWhereInput
    /**
     * Limit how many FollowupEvents to delete.
     */
    limit?: number
  }

  /**
   * FollowupEvent.botSessions
   */
  export type FollowupEvent$botSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    where?: BotSessionWhereInput
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    cursor?: BotSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BotSessionScalarFieldEnum | BotSessionScalarFieldEnum[]
  }

  /**
   * FollowupEvent.employmentClaims
   */
  export type FollowupEvent$employmentClaimsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    where?: EmploymentClaimWhereInput
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    cursor?: EmploymentClaimWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmploymentClaimScalarFieldEnum | EmploymentClaimScalarFieldEnum[]
  }

  /**
   * FollowupEvent without action
   */
  export type FollowupEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowupEvent
     */
    select?: FollowupEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FollowupEvent
     */
    omit?: FollowupEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowupEventInclude<ExtArgs> | null
  }


  /**
   * Model BotSession
   */

  export type AggregateBotSession = {
    _count: BotSessionCountAggregateOutputType | null
    _min: BotSessionMinAggregateOutputType | null
    _max: BotSessionMaxAggregateOutputType | null
  }

  export type BotSessionMinAggregateOutputType = {
    id: string | null
    traineeId: string | null
    followupEventId: string | null
    state: $Enums.BotSessionState | null
    currentQuestion: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BotSessionMaxAggregateOutputType = {
    id: string | null
    traineeId: string | null
    followupEventId: string | null
    state: $Enums.BotSessionState | null
    currentQuestion: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BotSessionCountAggregateOutputType = {
    id: number
    traineeId: number
    followupEventId: number
    state: number
    currentQuestion: number
    collectedData: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BotSessionMinAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    state?: true
    currentQuestion?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BotSessionMaxAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    state?: true
    currentQuestion?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BotSessionCountAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    state?: true
    currentQuestion?: true
    collectedData?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BotSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotSession to aggregate.
     */
    where?: BotSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotSessions to fetch.
     */
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BotSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BotSessions
    **/
    _count?: true | BotSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BotSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BotSessionMaxAggregateInputType
  }

  export type GetBotSessionAggregateType<T extends BotSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateBotSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBotSession[P]>
      : GetScalarType<T[P], AggregateBotSession[P]>
  }




  export type BotSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotSessionWhereInput
    orderBy?: BotSessionOrderByWithAggregationInput | BotSessionOrderByWithAggregationInput[]
    by: BotSessionScalarFieldEnum[] | BotSessionScalarFieldEnum
    having?: BotSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BotSessionCountAggregateInputType | true
    _min?: BotSessionMinAggregateInputType
    _max?: BotSessionMaxAggregateInputType
  }

  export type BotSessionGroupByOutputType = {
    id: string
    traineeId: string
    followupEventId: string
    state: $Enums.BotSessionState
    currentQuestion: string | null
    collectedData: JsonValue
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: BotSessionCountAggregateOutputType | null
    _min: BotSessionMinAggregateOutputType | null
    _max: BotSessionMaxAggregateOutputType | null
  }

  type GetBotSessionGroupByPayload<T extends BotSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BotSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BotSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BotSessionGroupByOutputType[P]>
            : GetScalarType<T[P], BotSessionGroupByOutputType[P]>
        }
      >
    >


  export type BotSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    state?: boolean
    currentQuestion?: boolean
    collectedData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["botSession"]>

  export type BotSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    state?: boolean
    currentQuestion?: boolean
    collectedData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["botSession"]>

  export type BotSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    state?: boolean
    currentQuestion?: boolean
    collectedData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["botSession"]>

  export type BotSessionSelectScalar = {
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    state?: boolean
    currentQuestion?: boolean
    collectedData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BotSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traineeId" | "followupEventId" | "state" | "currentQuestion" | "collectedData" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["botSession"]>
  export type BotSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }
  export type BotSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }
  export type BotSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }

  export type $BotSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BotSession"
    objects: {
      trainee: Prisma.$TraineePayload<ExtArgs>
      followupEvent: Prisma.$FollowupEventPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traineeId: string
      followupEventId: string
      state: $Enums.BotSessionState
      currentQuestion: string | null
      collectedData: Prisma.JsonValue
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["botSession"]>
    composites: {}
  }

  type BotSessionGetPayload<S extends boolean | null | undefined | BotSessionDefaultArgs> = $Result.GetResult<Prisma.$BotSessionPayload, S>

  type BotSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BotSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BotSessionCountAggregateInputType | true
    }

  export interface BotSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BotSession'], meta: { name: 'BotSession' } }
    /**
     * Find zero or one BotSession that matches the filter.
     * @param {BotSessionFindUniqueArgs} args - Arguments to find a BotSession
     * @example
     * // Get one BotSession
     * const botSession = await prisma.botSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BotSessionFindUniqueArgs>(args: SelectSubset<T, BotSessionFindUniqueArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BotSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BotSessionFindUniqueOrThrowArgs} args - Arguments to find a BotSession
     * @example
     * // Get one BotSession
     * const botSession = await prisma.botSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BotSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, BotSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionFindFirstArgs} args - Arguments to find a BotSession
     * @example
     * // Get one BotSession
     * const botSession = await prisma.botSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BotSessionFindFirstArgs>(args?: SelectSubset<T, BotSessionFindFirstArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionFindFirstOrThrowArgs} args - Arguments to find a BotSession
     * @example
     * // Get one BotSession
     * const botSession = await prisma.botSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BotSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, BotSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BotSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BotSessions
     * const botSessions = await prisma.botSession.findMany()
     * 
     * // Get first 10 BotSessions
     * const botSessions = await prisma.botSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const botSessionWithIdOnly = await prisma.botSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BotSessionFindManyArgs>(args?: SelectSubset<T, BotSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BotSession.
     * @param {BotSessionCreateArgs} args - Arguments to create a BotSession.
     * @example
     * // Create one BotSession
     * const BotSession = await prisma.botSession.create({
     *   data: {
     *     // ... data to create a BotSession
     *   }
     * })
     * 
     */
    create<T extends BotSessionCreateArgs>(args: SelectSubset<T, BotSessionCreateArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BotSessions.
     * @param {BotSessionCreateManyArgs} args - Arguments to create many BotSessions.
     * @example
     * // Create many BotSessions
     * const botSession = await prisma.botSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BotSessionCreateManyArgs>(args?: SelectSubset<T, BotSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BotSessions and returns the data saved in the database.
     * @param {BotSessionCreateManyAndReturnArgs} args - Arguments to create many BotSessions.
     * @example
     * // Create many BotSessions
     * const botSession = await prisma.botSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BotSessions and only return the `id`
     * const botSessionWithIdOnly = await prisma.botSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BotSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, BotSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BotSession.
     * @param {BotSessionDeleteArgs} args - Arguments to delete one BotSession.
     * @example
     * // Delete one BotSession
     * const BotSession = await prisma.botSession.delete({
     *   where: {
     *     // ... filter to delete one BotSession
     *   }
     * })
     * 
     */
    delete<T extends BotSessionDeleteArgs>(args: SelectSubset<T, BotSessionDeleteArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BotSession.
     * @param {BotSessionUpdateArgs} args - Arguments to update one BotSession.
     * @example
     * // Update one BotSession
     * const botSession = await prisma.botSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BotSessionUpdateArgs>(args: SelectSubset<T, BotSessionUpdateArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BotSessions.
     * @param {BotSessionDeleteManyArgs} args - Arguments to filter BotSessions to delete.
     * @example
     * // Delete a few BotSessions
     * const { count } = await prisma.botSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BotSessionDeleteManyArgs>(args?: SelectSubset<T, BotSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BotSessions
     * const botSession = await prisma.botSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BotSessionUpdateManyArgs>(args: SelectSubset<T, BotSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotSessions and returns the data updated in the database.
     * @param {BotSessionUpdateManyAndReturnArgs} args - Arguments to update many BotSessions.
     * @example
     * // Update many BotSessions
     * const botSession = await prisma.botSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BotSessions and only return the `id`
     * const botSessionWithIdOnly = await prisma.botSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BotSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, BotSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BotSession.
     * @param {BotSessionUpsertArgs} args - Arguments to update or create a BotSession.
     * @example
     * // Update or create a BotSession
     * const botSession = await prisma.botSession.upsert({
     *   create: {
     *     // ... data to create a BotSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BotSession we want to update
     *   }
     * })
     */
    upsert<T extends BotSessionUpsertArgs>(args: SelectSubset<T, BotSessionUpsertArgs<ExtArgs>>): Prisma__BotSessionClient<$Result.GetResult<Prisma.$BotSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BotSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionCountArgs} args - Arguments to filter BotSessions to count.
     * @example
     * // Count the number of BotSessions
     * const count = await prisma.botSession.count({
     *   where: {
     *     // ... the filter for the BotSessions we want to count
     *   }
     * })
    **/
    count<T extends BotSessionCountArgs>(
      args?: Subset<T, BotSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BotSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BotSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BotSessionAggregateArgs>(args: Subset<T, BotSessionAggregateArgs>): Prisma.PrismaPromise<GetBotSessionAggregateType<T>>

    /**
     * Group by BotSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BotSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BotSessionGroupByArgs['orderBy'] }
        : { orderBy?: BotSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BotSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBotSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BotSession model
   */
  readonly fields: BotSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BotSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BotSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trainee<T extends TraineeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TraineeDefaultArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    followupEvent<T extends FollowupEventDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FollowupEventDefaultArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BotSession model
   */
  interface BotSessionFieldRefs {
    readonly id: FieldRef<"BotSession", 'String'>
    readonly traineeId: FieldRef<"BotSession", 'String'>
    readonly followupEventId: FieldRef<"BotSession", 'String'>
    readonly state: FieldRef<"BotSession", 'BotSessionState'>
    readonly currentQuestion: FieldRef<"BotSession", 'String'>
    readonly collectedData: FieldRef<"BotSession", 'Json'>
    readonly expiresAt: FieldRef<"BotSession", 'DateTime'>
    readonly createdAt: FieldRef<"BotSession", 'DateTime'>
    readonly updatedAt: FieldRef<"BotSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BotSession findUnique
   */
  export type BotSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter, which BotSession to fetch.
     */
    where: BotSessionWhereUniqueInput
  }

  /**
   * BotSession findUniqueOrThrow
   */
  export type BotSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter, which BotSession to fetch.
     */
    where: BotSessionWhereUniqueInput
  }

  /**
   * BotSession findFirst
   */
  export type BotSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter, which BotSession to fetch.
     */
    where?: BotSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotSessions to fetch.
     */
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotSessions.
     */
    cursor?: BotSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotSessions.
     */
    distinct?: BotSessionScalarFieldEnum | BotSessionScalarFieldEnum[]
  }

  /**
   * BotSession findFirstOrThrow
   */
  export type BotSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter, which BotSession to fetch.
     */
    where?: BotSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotSessions to fetch.
     */
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotSessions.
     */
    cursor?: BotSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotSessions.
     */
    distinct?: BotSessionScalarFieldEnum | BotSessionScalarFieldEnum[]
  }

  /**
   * BotSession findMany
   */
  export type BotSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter, which BotSessions to fetch.
     */
    where?: BotSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotSessions to fetch.
     */
    orderBy?: BotSessionOrderByWithRelationInput | BotSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BotSessions.
     */
    cursor?: BotSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotSessions.
     */
    skip?: number
    distinct?: BotSessionScalarFieldEnum | BotSessionScalarFieldEnum[]
  }

  /**
   * BotSession create
   */
  export type BotSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a BotSession.
     */
    data: XOR<BotSessionCreateInput, BotSessionUncheckedCreateInput>
  }

  /**
   * BotSession createMany
   */
  export type BotSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BotSessions.
     */
    data: BotSessionCreateManyInput | BotSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BotSession createManyAndReturn
   */
  export type BotSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * The data used to create many BotSessions.
     */
    data: BotSessionCreateManyInput | BotSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BotSession update
   */
  export type BotSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a BotSession.
     */
    data: XOR<BotSessionUpdateInput, BotSessionUncheckedUpdateInput>
    /**
     * Choose, which BotSession to update.
     */
    where: BotSessionWhereUniqueInput
  }

  /**
   * BotSession updateMany
   */
  export type BotSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BotSessions.
     */
    data: XOR<BotSessionUpdateManyMutationInput, BotSessionUncheckedUpdateManyInput>
    /**
     * Filter which BotSessions to update
     */
    where?: BotSessionWhereInput
    /**
     * Limit how many BotSessions to update.
     */
    limit?: number
  }

  /**
   * BotSession updateManyAndReturn
   */
  export type BotSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * The data used to update BotSessions.
     */
    data: XOR<BotSessionUpdateManyMutationInput, BotSessionUncheckedUpdateManyInput>
    /**
     * Filter which BotSessions to update
     */
    where?: BotSessionWhereInput
    /**
     * Limit how many BotSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BotSession upsert
   */
  export type BotSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the BotSession to update in case it exists.
     */
    where: BotSessionWhereUniqueInput
    /**
     * In case the BotSession found by the `where` argument doesn't exist, create a new BotSession with this data.
     */
    create: XOR<BotSessionCreateInput, BotSessionUncheckedCreateInput>
    /**
     * In case the BotSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BotSessionUpdateInput, BotSessionUncheckedUpdateInput>
  }

  /**
   * BotSession delete
   */
  export type BotSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
    /**
     * Filter which BotSession to delete.
     */
    where: BotSessionWhereUniqueInput
  }

  /**
   * BotSession deleteMany
   */
  export type BotSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotSessions to delete
     */
    where?: BotSessionWhereInput
    /**
     * Limit how many BotSessions to delete.
     */
    limit?: number
  }

  /**
   * BotSession without action
   */
  export type BotSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotSession
     */
    select?: BotSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotSession
     */
    omit?: BotSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BotSessionInclude<ExtArgs> | null
  }


  /**
   * Model EmploymentClaim
   */

  export type AggregateEmploymentClaim = {
    _count: EmploymentClaimCountAggregateOutputType | null
    _avg: EmploymentClaimAvgAggregateOutputType | null
    _sum: EmploymentClaimSumAggregateOutputType | null
    _min: EmploymentClaimMinAggregateOutputType | null
    _max: EmploymentClaimMaxAggregateOutputType | null
  }

  export type EmploymentClaimAvgAggregateOutputType = {
    evidenceLevel: number | null
  }

  export type EmploymentClaimSumAggregateOutputType = {
    evidenceLevel: number | null
  }

  export type EmploymentClaimMinAggregateOutputType = {
    id: string | null
    traineeId: string | null
    followupEventId: string | null
    employerName: string | null
    role: string | null
    salaryBand: $Enums.SalaryBand | null
    nonPlacementReason: $Enums.NonPlacementReason | null
    verificationStatus: $Enums.VerificationStatus | null
    evidenceLevel: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmploymentClaimMaxAggregateOutputType = {
    id: string | null
    traineeId: string | null
    followupEventId: string | null
    employerName: string | null
    role: string | null
    salaryBand: $Enums.SalaryBand | null
    nonPlacementReason: $Enums.NonPlacementReason | null
    verificationStatus: $Enums.VerificationStatus | null
    evidenceLevel: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmploymentClaimCountAggregateOutputType = {
    id: number
    traineeId: number
    followupEventId: number
    employerName: number
    role: number
    salaryBand: number
    nonPlacementReason: number
    verificationStatus: number
    evidenceLevel: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EmploymentClaimAvgAggregateInputType = {
    evidenceLevel?: true
  }

  export type EmploymentClaimSumAggregateInputType = {
    evidenceLevel?: true
  }

  export type EmploymentClaimMinAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    employerName?: true
    role?: true
    salaryBand?: true
    nonPlacementReason?: true
    verificationStatus?: true
    evidenceLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmploymentClaimMaxAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    employerName?: true
    role?: true
    salaryBand?: true
    nonPlacementReason?: true
    verificationStatus?: true
    evidenceLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmploymentClaimCountAggregateInputType = {
    id?: true
    traineeId?: true
    followupEventId?: true
    employerName?: true
    role?: true
    salaryBand?: true
    nonPlacementReason?: true
    verificationStatus?: true
    evidenceLevel?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EmploymentClaimAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmploymentClaim to aggregate.
     */
    where?: EmploymentClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmploymentClaims to fetch.
     */
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmploymentClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmploymentClaims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmploymentClaims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmploymentClaims
    **/
    _count?: true | EmploymentClaimCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmploymentClaimAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmploymentClaimSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmploymentClaimMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmploymentClaimMaxAggregateInputType
  }

  export type GetEmploymentClaimAggregateType<T extends EmploymentClaimAggregateArgs> = {
        [P in keyof T & keyof AggregateEmploymentClaim]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmploymentClaim[P]>
      : GetScalarType<T[P], AggregateEmploymentClaim[P]>
  }




  export type EmploymentClaimGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmploymentClaimWhereInput
    orderBy?: EmploymentClaimOrderByWithAggregationInput | EmploymentClaimOrderByWithAggregationInput[]
    by: EmploymentClaimScalarFieldEnum[] | EmploymentClaimScalarFieldEnum
    having?: EmploymentClaimScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmploymentClaimCountAggregateInputType | true
    _avg?: EmploymentClaimAvgAggregateInputType
    _sum?: EmploymentClaimSumAggregateInputType
    _min?: EmploymentClaimMinAggregateInputType
    _max?: EmploymentClaimMaxAggregateInputType
  }

  export type EmploymentClaimGroupByOutputType = {
    id: string
    traineeId: string
    followupEventId: string
    employerName: string | null
    role: string | null
    salaryBand: $Enums.SalaryBand | null
    nonPlacementReason: $Enums.NonPlacementReason | null
    verificationStatus: $Enums.VerificationStatus
    evidenceLevel: number
    createdAt: Date
    updatedAt: Date
    _count: EmploymentClaimCountAggregateOutputType | null
    _avg: EmploymentClaimAvgAggregateOutputType | null
    _sum: EmploymentClaimSumAggregateOutputType | null
    _min: EmploymentClaimMinAggregateOutputType | null
    _max: EmploymentClaimMaxAggregateOutputType | null
  }

  type GetEmploymentClaimGroupByPayload<T extends EmploymentClaimGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmploymentClaimGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmploymentClaimGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmploymentClaimGroupByOutputType[P]>
            : GetScalarType<T[P], EmploymentClaimGroupByOutputType[P]>
        }
      >
    >


  export type EmploymentClaimSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    employerName?: boolean
    role?: boolean
    salaryBand?: boolean
    nonPlacementReason?: boolean
    verificationStatus?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
    verificationRequests?: boolean | EmploymentClaim$verificationRequestsArgs<ExtArgs>
    outcomeEvents?: boolean | EmploymentClaim$outcomeEventsArgs<ExtArgs>
    _count?: boolean | EmploymentClaimCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employmentClaim"]>

  export type EmploymentClaimSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    employerName?: boolean
    role?: boolean
    salaryBand?: boolean
    nonPlacementReason?: boolean
    verificationStatus?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employmentClaim"]>

  export type EmploymentClaimSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    employerName?: boolean
    role?: boolean
    salaryBand?: boolean
    nonPlacementReason?: boolean
    verificationStatus?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employmentClaim"]>

  export type EmploymentClaimSelectScalar = {
    id?: boolean
    traineeId?: boolean
    followupEventId?: boolean
    employerName?: boolean
    role?: boolean
    salaryBand?: boolean
    nonPlacementReason?: boolean
    verificationStatus?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EmploymentClaimOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traineeId" | "followupEventId" | "employerName" | "role" | "salaryBand" | "nonPlacementReason" | "verificationStatus" | "evidenceLevel" | "createdAt" | "updatedAt", ExtArgs["result"]["employmentClaim"]>
  export type EmploymentClaimInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
    verificationRequests?: boolean | EmploymentClaim$verificationRequestsArgs<ExtArgs>
    outcomeEvents?: boolean | EmploymentClaim$outcomeEventsArgs<ExtArgs>
    _count?: boolean | EmploymentClaimCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EmploymentClaimIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }
  export type EmploymentClaimIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    followupEvent?: boolean | FollowupEventDefaultArgs<ExtArgs>
  }

  export type $EmploymentClaimPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmploymentClaim"
    objects: {
      trainee: Prisma.$TraineePayload<ExtArgs>
      followupEvent: Prisma.$FollowupEventPayload<ExtArgs>
      verificationRequests: Prisma.$VerificationRequestPayload<ExtArgs>[]
      outcomeEvents: Prisma.$OutcomeEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traineeId: string
      followupEventId: string
      employerName: string | null
      role: string | null
      salaryBand: $Enums.SalaryBand | null
      nonPlacementReason: $Enums.NonPlacementReason | null
      verificationStatus: $Enums.VerificationStatus
      evidenceLevel: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["employmentClaim"]>
    composites: {}
  }

  type EmploymentClaimGetPayload<S extends boolean | null | undefined | EmploymentClaimDefaultArgs> = $Result.GetResult<Prisma.$EmploymentClaimPayload, S>

  type EmploymentClaimCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmploymentClaimFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmploymentClaimCountAggregateInputType | true
    }

  export interface EmploymentClaimDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmploymentClaim'], meta: { name: 'EmploymentClaim' } }
    /**
     * Find zero or one EmploymentClaim that matches the filter.
     * @param {EmploymentClaimFindUniqueArgs} args - Arguments to find a EmploymentClaim
     * @example
     * // Get one EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmploymentClaimFindUniqueArgs>(args: SelectSubset<T, EmploymentClaimFindUniqueArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmploymentClaim that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmploymentClaimFindUniqueOrThrowArgs} args - Arguments to find a EmploymentClaim
     * @example
     * // Get one EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmploymentClaimFindUniqueOrThrowArgs>(args: SelectSubset<T, EmploymentClaimFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmploymentClaim that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimFindFirstArgs} args - Arguments to find a EmploymentClaim
     * @example
     * // Get one EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmploymentClaimFindFirstArgs>(args?: SelectSubset<T, EmploymentClaimFindFirstArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmploymentClaim that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimFindFirstOrThrowArgs} args - Arguments to find a EmploymentClaim
     * @example
     * // Get one EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmploymentClaimFindFirstOrThrowArgs>(args?: SelectSubset<T, EmploymentClaimFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmploymentClaims that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmploymentClaims
     * const employmentClaims = await prisma.employmentClaim.findMany()
     * 
     * // Get first 10 EmploymentClaims
     * const employmentClaims = await prisma.employmentClaim.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const employmentClaimWithIdOnly = await prisma.employmentClaim.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmploymentClaimFindManyArgs>(args?: SelectSubset<T, EmploymentClaimFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmploymentClaim.
     * @param {EmploymentClaimCreateArgs} args - Arguments to create a EmploymentClaim.
     * @example
     * // Create one EmploymentClaim
     * const EmploymentClaim = await prisma.employmentClaim.create({
     *   data: {
     *     // ... data to create a EmploymentClaim
     *   }
     * })
     * 
     */
    create<T extends EmploymentClaimCreateArgs>(args: SelectSubset<T, EmploymentClaimCreateArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmploymentClaims.
     * @param {EmploymentClaimCreateManyArgs} args - Arguments to create many EmploymentClaims.
     * @example
     * // Create many EmploymentClaims
     * const employmentClaim = await prisma.employmentClaim.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmploymentClaimCreateManyArgs>(args?: SelectSubset<T, EmploymentClaimCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmploymentClaims and returns the data saved in the database.
     * @param {EmploymentClaimCreateManyAndReturnArgs} args - Arguments to create many EmploymentClaims.
     * @example
     * // Create many EmploymentClaims
     * const employmentClaim = await prisma.employmentClaim.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmploymentClaims and only return the `id`
     * const employmentClaimWithIdOnly = await prisma.employmentClaim.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmploymentClaimCreateManyAndReturnArgs>(args?: SelectSubset<T, EmploymentClaimCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmploymentClaim.
     * @param {EmploymentClaimDeleteArgs} args - Arguments to delete one EmploymentClaim.
     * @example
     * // Delete one EmploymentClaim
     * const EmploymentClaim = await prisma.employmentClaim.delete({
     *   where: {
     *     // ... filter to delete one EmploymentClaim
     *   }
     * })
     * 
     */
    delete<T extends EmploymentClaimDeleteArgs>(args: SelectSubset<T, EmploymentClaimDeleteArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmploymentClaim.
     * @param {EmploymentClaimUpdateArgs} args - Arguments to update one EmploymentClaim.
     * @example
     * // Update one EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmploymentClaimUpdateArgs>(args: SelectSubset<T, EmploymentClaimUpdateArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmploymentClaims.
     * @param {EmploymentClaimDeleteManyArgs} args - Arguments to filter EmploymentClaims to delete.
     * @example
     * // Delete a few EmploymentClaims
     * const { count } = await prisma.employmentClaim.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmploymentClaimDeleteManyArgs>(args?: SelectSubset<T, EmploymentClaimDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmploymentClaims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmploymentClaims
     * const employmentClaim = await prisma.employmentClaim.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmploymentClaimUpdateManyArgs>(args: SelectSubset<T, EmploymentClaimUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmploymentClaims and returns the data updated in the database.
     * @param {EmploymentClaimUpdateManyAndReturnArgs} args - Arguments to update many EmploymentClaims.
     * @example
     * // Update many EmploymentClaims
     * const employmentClaim = await prisma.employmentClaim.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmploymentClaims and only return the `id`
     * const employmentClaimWithIdOnly = await prisma.employmentClaim.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmploymentClaimUpdateManyAndReturnArgs>(args: SelectSubset<T, EmploymentClaimUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmploymentClaim.
     * @param {EmploymentClaimUpsertArgs} args - Arguments to update or create a EmploymentClaim.
     * @example
     * // Update or create a EmploymentClaim
     * const employmentClaim = await prisma.employmentClaim.upsert({
     *   create: {
     *     // ... data to create a EmploymentClaim
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmploymentClaim we want to update
     *   }
     * })
     */
    upsert<T extends EmploymentClaimUpsertArgs>(args: SelectSubset<T, EmploymentClaimUpsertArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmploymentClaims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimCountArgs} args - Arguments to filter EmploymentClaims to count.
     * @example
     * // Count the number of EmploymentClaims
     * const count = await prisma.employmentClaim.count({
     *   where: {
     *     // ... the filter for the EmploymentClaims we want to count
     *   }
     * })
    **/
    count<T extends EmploymentClaimCountArgs>(
      args?: Subset<T, EmploymentClaimCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmploymentClaimCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmploymentClaim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmploymentClaimAggregateArgs>(args: Subset<T, EmploymentClaimAggregateArgs>): Prisma.PrismaPromise<GetEmploymentClaimAggregateType<T>>

    /**
     * Group by EmploymentClaim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmploymentClaimGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmploymentClaimGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmploymentClaimGroupByArgs['orderBy'] }
        : { orderBy?: EmploymentClaimGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmploymentClaimGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmploymentClaimGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmploymentClaim model
   */
  readonly fields: EmploymentClaimFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmploymentClaim.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmploymentClaimClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trainee<T extends TraineeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TraineeDefaultArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    followupEvent<T extends FollowupEventDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FollowupEventDefaultArgs<ExtArgs>>): Prisma__FollowupEventClient<$Result.GetResult<Prisma.$FollowupEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    verificationRequests<T extends EmploymentClaim$verificationRequestsArgs<ExtArgs> = {}>(args?: Subset<T, EmploymentClaim$verificationRequestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outcomeEvents<T extends EmploymentClaim$outcomeEventsArgs<ExtArgs> = {}>(args?: Subset<T, EmploymentClaim$outcomeEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmploymentClaim model
   */
  interface EmploymentClaimFieldRefs {
    readonly id: FieldRef<"EmploymentClaim", 'String'>
    readonly traineeId: FieldRef<"EmploymentClaim", 'String'>
    readonly followupEventId: FieldRef<"EmploymentClaim", 'String'>
    readonly employerName: FieldRef<"EmploymentClaim", 'String'>
    readonly role: FieldRef<"EmploymentClaim", 'String'>
    readonly salaryBand: FieldRef<"EmploymentClaim", 'SalaryBand'>
    readonly nonPlacementReason: FieldRef<"EmploymentClaim", 'NonPlacementReason'>
    readonly verificationStatus: FieldRef<"EmploymentClaim", 'VerificationStatus'>
    readonly evidenceLevel: FieldRef<"EmploymentClaim", 'Int'>
    readonly createdAt: FieldRef<"EmploymentClaim", 'DateTime'>
    readonly updatedAt: FieldRef<"EmploymentClaim", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmploymentClaim findUnique
   */
  export type EmploymentClaimFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter, which EmploymentClaim to fetch.
     */
    where: EmploymentClaimWhereUniqueInput
  }

  /**
   * EmploymentClaim findUniqueOrThrow
   */
  export type EmploymentClaimFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter, which EmploymentClaim to fetch.
     */
    where: EmploymentClaimWhereUniqueInput
  }

  /**
   * EmploymentClaim findFirst
   */
  export type EmploymentClaimFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter, which EmploymentClaim to fetch.
     */
    where?: EmploymentClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmploymentClaims to fetch.
     */
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmploymentClaims.
     */
    cursor?: EmploymentClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmploymentClaims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmploymentClaims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmploymentClaims.
     */
    distinct?: EmploymentClaimScalarFieldEnum | EmploymentClaimScalarFieldEnum[]
  }

  /**
   * EmploymentClaim findFirstOrThrow
   */
  export type EmploymentClaimFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter, which EmploymentClaim to fetch.
     */
    where?: EmploymentClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmploymentClaims to fetch.
     */
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmploymentClaims.
     */
    cursor?: EmploymentClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmploymentClaims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmploymentClaims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmploymentClaims.
     */
    distinct?: EmploymentClaimScalarFieldEnum | EmploymentClaimScalarFieldEnum[]
  }

  /**
   * EmploymentClaim findMany
   */
  export type EmploymentClaimFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter, which EmploymentClaims to fetch.
     */
    where?: EmploymentClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmploymentClaims to fetch.
     */
    orderBy?: EmploymentClaimOrderByWithRelationInput | EmploymentClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmploymentClaims.
     */
    cursor?: EmploymentClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmploymentClaims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmploymentClaims.
     */
    skip?: number
    distinct?: EmploymentClaimScalarFieldEnum | EmploymentClaimScalarFieldEnum[]
  }

  /**
   * EmploymentClaim create
   */
  export type EmploymentClaimCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * The data needed to create a EmploymentClaim.
     */
    data: XOR<EmploymentClaimCreateInput, EmploymentClaimUncheckedCreateInput>
  }

  /**
   * EmploymentClaim createMany
   */
  export type EmploymentClaimCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmploymentClaims.
     */
    data: EmploymentClaimCreateManyInput | EmploymentClaimCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmploymentClaim createManyAndReturn
   */
  export type EmploymentClaimCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * The data used to create many EmploymentClaims.
     */
    data: EmploymentClaimCreateManyInput | EmploymentClaimCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmploymentClaim update
   */
  export type EmploymentClaimUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * The data needed to update a EmploymentClaim.
     */
    data: XOR<EmploymentClaimUpdateInput, EmploymentClaimUncheckedUpdateInput>
    /**
     * Choose, which EmploymentClaim to update.
     */
    where: EmploymentClaimWhereUniqueInput
  }

  /**
   * EmploymentClaim updateMany
   */
  export type EmploymentClaimUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmploymentClaims.
     */
    data: XOR<EmploymentClaimUpdateManyMutationInput, EmploymentClaimUncheckedUpdateManyInput>
    /**
     * Filter which EmploymentClaims to update
     */
    where?: EmploymentClaimWhereInput
    /**
     * Limit how many EmploymentClaims to update.
     */
    limit?: number
  }

  /**
   * EmploymentClaim updateManyAndReturn
   */
  export type EmploymentClaimUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * The data used to update EmploymentClaims.
     */
    data: XOR<EmploymentClaimUpdateManyMutationInput, EmploymentClaimUncheckedUpdateManyInput>
    /**
     * Filter which EmploymentClaims to update
     */
    where?: EmploymentClaimWhereInput
    /**
     * Limit how many EmploymentClaims to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmploymentClaim upsert
   */
  export type EmploymentClaimUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * The filter to search for the EmploymentClaim to update in case it exists.
     */
    where: EmploymentClaimWhereUniqueInput
    /**
     * In case the EmploymentClaim found by the `where` argument doesn't exist, create a new EmploymentClaim with this data.
     */
    create: XOR<EmploymentClaimCreateInput, EmploymentClaimUncheckedCreateInput>
    /**
     * In case the EmploymentClaim was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmploymentClaimUpdateInput, EmploymentClaimUncheckedUpdateInput>
  }

  /**
   * EmploymentClaim delete
   */
  export type EmploymentClaimDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    /**
     * Filter which EmploymentClaim to delete.
     */
    where: EmploymentClaimWhereUniqueInput
  }

  /**
   * EmploymentClaim deleteMany
   */
  export type EmploymentClaimDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmploymentClaims to delete
     */
    where?: EmploymentClaimWhereInput
    /**
     * Limit how many EmploymentClaims to delete.
     */
    limit?: number
  }

  /**
   * EmploymentClaim.verificationRequests
   */
  export type EmploymentClaim$verificationRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    where?: VerificationRequestWhereInput
    orderBy?: VerificationRequestOrderByWithRelationInput | VerificationRequestOrderByWithRelationInput[]
    cursor?: VerificationRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VerificationRequestScalarFieldEnum | VerificationRequestScalarFieldEnum[]
  }

  /**
   * EmploymentClaim.outcomeEvents
   */
  export type EmploymentClaim$outcomeEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    where?: OutcomeEventWhereInput
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    cursor?: OutcomeEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutcomeEventScalarFieldEnum | OutcomeEventScalarFieldEnum[]
  }

  /**
   * EmploymentClaim without action
   */
  export type EmploymentClaimDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
  }


  /**
   * Model OutcomeEvent
   */

  export type AggregateOutcomeEvent = {
    _count: OutcomeEventCountAggregateOutputType | null
    _avg: OutcomeEventAvgAggregateOutputType | null
    _sum: OutcomeEventSumAggregateOutputType | null
    _min: OutcomeEventMinAggregateOutputType | null
    _max: OutcomeEventMaxAggregateOutputType | null
  }

  export type OutcomeEventAvgAggregateOutputType = {
    checkpointDays: number | null
    evidenceLevel: number | null
  }

  export type OutcomeEventSumAggregateOutputType = {
    checkpointDays: number | null
    evidenceLevel: number | null
  }

  export type OutcomeEventMinAggregateOutputType = {
    id: string | null
    traineeId: string | null
    employmentClaimId: string | null
    checkpointDays: number | null
    outcomeStatus: $Enums.OutcomeStatus | null
    verificationStatus: $Enums.VerificationStatus | null
    source: string | null
    evidenceLevel: number | null
    createdAt: Date | null
  }

  export type OutcomeEventMaxAggregateOutputType = {
    id: string | null
    traineeId: string | null
    employmentClaimId: string | null
    checkpointDays: number | null
    outcomeStatus: $Enums.OutcomeStatus | null
    verificationStatus: $Enums.VerificationStatus | null
    source: string | null
    evidenceLevel: number | null
    createdAt: Date | null
  }

  export type OutcomeEventCountAggregateOutputType = {
    id: number
    traineeId: number
    employmentClaimId: number
    checkpointDays: number
    outcomeStatus: number
    verificationStatus: number
    source: number
    evidenceLevel: number
    createdAt: number
    _all: number
  }


  export type OutcomeEventAvgAggregateInputType = {
    checkpointDays?: true
    evidenceLevel?: true
  }

  export type OutcomeEventSumAggregateInputType = {
    checkpointDays?: true
    evidenceLevel?: true
  }

  export type OutcomeEventMinAggregateInputType = {
    id?: true
    traineeId?: true
    employmentClaimId?: true
    checkpointDays?: true
    outcomeStatus?: true
    verificationStatus?: true
    source?: true
    evidenceLevel?: true
    createdAt?: true
  }

  export type OutcomeEventMaxAggregateInputType = {
    id?: true
    traineeId?: true
    employmentClaimId?: true
    checkpointDays?: true
    outcomeStatus?: true
    verificationStatus?: true
    source?: true
    evidenceLevel?: true
    createdAt?: true
  }

  export type OutcomeEventCountAggregateInputType = {
    id?: true
    traineeId?: true
    employmentClaimId?: true
    checkpointDays?: true
    outcomeStatus?: true
    verificationStatus?: true
    source?: true
    evidenceLevel?: true
    createdAt?: true
    _all?: true
  }

  export type OutcomeEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutcomeEvent to aggregate.
     */
    where?: OutcomeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutcomeEvents to fetch.
     */
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutcomeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutcomeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutcomeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutcomeEvents
    **/
    _count?: true | OutcomeEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutcomeEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutcomeEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutcomeEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutcomeEventMaxAggregateInputType
  }

  export type GetOutcomeEventAggregateType<T extends OutcomeEventAggregateArgs> = {
        [P in keyof T & keyof AggregateOutcomeEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutcomeEvent[P]>
      : GetScalarType<T[P], AggregateOutcomeEvent[P]>
  }




  export type OutcomeEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeEventWhereInput
    orderBy?: OutcomeEventOrderByWithAggregationInput | OutcomeEventOrderByWithAggregationInput[]
    by: OutcomeEventScalarFieldEnum[] | OutcomeEventScalarFieldEnum
    having?: OutcomeEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutcomeEventCountAggregateInputType | true
    _avg?: OutcomeEventAvgAggregateInputType
    _sum?: OutcomeEventSumAggregateInputType
    _min?: OutcomeEventMinAggregateInputType
    _max?: OutcomeEventMaxAggregateInputType
  }

  export type OutcomeEventGroupByOutputType = {
    id: string
    traineeId: string
    employmentClaimId: string | null
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt: Date
    _count: OutcomeEventCountAggregateOutputType | null
    _avg: OutcomeEventAvgAggregateOutputType | null
    _sum: OutcomeEventSumAggregateOutputType | null
    _min: OutcomeEventMinAggregateOutputType | null
    _max: OutcomeEventMaxAggregateOutputType | null
  }

  type GetOutcomeEventGroupByPayload<T extends OutcomeEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutcomeEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutcomeEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutcomeEventGroupByOutputType[P]>
            : GetScalarType<T[P], OutcomeEventGroupByOutputType[P]>
        }
      >
    >


  export type OutcomeEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    employmentClaimId?: boolean
    checkpointDays?: boolean
    outcomeStatus?: boolean
    verificationStatus?: boolean
    source?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }, ExtArgs["result"]["outcomeEvent"]>

  export type OutcomeEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    employmentClaimId?: boolean
    checkpointDays?: boolean
    outcomeStatus?: boolean
    verificationStatus?: boolean
    source?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }, ExtArgs["result"]["outcomeEvent"]>

  export type OutcomeEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    traineeId?: boolean
    employmentClaimId?: boolean
    checkpointDays?: boolean
    outcomeStatus?: boolean
    verificationStatus?: boolean
    source?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }, ExtArgs["result"]["outcomeEvent"]>

  export type OutcomeEventSelectScalar = {
    id?: boolean
    traineeId?: boolean
    employmentClaimId?: boolean
    checkpointDays?: boolean
    outcomeStatus?: boolean
    verificationStatus?: boolean
    source?: boolean
    evidenceLevel?: boolean
    createdAt?: boolean
  }

  export type OutcomeEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "traineeId" | "employmentClaimId" | "checkpointDays" | "outcomeStatus" | "verificationStatus" | "source" | "evidenceLevel" | "createdAt", ExtArgs["result"]["outcomeEvent"]>
  export type OutcomeEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }
  export type OutcomeEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }
  export type OutcomeEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trainee?: boolean | TraineeDefaultArgs<ExtArgs>
    employmentClaim?: boolean | OutcomeEvent$employmentClaimArgs<ExtArgs>
  }

  export type $OutcomeEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutcomeEvent"
    objects: {
      trainee: Prisma.$TraineePayload<ExtArgs>
      employmentClaim: Prisma.$EmploymentClaimPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      traineeId: string
      employmentClaimId: string | null
      checkpointDays: number
      outcomeStatus: $Enums.OutcomeStatus
      verificationStatus: $Enums.VerificationStatus
      source: string
      evidenceLevel: number
      createdAt: Date
    }, ExtArgs["result"]["outcomeEvent"]>
    composites: {}
  }

  type OutcomeEventGetPayload<S extends boolean | null | undefined | OutcomeEventDefaultArgs> = $Result.GetResult<Prisma.$OutcomeEventPayload, S>

  type OutcomeEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutcomeEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutcomeEventCountAggregateInputType | true
    }

  export interface OutcomeEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutcomeEvent'], meta: { name: 'OutcomeEvent' } }
    /**
     * Find zero or one OutcomeEvent that matches the filter.
     * @param {OutcomeEventFindUniqueArgs} args - Arguments to find a OutcomeEvent
     * @example
     * // Get one OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutcomeEventFindUniqueArgs>(args: SelectSubset<T, OutcomeEventFindUniqueArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OutcomeEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutcomeEventFindUniqueOrThrowArgs} args - Arguments to find a OutcomeEvent
     * @example
     * // Get one OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutcomeEventFindUniqueOrThrowArgs>(args: SelectSubset<T, OutcomeEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutcomeEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventFindFirstArgs} args - Arguments to find a OutcomeEvent
     * @example
     * // Get one OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutcomeEventFindFirstArgs>(args?: SelectSubset<T, OutcomeEventFindFirstArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutcomeEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventFindFirstOrThrowArgs} args - Arguments to find a OutcomeEvent
     * @example
     * // Get one OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutcomeEventFindFirstOrThrowArgs>(args?: SelectSubset<T, OutcomeEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OutcomeEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutcomeEvents
     * const outcomeEvents = await prisma.outcomeEvent.findMany()
     * 
     * // Get first 10 OutcomeEvents
     * const outcomeEvents = await prisma.outcomeEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outcomeEventWithIdOnly = await prisma.outcomeEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutcomeEventFindManyArgs>(args?: SelectSubset<T, OutcomeEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OutcomeEvent.
     * @param {OutcomeEventCreateArgs} args - Arguments to create a OutcomeEvent.
     * @example
     * // Create one OutcomeEvent
     * const OutcomeEvent = await prisma.outcomeEvent.create({
     *   data: {
     *     // ... data to create a OutcomeEvent
     *   }
     * })
     * 
     */
    create<T extends OutcomeEventCreateArgs>(args: SelectSubset<T, OutcomeEventCreateArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OutcomeEvents.
     * @param {OutcomeEventCreateManyArgs} args - Arguments to create many OutcomeEvents.
     * @example
     * // Create many OutcomeEvents
     * const outcomeEvent = await prisma.outcomeEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutcomeEventCreateManyArgs>(args?: SelectSubset<T, OutcomeEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutcomeEvents and returns the data saved in the database.
     * @param {OutcomeEventCreateManyAndReturnArgs} args - Arguments to create many OutcomeEvents.
     * @example
     * // Create many OutcomeEvents
     * const outcomeEvent = await prisma.outcomeEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutcomeEvents and only return the `id`
     * const outcomeEventWithIdOnly = await prisma.outcomeEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutcomeEventCreateManyAndReturnArgs>(args?: SelectSubset<T, OutcomeEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OutcomeEvent.
     * @param {OutcomeEventDeleteArgs} args - Arguments to delete one OutcomeEvent.
     * @example
     * // Delete one OutcomeEvent
     * const OutcomeEvent = await prisma.outcomeEvent.delete({
     *   where: {
     *     // ... filter to delete one OutcomeEvent
     *   }
     * })
     * 
     */
    delete<T extends OutcomeEventDeleteArgs>(args: SelectSubset<T, OutcomeEventDeleteArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OutcomeEvent.
     * @param {OutcomeEventUpdateArgs} args - Arguments to update one OutcomeEvent.
     * @example
     * // Update one OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutcomeEventUpdateArgs>(args: SelectSubset<T, OutcomeEventUpdateArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OutcomeEvents.
     * @param {OutcomeEventDeleteManyArgs} args - Arguments to filter OutcomeEvents to delete.
     * @example
     * // Delete a few OutcomeEvents
     * const { count } = await prisma.outcomeEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutcomeEventDeleteManyArgs>(args?: SelectSubset<T, OutcomeEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutcomeEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutcomeEvents
     * const outcomeEvent = await prisma.outcomeEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutcomeEventUpdateManyArgs>(args: SelectSubset<T, OutcomeEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutcomeEvents and returns the data updated in the database.
     * @param {OutcomeEventUpdateManyAndReturnArgs} args - Arguments to update many OutcomeEvents.
     * @example
     * // Update many OutcomeEvents
     * const outcomeEvent = await prisma.outcomeEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OutcomeEvents and only return the `id`
     * const outcomeEventWithIdOnly = await prisma.outcomeEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutcomeEventUpdateManyAndReturnArgs>(args: SelectSubset<T, OutcomeEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OutcomeEvent.
     * @param {OutcomeEventUpsertArgs} args - Arguments to update or create a OutcomeEvent.
     * @example
     * // Update or create a OutcomeEvent
     * const outcomeEvent = await prisma.outcomeEvent.upsert({
     *   create: {
     *     // ... data to create a OutcomeEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutcomeEvent we want to update
     *   }
     * })
     */
    upsert<T extends OutcomeEventUpsertArgs>(args: SelectSubset<T, OutcomeEventUpsertArgs<ExtArgs>>): Prisma__OutcomeEventClient<$Result.GetResult<Prisma.$OutcomeEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OutcomeEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventCountArgs} args - Arguments to filter OutcomeEvents to count.
     * @example
     * // Count the number of OutcomeEvents
     * const count = await prisma.outcomeEvent.count({
     *   where: {
     *     // ... the filter for the OutcomeEvents we want to count
     *   }
     * })
    **/
    count<T extends OutcomeEventCountArgs>(
      args?: Subset<T, OutcomeEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutcomeEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutcomeEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutcomeEventAggregateArgs>(args: Subset<T, OutcomeEventAggregateArgs>): Prisma.PrismaPromise<GetOutcomeEventAggregateType<T>>

    /**
     * Group by OutcomeEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutcomeEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutcomeEventGroupByArgs['orderBy'] }
        : { orderBy?: OutcomeEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutcomeEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutcomeEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutcomeEvent model
   */
  readonly fields: OutcomeEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutcomeEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutcomeEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trainee<T extends TraineeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TraineeDefaultArgs<ExtArgs>>): Prisma__TraineeClient<$Result.GetResult<Prisma.$TraineePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    employmentClaim<T extends OutcomeEvent$employmentClaimArgs<ExtArgs> = {}>(args?: Subset<T, OutcomeEvent$employmentClaimArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutcomeEvent model
   */
  interface OutcomeEventFieldRefs {
    readonly id: FieldRef<"OutcomeEvent", 'String'>
    readonly traineeId: FieldRef<"OutcomeEvent", 'String'>
    readonly employmentClaimId: FieldRef<"OutcomeEvent", 'String'>
    readonly checkpointDays: FieldRef<"OutcomeEvent", 'Int'>
    readonly outcomeStatus: FieldRef<"OutcomeEvent", 'OutcomeStatus'>
    readonly verificationStatus: FieldRef<"OutcomeEvent", 'VerificationStatus'>
    readonly source: FieldRef<"OutcomeEvent", 'String'>
    readonly evidenceLevel: FieldRef<"OutcomeEvent", 'Int'>
    readonly createdAt: FieldRef<"OutcomeEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutcomeEvent findUnique
   */
  export type OutcomeEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter, which OutcomeEvent to fetch.
     */
    where: OutcomeEventWhereUniqueInput
  }

  /**
   * OutcomeEvent findUniqueOrThrow
   */
  export type OutcomeEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter, which OutcomeEvent to fetch.
     */
    where: OutcomeEventWhereUniqueInput
  }

  /**
   * OutcomeEvent findFirst
   */
  export type OutcomeEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter, which OutcomeEvent to fetch.
     */
    where?: OutcomeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutcomeEvents to fetch.
     */
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutcomeEvents.
     */
    cursor?: OutcomeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutcomeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutcomeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutcomeEvents.
     */
    distinct?: OutcomeEventScalarFieldEnum | OutcomeEventScalarFieldEnum[]
  }

  /**
   * OutcomeEvent findFirstOrThrow
   */
  export type OutcomeEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter, which OutcomeEvent to fetch.
     */
    where?: OutcomeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutcomeEvents to fetch.
     */
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutcomeEvents.
     */
    cursor?: OutcomeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutcomeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutcomeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutcomeEvents.
     */
    distinct?: OutcomeEventScalarFieldEnum | OutcomeEventScalarFieldEnum[]
  }

  /**
   * OutcomeEvent findMany
   */
  export type OutcomeEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter, which OutcomeEvents to fetch.
     */
    where?: OutcomeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutcomeEvents to fetch.
     */
    orderBy?: OutcomeEventOrderByWithRelationInput | OutcomeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutcomeEvents.
     */
    cursor?: OutcomeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutcomeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutcomeEvents.
     */
    skip?: number
    distinct?: OutcomeEventScalarFieldEnum | OutcomeEventScalarFieldEnum[]
  }

  /**
   * OutcomeEvent create
   */
  export type OutcomeEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * The data needed to create a OutcomeEvent.
     */
    data: XOR<OutcomeEventCreateInput, OutcomeEventUncheckedCreateInput>
  }

  /**
   * OutcomeEvent createMany
   */
  export type OutcomeEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutcomeEvents.
     */
    data: OutcomeEventCreateManyInput | OutcomeEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutcomeEvent createManyAndReturn
   */
  export type OutcomeEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * The data used to create many OutcomeEvents.
     */
    data: OutcomeEventCreateManyInput | OutcomeEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutcomeEvent update
   */
  export type OutcomeEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * The data needed to update a OutcomeEvent.
     */
    data: XOR<OutcomeEventUpdateInput, OutcomeEventUncheckedUpdateInput>
    /**
     * Choose, which OutcomeEvent to update.
     */
    where: OutcomeEventWhereUniqueInput
  }

  /**
   * OutcomeEvent updateMany
   */
  export type OutcomeEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutcomeEvents.
     */
    data: XOR<OutcomeEventUpdateManyMutationInput, OutcomeEventUncheckedUpdateManyInput>
    /**
     * Filter which OutcomeEvents to update
     */
    where?: OutcomeEventWhereInput
    /**
     * Limit how many OutcomeEvents to update.
     */
    limit?: number
  }

  /**
   * OutcomeEvent updateManyAndReturn
   */
  export type OutcomeEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * The data used to update OutcomeEvents.
     */
    data: XOR<OutcomeEventUpdateManyMutationInput, OutcomeEventUncheckedUpdateManyInput>
    /**
     * Filter which OutcomeEvents to update
     */
    where?: OutcomeEventWhereInput
    /**
     * Limit how many OutcomeEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutcomeEvent upsert
   */
  export type OutcomeEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * The filter to search for the OutcomeEvent to update in case it exists.
     */
    where: OutcomeEventWhereUniqueInput
    /**
     * In case the OutcomeEvent found by the `where` argument doesn't exist, create a new OutcomeEvent with this data.
     */
    create: XOR<OutcomeEventCreateInput, OutcomeEventUncheckedCreateInput>
    /**
     * In case the OutcomeEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutcomeEventUpdateInput, OutcomeEventUncheckedUpdateInput>
  }

  /**
   * OutcomeEvent delete
   */
  export type OutcomeEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
    /**
     * Filter which OutcomeEvent to delete.
     */
    where: OutcomeEventWhereUniqueInput
  }

  /**
   * OutcomeEvent deleteMany
   */
  export type OutcomeEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutcomeEvents to delete
     */
    where?: OutcomeEventWhereInput
    /**
     * Limit how many OutcomeEvents to delete.
     */
    limit?: number
  }

  /**
   * OutcomeEvent.employmentClaim
   */
  export type OutcomeEvent$employmentClaimArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmploymentClaim
     */
    select?: EmploymentClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmploymentClaim
     */
    omit?: EmploymentClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmploymentClaimInclude<ExtArgs> | null
    where?: EmploymentClaimWhereInput
  }

  /**
   * OutcomeEvent without action
   */
  export type OutcomeEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeEvent
     */
    select?: OutcomeEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutcomeEvent
     */
    omit?: OutcomeEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeEventInclude<ExtArgs> | null
  }


  /**
   * Model VerificationRequest
   */

  export type AggregateVerificationRequest = {
    _count: VerificationRequestCountAggregateOutputType | null
    _min: VerificationRequestMinAggregateOutputType | null
    _max: VerificationRequestMaxAggregateOutputType | null
  }

  export type VerificationRequestMinAggregateOutputType = {
    id: string | null
    employmentClaimId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    usedAt: Date | null
    action: string | null
    rejectionReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationRequestMaxAggregateOutputType = {
    id: string | null
    employmentClaimId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    usedAt: Date | null
    action: string | null
    rejectionReason: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationRequestCountAggregateOutputType = {
    id: number
    employmentClaimId: number
    tokenHash: number
    expiresAt: number
    usedAt: number
    action: number
    rejectionReason: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VerificationRequestMinAggregateInputType = {
    id?: true
    employmentClaimId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    action?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationRequestMaxAggregateInputType = {
    id?: true
    employmentClaimId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    action?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationRequestCountAggregateInputType = {
    id?: true
    employmentClaimId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    action?: true
    rejectionReason?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VerificationRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationRequest to aggregate.
     */
    where?: VerificationRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationRequests to fetch.
     */
    orderBy?: VerificationRequestOrderByWithRelationInput | VerificationRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VerificationRequests
    **/
    _count?: true | VerificationRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationRequestMaxAggregateInputType
  }

  export type GetVerificationRequestAggregateType<T extends VerificationRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateVerificationRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerificationRequest[P]>
      : GetScalarType<T[P], AggregateVerificationRequest[P]>
  }




  export type VerificationRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationRequestWhereInput
    orderBy?: VerificationRequestOrderByWithAggregationInput | VerificationRequestOrderByWithAggregationInput[]
    by: VerificationRequestScalarFieldEnum[] | VerificationRequestScalarFieldEnum
    having?: VerificationRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationRequestCountAggregateInputType | true
    _min?: VerificationRequestMinAggregateInputType
    _max?: VerificationRequestMaxAggregateInputType
  }

  export type VerificationRequestGroupByOutputType = {
    id: string
    employmentClaimId: string
    tokenHash: string
    expiresAt: Date
    usedAt: Date | null
    action: string | null
    rejectionReason: string | null
    createdAt: Date
    updatedAt: Date
    _count: VerificationRequestCountAggregateOutputType | null
    _min: VerificationRequestMinAggregateOutputType | null
    _max: VerificationRequestMaxAggregateOutputType | null
  }

  type GetVerificationRequestGroupByPayload<T extends VerificationRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationRequestGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationRequestGroupByOutputType[P]>
        }
      >
    >


  export type VerificationRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employmentClaimId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    action?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verificationRequest"]>

  export type VerificationRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employmentClaimId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    action?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verificationRequest"]>

  export type VerificationRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employmentClaimId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    action?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verificationRequest"]>

  export type VerificationRequestSelectScalar = {
    id?: boolean
    employmentClaimId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    action?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VerificationRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employmentClaimId" | "tokenHash" | "expiresAt" | "usedAt" | "action" | "rejectionReason" | "createdAt" | "updatedAt", ExtArgs["result"]["verificationRequest"]>
  export type VerificationRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }
  export type VerificationRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }
  export type VerificationRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employmentClaim?: boolean | EmploymentClaimDefaultArgs<ExtArgs>
  }

  export type $VerificationRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VerificationRequest"
    objects: {
      employmentClaim: Prisma.$EmploymentClaimPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      employmentClaimId: string
      tokenHash: string
      expiresAt: Date
      usedAt: Date | null
      action: string | null
      rejectionReason: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["verificationRequest"]>
    composites: {}
  }

  type VerificationRequestGetPayload<S extends boolean | null | undefined | VerificationRequestDefaultArgs> = $Result.GetResult<Prisma.$VerificationRequestPayload, S>

  type VerificationRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationRequestCountAggregateInputType | true
    }

  export interface VerificationRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VerificationRequest'], meta: { name: 'VerificationRequest' } }
    /**
     * Find zero or one VerificationRequest that matches the filter.
     * @param {VerificationRequestFindUniqueArgs} args - Arguments to find a VerificationRequest
     * @example
     * // Get one VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationRequestFindUniqueArgs>(args: SelectSubset<T, VerificationRequestFindUniqueArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VerificationRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationRequestFindUniqueOrThrowArgs} args - Arguments to find a VerificationRequest
     * @example
     * // Get one VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestFindFirstArgs} args - Arguments to find a VerificationRequest
     * @example
     * // Get one VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationRequestFindFirstArgs>(args?: SelectSubset<T, VerificationRequestFindFirstArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestFindFirstOrThrowArgs} args - Arguments to find a VerificationRequest
     * @example
     * // Get one VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VerificationRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationRequests
     * const verificationRequests = await prisma.verificationRequest.findMany()
     * 
     * // Get first 10 VerificationRequests
     * const verificationRequests = await prisma.verificationRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const verificationRequestWithIdOnly = await prisma.verificationRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VerificationRequestFindManyArgs>(args?: SelectSubset<T, VerificationRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VerificationRequest.
     * @param {VerificationRequestCreateArgs} args - Arguments to create a VerificationRequest.
     * @example
     * // Create one VerificationRequest
     * const VerificationRequest = await prisma.verificationRequest.create({
     *   data: {
     *     // ... data to create a VerificationRequest
     *   }
     * })
     * 
     */
    create<T extends VerificationRequestCreateArgs>(args: SelectSubset<T, VerificationRequestCreateArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VerificationRequests.
     * @param {VerificationRequestCreateManyArgs} args - Arguments to create many VerificationRequests.
     * @example
     * // Create many VerificationRequests
     * const verificationRequest = await prisma.verificationRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationRequestCreateManyArgs>(args?: SelectSubset<T, VerificationRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VerificationRequests and returns the data saved in the database.
     * @param {VerificationRequestCreateManyAndReturnArgs} args - Arguments to create many VerificationRequests.
     * @example
     * // Create many VerificationRequests
     * const verificationRequest = await prisma.verificationRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VerificationRequests and only return the `id`
     * const verificationRequestWithIdOnly = await prisma.verificationRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VerificationRequest.
     * @param {VerificationRequestDeleteArgs} args - Arguments to delete one VerificationRequest.
     * @example
     * // Delete one VerificationRequest
     * const VerificationRequest = await prisma.verificationRequest.delete({
     *   where: {
     *     // ... filter to delete one VerificationRequest
     *   }
     * })
     * 
     */
    delete<T extends VerificationRequestDeleteArgs>(args: SelectSubset<T, VerificationRequestDeleteArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VerificationRequest.
     * @param {VerificationRequestUpdateArgs} args - Arguments to update one VerificationRequest.
     * @example
     * // Update one VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationRequestUpdateArgs>(args: SelectSubset<T, VerificationRequestUpdateArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VerificationRequests.
     * @param {VerificationRequestDeleteManyArgs} args - Arguments to filter VerificationRequests to delete.
     * @example
     * // Delete a few VerificationRequests
     * const { count } = await prisma.verificationRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationRequestDeleteManyArgs>(args?: SelectSubset<T, VerificationRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationRequests
     * const verificationRequest = await prisma.verificationRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationRequestUpdateManyArgs>(args: SelectSubset<T, VerificationRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationRequests and returns the data updated in the database.
     * @param {VerificationRequestUpdateManyAndReturnArgs} args - Arguments to update many VerificationRequests.
     * @example
     * // Update many VerificationRequests
     * const verificationRequest = await prisma.verificationRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VerificationRequests and only return the `id`
     * const verificationRequestWithIdOnly = await prisma.verificationRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VerificationRequest.
     * @param {VerificationRequestUpsertArgs} args - Arguments to update or create a VerificationRequest.
     * @example
     * // Update or create a VerificationRequest
     * const verificationRequest = await prisma.verificationRequest.upsert({
     *   create: {
     *     // ... data to create a VerificationRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationRequest we want to update
     *   }
     * })
     */
    upsert<T extends VerificationRequestUpsertArgs>(args: SelectSubset<T, VerificationRequestUpsertArgs<ExtArgs>>): Prisma__VerificationRequestClient<$Result.GetResult<Prisma.$VerificationRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VerificationRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestCountArgs} args - Arguments to filter VerificationRequests to count.
     * @example
     * // Count the number of VerificationRequests
     * const count = await prisma.verificationRequest.count({
     *   where: {
     *     // ... the filter for the VerificationRequests we want to count
     *   }
     * })
    **/
    count<T extends VerificationRequestCountArgs>(
      args?: Subset<T, VerificationRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VerificationRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationRequestAggregateArgs>(args: Subset<T, VerificationRequestAggregateArgs>): Prisma.PrismaPromise<GetVerificationRequestAggregateType<T>>

    /**
     * Group by VerificationRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationRequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationRequestGroupByArgs['orderBy'] }
        : { orderBy?: VerificationRequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VerificationRequest model
   */
  readonly fields: VerificationRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VerificationRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employmentClaim<T extends EmploymentClaimDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmploymentClaimDefaultArgs<ExtArgs>>): Prisma__EmploymentClaimClient<$Result.GetResult<Prisma.$EmploymentClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VerificationRequest model
   */
  interface VerificationRequestFieldRefs {
    readonly id: FieldRef<"VerificationRequest", 'String'>
    readonly employmentClaimId: FieldRef<"VerificationRequest", 'String'>
    readonly tokenHash: FieldRef<"VerificationRequest", 'String'>
    readonly expiresAt: FieldRef<"VerificationRequest", 'DateTime'>
    readonly usedAt: FieldRef<"VerificationRequest", 'DateTime'>
    readonly action: FieldRef<"VerificationRequest", 'String'>
    readonly rejectionReason: FieldRef<"VerificationRequest", 'String'>
    readonly createdAt: FieldRef<"VerificationRequest", 'DateTime'>
    readonly updatedAt: FieldRef<"VerificationRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VerificationRequest findUnique
   */
  export type VerificationRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter, which VerificationRequest to fetch.
     */
    where: VerificationRequestWhereUniqueInput
  }

  /**
   * VerificationRequest findUniqueOrThrow
   */
  export type VerificationRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter, which VerificationRequest to fetch.
     */
    where: VerificationRequestWhereUniqueInput
  }

  /**
   * VerificationRequest findFirst
   */
  export type VerificationRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter, which VerificationRequest to fetch.
     */
    where?: VerificationRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationRequests to fetch.
     */
    orderBy?: VerificationRequestOrderByWithRelationInput | VerificationRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationRequests.
     */
    cursor?: VerificationRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationRequests.
     */
    distinct?: VerificationRequestScalarFieldEnum | VerificationRequestScalarFieldEnum[]
  }

  /**
   * VerificationRequest findFirstOrThrow
   */
  export type VerificationRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter, which VerificationRequest to fetch.
     */
    where?: VerificationRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationRequests to fetch.
     */
    orderBy?: VerificationRequestOrderByWithRelationInput | VerificationRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationRequests.
     */
    cursor?: VerificationRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationRequests.
     */
    distinct?: VerificationRequestScalarFieldEnum | VerificationRequestScalarFieldEnum[]
  }

  /**
   * VerificationRequest findMany
   */
  export type VerificationRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter, which VerificationRequests to fetch.
     */
    where?: VerificationRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationRequests to fetch.
     */
    orderBy?: VerificationRequestOrderByWithRelationInput | VerificationRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VerificationRequests.
     */
    cursor?: VerificationRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationRequests.
     */
    skip?: number
    distinct?: VerificationRequestScalarFieldEnum | VerificationRequestScalarFieldEnum[]
  }

  /**
   * VerificationRequest create
   */
  export type VerificationRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a VerificationRequest.
     */
    data: XOR<VerificationRequestCreateInput, VerificationRequestUncheckedCreateInput>
  }

  /**
   * VerificationRequest createMany
   */
  export type VerificationRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationRequests.
     */
    data: VerificationRequestCreateManyInput | VerificationRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationRequest createManyAndReturn
   */
  export type VerificationRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * The data used to create many VerificationRequests.
     */
    data: VerificationRequestCreateManyInput | VerificationRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VerificationRequest update
   */
  export type VerificationRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a VerificationRequest.
     */
    data: XOR<VerificationRequestUpdateInput, VerificationRequestUncheckedUpdateInput>
    /**
     * Choose, which VerificationRequest to update.
     */
    where: VerificationRequestWhereUniqueInput
  }

  /**
   * VerificationRequest updateMany
   */
  export type VerificationRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationRequests.
     */
    data: XOR<VerificationRequestUpdateManyMutationInput, VerificationRequestUncheckedUpdateManyInput>
    /**
     * Filter which VerificationRequests to update
     */
    where?: VerificationRequestWhereInput
    /**
     * Limit how many VerificationRequests to update.
     */
    limit?: number
  }

  /**
   * VerificationRequest updateManyAndReturn
   */
  export type VerificationRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * The data used to update VerificationRequests.
     */
    data: XOR<VerificationRequestUpdateManyMutationInput, VerificationRequestUncheckedUpdateManyInput>
    /**
     * Filter which VerificationRequests to update
     */
    where?: VerificationRequestWhereInput
    /**
     * Limit how many VerificationRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VerificationRequest upsert
   */
  export type VerificationRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the VerificationRequest to update in case it exists.
     */
    where: VerificationRequestWhereUniqueInput
    /**
     * In case the VerificationRequest found by the `where` argument doesn't exist, create a new VerificationRequest with this data.
     */
    create: XOR<VerificationRequestCreateInput, VerificationRequestUncheckedCreateInput>
    /**
     * In case the VerificationRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationRequestUpdateInput, VerificationRequestUncheckedUpdateInput>
  }

  /**
   * VerificationRequest delete
   */
  export type VerificationRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
    /**
     * Filter which VerificationRequest to delete.
     */
    where: VerificationRequestWhereUniqueInput
  }

  /**
   * VerificationRequest deleteMany
   */
  export type VerificationRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationRequests to delete
     */
    where?: VerificationRequestWhereInput
    /**
     * Limit how many VerificationRequests to delete.
     */
    limit?: number
  }

  /**
   * VerificationRequest without action
   */
  export type VerificationRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationRequest
     */
    select?: VerificationRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationRequest
     */
    omit?: VerificationRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerificationRequestInclude<ExtArgs> | null
  }


  /**
   * Model AuditEvent
   */

  export type AggregateAuditEvent = {
    _count: AuditEventCountAggregateOutputType | null
    _min: AuditEventMinAggregateOutputType | null
    _max: AuditEventMaxAggregateOutputType | null
  }

  export type AuditEventMinAggregateOutputType = {
    id: string | null
    entityType: string | null
    entityId: string | null
    action: string | null
    actorType: $Enums.ActorType | null
    actorId: string | null
    createdAt: Date | null
  }

  export type AuditEventMaxAggregateOutputType = {
    id: string | null
    entityType: string | null
    entityId: string | null
    action: string | null
    actorType: $Enums.ActorType | null
    actorId: string | null
    createdAt: Date | null
  }

  export type AuditEventCountAggregateOutputType = {
    id: number
    entityType: number
    entityId: number
    action: number
    actorType: number
    actorId: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type AuditEventMinAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorType?: true
    actorId?: true
    createdAt?: true
  }

  export type AuditEventMaxAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorType?: true
    actorId?: true
    createdAt?: true
  }

  export type AuditEventCountAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    actorType?: true
    actorId?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type AuditEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditEvent to aggregate.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditEvents
    **/
    _count?: true | AuditEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditEventMaxAggregateInputType
  }

  export type GetAuditEventAggregateType<T extends AuditEventAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditEvent[P]>
      : GetScalarType<T[P], AggregateAuditEvent[P]>
  }




  export type AuditEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditEventWhereInput
    orderBy?: AuditEventOrderByWithAggregationInput | AuditEventOrderByWithAggregationInput[]
    by: AuditEventScalarFieldEnum[] | AuditEventScalarFieldEnum
    having?: AuditEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditEventCountAggregateInputType | true
    _min?: AuditEventMinAggregateInputType
    _max?: AuditEventMaxAggregateInputType
  }

  export type AuditEventGroupByOutputType = {
    id: string
    entityType: string
    entityId: string
    action: string
    actorType: $Enums.ActorType
    actorId: string | null
    metadata: JsonValue
    createdAt: Date
    _count: AuditEventCountAggregateOutputType | null
    _min: AuditEventMinAggregateOutputType | null
    _max: AuditEventMaxAggregateOutputType | null
  }

  type GetAuditEventGroupByPayload<T extends AuditEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditEventGroupByOutputType[P]>
            : GetScalarType<T[P], AuditEventGroupByOutputType[P]>
        }
      >
    >


  export type AuditEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["auditEvent"]>

  export type AuditEventSelectScalar = {
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    actorType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type AuditEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "entityType" | "entityId" | "action" | "actorType" | "actorId" | "metadata" | "createdAt", ExtArgs["result"]["auditEvent"]>

  export type $AuditEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entityType: string
      entityId: string
      action: string
      actorType: $Enums.ActorType
      actorId: string | null
      metadata: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["auditEvent"]>
    composites: {}
  }

  type AuditEventGetPayload<S extends boolean | null | undefined | AuditEventDefaultArgs> = $Result.GetResult<Prisma.$AuditEventPayload, S>

  type AuditEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditEventCountAggregateInputType | true
    }

  export interface AuditEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditEvent'], meta: { name: 'AuditEvent' } }
    /**
     * Find zero or one AuditEvent that matches the filter.
     * @param {AuditEventFindUniqueArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditEventFindUniqueArgs>(args: SelectSubset<T, AuditEventFindUniqueArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditEventFindUniqueOrThrowArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditEventFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindFirstArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditEventFindFirstArgs>(args?: SelectSubset<T, AuditEventFindFirstArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindFirstOrThrowArgs} args - Arguments to find a AuditEvent
     * @example
     * // Get one AuditEvent
     * const auditEvent = await prisma.auditEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditEventFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditEvents
     * const auditEvents = await prisma.auditEvent.findMany()
     * 
     * // Get first 10 AuditEvents
     * const auditEvents = await prisma.auditEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditEventFindManyArgs>(args?: SelectSubset<T, AuditEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditEvent.
     * @param {AuditEventCreateArgs} args - Arguments to create a AuditEvent.
     * @example
     * // Create one AuditEvent
     * const AuditEvent = await prisma.auditEvent.create({
     *   data: {
     *     // ... data to create a AuditEvent
     *   }
     * })
     * 
     */
    create<T extends AuditEventCreateArgs>(args: SelectSubset<T, AuditEventCreateArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditEvents.
     * @param {AuditEventCreateManyArgs} args - Arguments to create many AuditEvents.
     * @example
     * // Create many AuditEvents
     * const auditEvent = await prisma.auditEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditEventCreateManyArgs>(args?: SelectSubset<T, AuditEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditEvents and returns the data saved in the database.
     * @param {AuditEventCreateManyAndReturnArgs} args - Arguments to create many AuditEvents.
     * @example
     * // Create many AuditEvents
     * const auditEvent = await prisma.auditEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditEvents and only return the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditEventCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditEvent.
     * @param {AuditEventDeleteArgs} args - Arguments to delete one AuditEvent.
     * @example
     * // Delete one AuditEvent
     * const AuditEvent = await prisma.auditEvent.delete({
     *   where: {
     *     // ... filter to delete one AuditEvent
     *   }
     * })
     * 
     */
    delete<T extends AuditEventDeleteArgs>(args: SelectSubset<T, AuditEventDeleteArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditEvent.
     * @param {AuditEventUpdateArgs} args - Arguments to update one AuditEvent.
     * @example
     * // Update one AuditEvent
     * const auditEvent = await prisma.auditEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditEventUpdateArgs>(args: SelectSubset<T, AuditEventUpdateArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditEvents.
     * @param {AuditEventDeleteManyArgs} args - Arguments to filter AuditEvents to delete.
     * @example
     * // Delete a few AuditEvents
     * const { count } = await prisma.auditEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditEventDeleteManyArgs>(args?: SelectSubset<T, AuditEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditEvents
     * const auditEvent = await prisma.auditEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditEventUpdateManyArgs>(args: SelectSubset<T, AuditEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditEvents and returns the data updated in the database.
     * @param {AuditEventUpdateManyAndReturnArgs} args - Arguments to update many AuditEvents.
     * @example
     * // Update many AuditEvents
     * const auditEvent = await prisma.auditEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditEvents and only return the `id`
     * const auditEventWithIdOnly = await prisma.auditEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditEventUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditEvent.
     * @param {AuditEventUpsertArgs} args - Arguments to update or create a AuditEvent.
     * @example
     * // Update or create a AuditEvent
     * const auditEvent = await prisma.auditEvent.upsert({
     *   create: {
     *     // ... data to create a AuditEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditEvent we want to update
     *   }
     * })
     */
    upsert<T extends AuditEventUpsertArgs>(args: SelectSubset<T, AuditEventUpsertArgs<ExtArgs>>): Prisma__AuditEventClient<$Result.GetResult<Prisma.$AuditEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventCountArgs} args - Arguments to filter AuditEvents to count.
     * @example
     * // Count the number of AuditEvents
     * const count = await prisma.auditEvent.count({
     *   where: {
     *     // ... the filter for the AuditEvents we want to count
     *   }
     * })
    **/
    count<T extends AuditEventCountArgs>(
      args?: Subset<T, AuditEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditEventAggregateArgs>(args: Subset<T, AuditEventAggregateArgs>): Prisma.PrismaPromise<GetAuditEventAggregateType<T>>

    /**
     * Group by AuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditEventGroupByArgs['orderBy'] }
        : { orderBy?: AuditEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditEvent model
   */
  readonly fields: AuditEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditEvent model
   */
  interface AuditEventFieldRefs {
    readonly id: FieldRef<"AuditEvent", 'String'>
    readonly entityType: FieldRef<"AuditEvent", 'String'>
    readonly entityId: FieldRef<"AuditEvent", 'String'>
    readonly action: FieldRef<"AuditEvent", 'String'>
    readonly actorType: FieldRef<"AuditEvent", 'ActorType'>
    readonly actorId: FieldRef<"AuditEvent", 'String'>
    readonly metadata: FieldRef<"AuditEvent", 'Json'>
    readonly createdAt: FieldRef<"AuditEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditEvent findUnique
   */
  export type AuditEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent findUniqueOrThrow
   */
  export type AuditEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent findFirst
   */
  export type AuditEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditEvents.
     */
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent findFirstOrThrow
   */
  export type AuditEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvent to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditEvents.
     */
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent findMany
   */
  export type AuditEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter, which AuditEvents to fetch.
     */
    where?: AuditEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditEvents to fetch.
     */
    orderBy?: AuditEventOrderByWithRelationInput | AuditEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditEvents.
     */
    cursor?: AuditEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditEvents.
     */
    skip?: number
    distinct?: AuditEventScalarFieldEnum | AuditEventScalarFieldEnum[]
  }

  /**
   * AuditEvent create
   */
  export type AuditEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data needed to create a AuditEvent.
     */
    data: XOR<AuditEventCreateInput, AuditEventUncheckedCreateInput>
  }

  /**
   * AuditEvent createMany
   */
  export type AuditEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditEvents.
     */
    data: AuditEventCreateManyInput | AuditEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditEvent createManyAndReturn
   */
  export type AuditEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data used to create many AuditEvents.
     */
    data: AuditEventCreateManyInput | AuditEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditEvent update
   */
  export type AuditEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data needed to update a AuditEvent.
     */
    data: XOR<AuditEventUpdateInput, AuditEventUncheckedUpdateInput>
    /**
     * Choose, which AuditEvent to update.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent updateMany
   */
  export type AuditEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditEvents.
     */
    data: XOR<AuditEventUpdateManyMutationInput, AuditEventUncheckedUpdateManyInput>
    /**
     * Filter which AuditEvents to update
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to update.
     */
    limit?: number
  }

  /**
   * AuditEvent updateManyAndReturn
   */
  export type AuditEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The data used to update AuditEvents.
     */
    data: XOR<AuditEventUpdateManyMutationInput, AuditEventUncheckedUpdateManyInput>
    /**
     * Filter which AuditEvents to update
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to update.
     */
    limit?: number
  }

  /**
   * AuditEvent upsert
   */
  export type AuditEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * The filter to search for the AuditEvent to update in case it exists.
     */
    where: AuditEventWhereUniqueInput
    /**
     * In case the AuditEvent found by the `where` argument doesn't exist, create a new AuditEvent with this data.
     */
    create: XOR<AuditEventCreateInput, AuditEventUncheckedCreateInput>
    /**
     * In case the AuditEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditEventUpdateInput, AuditEventUncheckedUpdateInput>
  }

  /**
   * AuditEvent delete
   */
  export type AuditEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
    /**
     * Filter which AuditEvent to delete.
     */
    where: AuditEventWhereUniqueInput
  }

  /**
   * AuditEvent deleteMany
   */
  export type AuditEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditEvents to delete
     */
    where?: AuditEventWhereInput
    /**
     * Limit how many AuditEvents to delete.
     */
    limit?: number
  }

  /**
   * AuditEvent without action
   */
  export type AuditEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditEvent
     */
    select?: AuditEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditEvent
     */
    omit?: AuditEventOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProgrammeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProgrammeScalarFieldEnum = (typeof ProgrammeScalarFieldEnum)[keyof typeof ProgrammeScalarFieldEnum]


  export const CohortScalarFieldEnum: {
    id: 'id',
    programmeId: 'programmeId',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CohortScalarFieldEnum = (typeof CohortScalarFieldEnum)[keyof typeof CohortScalarFieldEnum]


  export const TraineeScalarFieldEnum: {
    id: 'id',
    publicId: 'publicId',
    fullName: 'fullName',
    phoneE164: 'phoneE164',
    email: 'email',
    district: 'district',
    language: 'language',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TraineeScalarFieldEnum = (typeof TraineeScalarFieldEnum)[keyof typeof TraineeScalarFieldEnum]


  export const EnrolmentScalarFieldEnum: {
    id: 'id',
    traineeId: 'traineeId',
    cohortId: 'cohortId',
    certificationDate: 'certificationDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EnrolmentScalarFieldEnum = (typeof EnrolmentScalarFieldEnum)[keyof typeof EnrolmentScalarFieldEnum]


  export const FollowupEventScalarFieldEnum: {
    id: 'id',
    traineeId: 'traineeId',
    cohortId: 'cohortId',
    checkpointDays: 'checkpointDays',
    status: 'status',
    channel: 'channel',
    sentAt: 'sentAt',
    respondedAt: 'respondedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FollowupEventScalarFieldEnum = (typeof FollowupEventScalarFieldEnum)[keyof typeof FollowupEventScalarFieldEnum]


  export const BotSessionScalarFieldEnum: {
    id: 'id',
    traineeId: 'traineeId',
    followupEventId: 'followupEventId',
    state: 'state',
    currentQuestion: 'currentQuestion',
    collectedData: 'collectedData',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BotSessionScalarFieldEnum = (typeof BotSessionScalarFieldEnum)[keyof typeof BotSessionScalarFieldEnum]


  export const EmploymentClaimScalarFieldEnum: {
    id: 'id',
    traineeId: 'traineeId',
    followupEventId: 'followupEventId',
    employerName: 'employerName',
    role: 'role',
    salaryBand: 'salaryBand',
    nonPlacementReason: 'nonPlacementReason',
    verificationStatus: 'verificationStatus',
    evidenceLevel: 'evidenceLevel',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EmploymentClaimScalarFieldEnum = (typeof EmploymentClaimScalarFieldEnum)[keyof typeof EmploymentClaimScalarFieldEnum]


  export const OutcomeEventScalarFieldEnum: {
    id: 'id',
    traineeId: 'traineeId',
    employmentClaimId: 'employmentClaimId',
    checkpointDays: 'checkpointDays',
    outcomeStatus: 'outcomeStatus',
    verificationStatus: 'verificationStatus',
    source: 'source',
    evidenceLevel: 'evidenceLevel',
    createdAt: 'createdAt'
  };

  export type OutcomeEventScalarFieldEnum = (typeof OutcomeEventScalarFieldEnum)[keyof typeof OutcomeEventScalarFieldEnum]


  export const VerificationRequestScalarFieldEnum: {
    id: 'id',
    employmentClaimId: 'employmentClaimId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    action: 'action',
    rejectionReason: 'rejectionReason',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VerificationRequestScalarFieldEnum = (typeof VerificationRequestScalarFieldEnum)[keyof typeof VerificationRequestScalarFieldEnum]


  export const AuditEventScalarFieldEnum: {
    id: 'id',
    entityType: 'entityType',
    entityId: 'entityId',
    action: 'action',
    actorType: 'actorType',
    actorId: 'actorId',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type AuditEventScalarFieldEnum = (typeof AuditEventScalarFieldEnum)[keyof typeof AuditEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'FollowupStatus'
   */
  export type EnumFollowupStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FollowupStatus'>
    


  /**
   * Reference to a field of type 'FollowupStatus[]'
   */
  export type ListEnumFollowupStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FollowupStatus[]'>
    


  /**
   * Reference to a field of type 'Channel'
   */
  export type EnumChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Channel'>
    


  /**
   * Reference to a field of type 'Channel[]'
   */
  export type ListEnumChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Channel[]'>
    


  /**
   * Reference to a field of type 'BotSessionState'
   */
  export type EnumBotSessionStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BotSessionState'>
    


  /**
   * Reference to a field of type 'BotSessionState[]'
   */
  export type ListEnumBotSessionStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BotSessionState[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'SalaryBand'
   */
  export type EnumSalaryBandFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SalaryBand'>
    


  /**
   * Reference to a field of type 'SalaryBand[]'
   */
  export type ListEnumSalaryBandFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SalaryBand[]'>
    


  /**
   * Reference to a field of type 'NonPlacementReason'
   */
  export type EnumNonPlacementReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NonPlacementReason'>
    


  /**
   * Reference to a field of type 'NonPlacementReason[]'
   */
  export type ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NonPlacementReason[]'>
    


  /**
   * Reference to a field of type 'VerificationStatus'
   */
  export type EnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus'>
    


  /**
   * Reference to a field of type 'VerificationStatus[]'
   */
  export type ListEnumVerificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationStatus[]'>
    


  /**
   * Reference to a field of type 'OutcomeStatus'
   */
  export type EnumOutcomeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutcomeStatus'>
    


  /**
   * Reference to a field of type 'OutcomeStatus[]'
   */
  export type ListEnumOutcomeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutcomeStatus[]'>
    


  /**
   * Reference to a field of type 'ActorType'
   */
  export type EnumActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActorType'>
    


  /**
   * Reference to a field of type 'ActorType[]'
   */
  export type ListEnumActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActorType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ProgrammeWhereInput = {
    AND?: ProgrammeWhereInput | ProgrammeWhereInput[]
    OR?: ProgrammeWhereInput[]
    NOT?: ProgrammeWhereInput | ProgrammeWhereInput[]
    id?: StringFilter<"Programme"> | string
    name?: StringFilter<"Programme"> | string
    code?: StringFilter<"Programme"> | string
    createdAt?: DateTimeFilter<"Programme"> | Date | string
    updatedAt?: DateTimeFilter<"Programme"> | Date | string
    cohorts?: CohortListRelationFilter
  }

  export type ProgrammeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cohorts?: CohortOrderByRelationAggregateInput
  }

  export type ProgrammeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: ProgrammeWhereInput | ProgrammeWhereInput[]
    OR?: ProgrammeWhereInput[]
    NOT?: ProgrammeWhereInput | ProgrammeWhereInput[]
    name?: StringFilter<"Programme"> | string
    createdAt?: DateTimeFilter<"Programme"> | Date | string
    updatedAt?: DateTimeFilter<"Programme"> | Date | string
    cohorts?: CohortListRelationFilter
  }, "id" | "code">

  export type ProgrammeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProgrammeCountOrderByAggregateInput
    _max?: ProgrammeMaxOrderByAggregateInput
    _min?: ProgrammeMinOrderByAggregateInput
  }

  export type ProgrammeScalarWhereWithAggregatesInput = {
    AND?: ProgrammeScalarWhereWithAggregatesInput | ProgrammeScalarWhereWithAggregatesInput[]
    OR?: ProgrammeScalarWhereWithAggregatesInput[]
    NOT?: ProgrammeScalarWhereWithAggregatesInput | ProgrammeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Programme"> | string
    name?: StringWithAggregatesFilter<"Programme"> | string
    code?: StringWithAggregatesFilter<"Programme"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Programme"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Programme"> | Date | string
  }

  export type CohortWhereInput = {
    AND?: CohortWhereInput | CohortWhereInput[]
    OR?: CohortWhereInput[]
    NOT?: CohortWhereInput | CohortWhereInput[]
    id?: StringFilter<"Cohort"> | string
    programmeId?: StringFilter<"Cohort"> | string
    name?: StringFilter<"Cohort"> | string
    startDate?: DateTimeFilter<"Cohort"> | Date | string
    endDate?: DateTimeFilter<"Cohort"> | Date | string
    createdAt?: DateTimeFilter<"Cohort"> | Date | string
    updatedAt?: DateTimeFilter<"Cohort"> | Date | string
    programme?: XOR<ProgrammeScalarRelationFilter, ProgrammeWhereInput>
    enrolments?: EnrolmentListRelationFilter
    followupEvents?: FollowupEventListRelationFilter
  }

  export type CohortOrderByWithRelationInput = {
    id?: SortOrder
    programmeId?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    programme?: ProgrammeOrderByWithRelationInput
    enrolments?: EnrolmentOrderByRelationAggregateInput
    followupEvents?: FollowupEventOrderByRelationAggregateInput
  }

  export type CohortWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CohortWhereInput | CohortWhereInput[]
    OR?: CohortWhereInput[]
    NOT?: CohortWhereInput | CohortWhereInput[]
    programmeId?: StringFilter<"Cohort"> | string
    name?: StringFilter<"Cohort"> | string
    startDate?: DateTimeFilter<"Cohort"> | Date | string
    endDate?: DateTimeFilter<"Cohort"> | Date | string
    createdAt?: DateTimeFilter<"Cohort"> | Date | string
    updatedAt?: DateTimeFilter<"Cohort"> | Date | string
    programme?: XOR<ProgrammeScalarRelationFilter, ProgrammeWhereInput>
    enrolments?: EnrolmentListRelationFilter
    followupEvents?: FollowupEventListRelationFilter
  }, "id">

  export type CohortOrderByWithAggregationInput = {
    id?: SortOrder
    programmeId?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CohortCountOrderByAggregateInput
    _max?: CohortMaxOrderByAggregateInput
    _min?: CohortMinOrderByAggregateInput
  }

  export type CohortScalarWhereWithAggregatesInput = {
    AND?: CohortScalarWhereWithAggregatesInput | CohortScalarWhereWithAggregatesInput[]
    OR?: CohortScalarWhereWithAggregatesInput[]
    NOT?: CohortScalarWhereWithAggregatesInput | CohortScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cohort"> | string
    programmeId?: StringWithAggregatesFilter<"Cohort"> | string
    name?: StringWithAggregatesFilter<"Cohort"> | string
    startDate?: DateTimeWithAggregatesFilter<"Cohort"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Cohort"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Cohort"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Cohort"> | Date | string
  }

  export type TraineeWhereInput = {
    AND?: TraineeWhereInput | TraineeWhereInput[]
    OR?: TraineeWhereInput[]
    NOT?: TraineeWhereInput | TraineeWhereInput[]
    id?: StringFilter<"Trainee"> | string
    publicId?: StringFilter<"Trainee"> | string
    fullName?: StringFilter<"Trainee"> | string
    phoneE164?: StringFilter<"Trainee"> | string
    email?: StringNullableFilter<"Trainee"> | string | null
    district?: StringFilter<"Trainee"> | string
    language?: StringFilter<"Trainee"> | string
    createdAt?: DateTimeFilter<"Trainee"> | Date | string
    updatedAt?: DateTimeFilter<"Trainee"> | Date | string
    enrolments?: EnrolmentListRelationFilter
    followupEvents?: FollowupEventListRelationFilter
    botSessions?: BotSessionListRelationFilter
    employmentClaims?: EmploymentClaimListRelationFilter
    outcomeEvents?: OutcomeEventListRelationFilter
  }

  export type TraineeOrderByWithRelationInput = {
    id?: SortOrder
    publicId?: SortOrder
    fullName?: SortOrder
    phoneE164?: SortOrder
    email?: SortOrderInput | SortOrder
    district?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    enrolments?: EnrolmentOrderByRelationAggregateInput
    followupEvents?: FollowupEventOrderByRelationAggregateInput
    botSessions?: BotSessionOrderByRelationAggregateInput
    employmentClaims?: EmploymentClaimOrderByRelationAggregateInput
    outcomeEvents?: OutcomeEventOrderByRelationAggregateInput
  }

  export type TraineeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    publicId?: string
    phoneE164?: string
    AND?: TraineeWhereInput | TraineeWhereInput[]
    OR?: TraineeWhereInput[]
    NOT?: TraineeWhereInput | TraineeWhereInput[]
    fullName?: StringFilter<"Trainee"> | string
    email?: StringNullableFilter<"Trainee"> | string | null
    district?: StringFilter<"Trainee"> | string
    language?: StringFilter<"Trainee"> | string
    createdAt?: DateTimeFilter<"Trainee"> | Date | string
    updatedAt?: DateTimeFilter<"Trainee"> | Date | string
    enrolments?: EnrolmentListRelationFilter
    followupEvents?: FollowupEventListRelationFilter
    botSessions?: BotSessionListRelationFilter
    employmentClaims?: EmploymentClaimListRelationFilter
    outcomeEvents?: OutcomeEventListRelationFilter
  }, "id" | "publicId" | "phoneE164">

  export type TraineeOrderByWithAggregationInput = {
    id?: SortOrder
    publicId?: SortOrder
    fullName?: SortOrder
    phoneE164?: SortOrder
    email?: SortOrderInput | SortOrder
    district?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TraineeCountOrderByAggregateInput
    _max?: TraineeMaxOrderByAggregateInput
    _min?: TraineeMinOrderByAggregateInput
  }

  export type TraineeScalarWhereWithAggregatesInput = {
    AND?: TraineeScalarWhereWithAggregatesInput | TraineeScalarWhereWithAggregatesInput[]
    OR?: TraineeScalarWhereWithAggregatesInput[]
    NOT?: TraineeScalarWhereWithAggregatesInput | TraineeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trainee"> | string
    publicId?: StringWithAggregatesFilter<"Trainee"> | string
    fullName?: StringWithAggregatesFilter<"Trainee"> | string
    phoneE164?: StringWithAggregatesFilter<"Trainee"> | string
    email?: StringNullableWithAggregatesFilter<"Trainee"> | string | null
    district?: StringWithAggregatesFilter<"Trainee"> | string
    language?: StringWithAggregatesFilter<"Trainee"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Trainee"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Trainee"> | Date | string
  }

  export type EnrolmentWhereInput = {
    AND?: EnrolmentWhereInput | EnrolmentWhereInput[]
    OR?: EnrolmentWhereInput[]
    NOT?: EnrolmentWhereInput | EnrolmentWhereInput[]
    id?: StringFilter<"Enrolment"> | string
    traineeId?: StringFilter<"Enrolment"> | string
    cohortId?: StringFilter<"Enrolment"> | string
    certificationDate?: DateTimeFilter<"Enrolment"> | Date | string
    createdAt?: DateTimeFilter<"Enrolment"> | Date | string
    updatedAt?: DateTimeFilter<"Enrolment"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    cohort?: XOR<CohortScalarRelationFilter, CohortWhereInput>
  }

  export type EnrolmentOrderByWithRelationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    certificationDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    trainee?: TraineeOrderByWithRelationInput
    cohort?: CohortOrderByWithRelationInput
  }

  export type EnrolmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    traineeId_cohortId?: EnrolmentTraineeIdCohortIdCompoundUniqueInput
    AND?: EnrolmentWhereInput | EnrolmentWhereInput[]
    OR?: EnrolmentWhereInput[]
    NOT?: EnrolmentWhereInput | EnrolmentWhereInput[]
    traineeId?: StringFilter<"Enrolment"> | string
    cohortId?: StringFilter<"Enrolment"> | string
    certificationDate?: DateTimeFilter<"Enrolment"> | Date | string
    createdAt?: DateTimeFilter<"Enrolment"> | Date | string
    updatedAt?: DateTimeFilter<"Enrolment"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    cohort?: XOR<CohortScalarRelationFilter, CohortWhereInput>
  }, "id" | "traineeId_cohortId">

  export type EnrolmentOrderByWithAggregationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    certificationDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EnrolmentCountOrderByAggregateInput
    _max?: EnrolmentMaxOrderByAggregateInput
    _min?: EnrolmentMinOrderByAggregateInput
  }

  export type EnrolmentScalarWhereWithAggregatesInput = {
    AND?: EnrolmentScalarWhereWithAggregatesInput | EnrolmentScalarWhereWithAggregatesInput[]
    OR?: EnrolmentScalarWhereWithAggregatesInput[]
    NOT?: EnrolmentScalarWhereWithAggregatesInput | EnrolmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Enrolment"> | string
    traineeId?: StringWithAggregatesFilter<"Enrolment"> | string
    cohortId?: StringWithAggregatesFilter<"Enrolment"> | string
    certificationDate?: DateTimeWithAggregatesFilter<"Enrolment"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Enrolment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Enrolment"> | Date | string
  }

  export type FollowupEventWhereInput = {
    AND?: FollowupEventWhereInput | FollowupEventWhereInput[]
    OR?: FollowupEventWhereInput[]
    NOT?: FollowupEventWhereInput | FollowupEventWhereInput[]
    id?: StringFilter<"FollowupEvent"> | string
    traineeId?: StringFilter<"FollowupEvent"> | string
    cohortId?: StringFilter<"FollowupEvent"> | string
    checkpointDays?: IntFilter<"FollowupEvent"> | number
    status?: EnumFollowupStatusFilter<"FollowupEvent"> | $Enums.FollowupStatus
    channel?: EnumChannelFilter<"FollowupEvent"> | $Enums.Channel
    sentAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    respondedAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"FollowupEvent"> | Date | string
    updatedAt?: DateTimeFilter<"FollowupEvent"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    cohort?: XOR<CohortScalarRelationFilter, CohortWhereInput>
    botSessions?: BotSessionListRelationFilter
    employmentClaims?: EmploymentClaimListRelationFilter
  }

  export type FollowupEventOrderByWithRelationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    checkpointDays?: SortOrder
    status?: SortOrder
    channel?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    respondedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    trainee?: TraineeOrderByWithRelationInput
    cohort?: CohortOrderByWithRelationInput
    botSessions?: BotSessionOrderByRelationAggregateInput
    employmentClaims?: EmploymentClaimOrderByRelationAggregateInput
  }

  export type FollowupEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FollowupEventWhereInput | FollowupEventWhereInput[]
    OR?: FollowupEventWhereInput[]
    NOT?: FollowupEventWhereInput | FollowupEventWhereInput[]
    traineeId?: StringFilter<"FollowupEvent"> | string
    cohortId?: StringFilter<"FollowupEvent"> | string
    checkpointDays?: IntFilter<"FollowupEvent"> | number
    status?: EnumFollowupStatusFilter<"FollowupEvent"> | $Enums.FollowupStatus
    channel?: EnumChannelFilter<"FollowupEvent"> | $Enums.Channel
    sentAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    respondedAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"FollowupEvent"> | Date | string
    updatedAt?: DateTimeFilter<"FollowupEvent"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    cohort?: XOR<CohortScalarRelationFilter, CohortWhereInput>
    botSessions?: BotSessionListRelationFilter
    employmentClaims?: EmploymentClaimListRelationFilter
  }, "id">

  export type FollowupEventOrderByWithAggregationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    checkpointDays?: SortOrder
    status?: SortOrder
    channel?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    respondedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FollowupEventCountOrderByAggregateInput
    _avg?: FollowupEventAvgOrderByAggregateInput
    _max?: FollowupEventMaxOrderByAggregateInput
    _min?: FollowupEventMinOrderByAggregateInput
    _sum?: FollowupEventSumOrderByAggregateInput
  }

  export type FollowupEventScalarWhereWithAggregatesInput = {
    AND?: FollowupEventScalarWhereWithAggregatesInput | FollowupEventScalarWhereWithAggregatesInput[]
    OR?: FollowupEventScalarWhereWithAggregatesInput[]
    NOT?: FollowupEventScalarWhereWithAggregatesInput | FollowupEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FollowupEvent"> | string
    traineeId?: StringWithAggregatesFilter<"FollowupEvent"> | string
    cohortId?: StringWithAggregatesFilter<"FollowupEvent"> | string
    checkpointDays?: IntWithAggregatesFilter<"FollowupEvent"> | number
    status?: EnumFollowupStatusWithAggregatesFilter<"FollowupEvent"> | $Enums.FollowupStatus
    channel?: EnumChannelWithAggregatesFilter<"FollowupEvent"> | $Enums.Channel
    sentAt?: DateTimeNullableWithAggregatesFilter<"FollowupEvent"> | Date | string | null
    respondedAt?: DateTimeNullableWithAggregatesFilter<"FollowupEvent"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FollowupEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FollowupEvent"> | Date | string
  }

  export type BotSessionWhereInput = {
    AND?: BotSessionWhereInput | BotSessionWhereInput[]
    OR?: BotSessionWhereInput[]
    NOT?: BotSessionWhereInput | BotSessionWhereInput[]
    id?: StringFilter<"BotSession"> | string
    traineeId?: StringFilter<"BotSession"> | string
    followupEventId?: StringFilter<"BotSession"> | string
    state?: EnumBotSessionStateFilter<"BotSession"> | $Enums.BotSessionState
    currentQuestion?: StringNullableFilter<"BotSession"> | string | null
    collectedData?: JsonFilter<"BotSession">
    expiresAt?: DateTimeFilter<"BotSession"> | Date | string
    createdAt?: DateTimeFilter<"BotSession"> | Date | string
    updatedAt?: DateTimeFilter<"BotSession"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    followupEvent?: XOR<FollowupEventScalarRelationFilter, FollowupEventWhereInput>
  }

  export type BotSessionOrderByWithRelationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    state?: SortOrder
    currentQuestion?: SortOrderInput | SortOrder
    collectedData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    trainee?: TraineeOrderByWithRelationInput
    followupEvent?: FollowupEventOrderByWithRelationInput
  }

  export type BotSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BotSessionWhereInput | BotSessionWhereInput[]
    OR?: BotSessionWhereInput[]
    NOT?: BotSessionWhereInput | BotSessionWhereInput[]
    traineeId?: StringFilter<"BotSession"> | string
    followupEventId?: StringFilter<"BotSession"> | string
    state?: EnumBotSessionStateFilter<"BotSession"> | $Enums.BotSessionState
    currentQuestion?: StringNullableFilter<"BotSession"> | string | null
    collectedData?: JsonFilter<"BotSession">
    expiresAt?: DateTimeFilter<"BotSession"> | Date | string
    createdAt?: DateTimeFilter<"BotSession"> | Date | string
    updatedAt?: DateTimeFilter<"BotSession"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    followupEvent?: XOR<FollowupEventScalarRelationFilter, FollowupEventWhereInput>
  }, "id">

  export type BotSessionOrderByWithAggregationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    state?: SortOrder
    currentQuestion?: SortOrderInput | SortOrder
    collectedData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BotSessionCountOrderByAggregateInput
    _max?: BotSessionMaxOrderByAggregateInput
    _min?: BotSessionMinOrderByAggregateInput
  }

  export type BotSessionScalarWhereWithAggregatesInput = {
    AND?: BotSessionScalarWhereWithAggregatesInput | BotSessionScalarWhereWithAggregatesInput[]
    OR?: BotSessionScalarWhereWithAggregatesInput[]
    NOT?: BotSessionScalarWhereWithAggregatesInput | BotSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BotSession"> | string
    traineeId?: StringWithAggregatesFilter<"BotSession"> | string
    followupEventId?: StringWithAggregatesFilter<"BotSession"> | string
    state?: EnumBotSessionStateWithAggregatesFilter<"BotSession"> | $Enums.BotSessionState
    currentQuestion?: StringNullableWithAggregatesFilter<"BotSession"> | string | null
    collectedData?: JsonWithAggregatesFilter<"BotSession">
    expiresAt?: DateTimeWithAggregatesFilter<"BotSession"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"BotSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BotSession"> | Date | string
  }

  export type EmploymentClaimWhereInput = {
    AND?: EmploymentClaimWhereInput | EmploymentClaimWhereInput[]
    OR?: EmploymentClaimWhereInput[]
    NOT?: EmploymentClaimWhereInput | EmploymentClaimWhereInput[]
    id?: StringFilter<"EmploymentClaim"> | string
    traineeId?: StringFilter<"EmploymentClaim"> | string
    followupEventId?: StringFilter<"EmploymentClaim"> | string
    employerName?: StringNullableFilter<"EmploymentClaim"> | string | null
    role?: StringNullableFilter<"EmploymentClaim"> | string | null
    salaryBand?: EnumSalaryBandNullableFilter<"EmploymentClaim"> | $Enums.SalaryBand | null
    nonPlacementReason?: EnumNonPlacementReasonNullableFilter<"EmploymentClaim"> | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFilter<"EmploymentClaim"> | $Enums.VerificationStatus
    evidenceLevel?: IntFilter<"EmploymentClaim"> | number
    createdAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
    updatedAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    followupEvent?: XOR<FollowupEventScalarRelationFilter, FollowupEventWhereInput>
    verificationRequests?: VerificationRequestListRelationFilter
    outcomeEvents?: OutcomeEventListRelationFilter
  }

  export type EmploymentClaimOrderByWithRelationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    employerName?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    salaryBand?: SortOrderInput | SortOrder
    nonPlacementReason?: SortOrderInput | SortOrder
    verificationStatus?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    trainee?: TraineeOrderByWithRelationInput
    followupEvent?: FollowupEventOrderByWithRelationInput
    verificationRequests?: VerificationRequestOrderByRelationAggregateInput
    outcomeEvents?: OutcomeEventOrderByRelationAggregateInput
  }

  export type EmploymentClaimWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmploymentClaimWhereInput | EmploymentClaimWhereInput[]
    OR?: EmploymentClaimWhereInput[]
    NOT?: EmploymentClaimWhereInput | EmploymentClaimWhereInput[]
    traineeId?: StringFilter<"EmploymentClaim"> | string
    followupEventId?: StringFilter<"EmploymentClaim"> | string
    employerName?: StringNullableFilter<"EmploymentClaim"> | string | null
    role?: StringNullableFilter<"EmploymentClaim"> | string | null
    salaryBand?: EnumSalaryBandNullableFilter<"EmploymentClaim"> | $Enums.SalaryBand | null
    nonPlacementReason?: EnumNonPlacementReasonNullableFilter<"EmploymentClaim"> | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFilter<"EmploymentClaim"> | $Enums.VerificationStatus
    evidenceLevel?: IntFilter<"EmploymentClaim"> | number
    createdAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
    updatedAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    followupEvent?: XOR<FollowupEventScalarRelationFilter, FollowupEventWhereInput>
    verificationRequests?: VerificationRequestListRelationFilter
    outcomeEvents?: OutcomeEventListRelationFilter
  }, "id">

  export type EmploymentClaimOrderByWithAggregationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    employerName?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    salaryBand?: SortOrderInput | SortOrder
    nonPlacementReason?: SortOrderInput | SortOrder
    verificationStatus?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EmploymentClaimCountOrderByAggregateInput
    _avg?: EmploymentClaimAvgOrderByAggregateInput
    _max?: EmploymentClaimMaxOrderByAggregateInput
    _min?: EmploymentClaimMinOrderByAggregateInput
    _sum?: EmploymentClaimSumOrderByAggregateInput
  }

  export type EmploymentClaimScalarWhereWithAggregatesInput = {
    AND?: EmploymentClaimScalarWhereWithAggregatesInput | EmploymentClaimScalarWhereWithAggregatesInput[]
    OR?: EmploymentClaimScalarWhereWithAggregatesInput[]
    NOT?: EmploymentClaimScalarWhereWithAggregatesInput | EmploymentClaimScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmploymentClaim"> | string
    traineeId?: StringWithAggregatesFilter<"EmploymentClaim"> | string
    followupEventId?: StringWithAggregatesFilter<"EmploymentClaim"> | string
    employerName?: StringNullableWithAggregatesFilter<"EmploymentClaim"> | string | null
    role?: StringNullableWithAggregatesFilter<"EmploymentClaim"> | string | null
    salaryBand?: EnumSalaryBandNullableWithAggregatesFilter<"EmploymentClaim"> | $Enums.SalaryBand | null
    nonPlacementReason?: EnumNonPlacementReasonNullableWithAggregatesFilter<"EmploymentClaim"> | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusWithAggregatesFilter<"EmploymentClaim"> | $Enums.VerificationStatus
    evidenceLevel?: IntWithAggregatesFilter<"EmploymentClaim"> | number
    createdAt?: DateTimeWithAggregatesFilter<"EmploymentClaim"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"EmploymentClaim"> | Date | string
  }

  export type OutcomeEventWhereInput = {
    AND?: OutcomeEventWhereInput | OutcomeEventWhereInput[]
    OR?: OutcomeEventWhereInput[]
    NOT?: OutcomeEventWhereInput | OutcomeEventWhereInput[]
    id?: StringFilter<"OutcomeEvent"> | string
    traineeId?: StringFilter<"OutcomeEvent"> | string
    employmentClaimId?: StringNullableFilter<"OutcomeEvent"> | string | null
    checkpointDays?: IntFilter<"OutcomeEvent"> | number
    outcomeStatus?: EnumOutcomeStatusFilter<"OutcomeEvent"> | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFilter<"OutcomeEvent"> | $Enums.VerificationStatus
    source?: StringFilter<"OutcomeEvent"> | string
    evidenceLevel?: IntFilter<"OutcomeEvent"> | number
    createdAt?: DateTimeFilter<"OutcomeEvent"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    employmentClaim?: XOR<EmploymentClaimNullableScalarRelationFilter, EmploymentClaimWhereInput> | null
  }

  export type OutcomeEventOrderByWithRelationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    employmentClaimId?: SortOrderInput | SortOrder
    checkpointDays?: SortOrder
    outcomeStatus?: SortOrder
    verificationStatus?: SortOrder
    source?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    trainee?: TraineeOrderByWithRelationInput
    employmentClaim?: EmploymentClaimOrderByWithRelationInput
  }

  export type OutcomeEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutcomeEventWhereInput | OutcomeEventWhereInput[]
    OR?: OutcomeEventWhereInput[]
    NOT?: OutcomeEventWhereInput | OutcomeEventWhereInput[]
    traineeId?: StringFilter<"OutcomeEvent"> | string
    employmentClaimId?: StringNullableFilter<"OutcomeEvent"> | string | null
    checkpointDays?: IntFilter<"OutcomeEvent"> | number
    outcomeStatus?: EnumOutcomeStatusFilter<"OutcomeEvent"> | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFilter<"OutcomeEvent"> | $Enums.VerificationStatus
    source?: StringFilter<"OutcomeEvent"> | string
    evidenceLevel?: IntFilter<"OutcomeEvent"> | number
    createdAt?: DateTimeFilter<"OutcomeEvent"> | Date | string
    trainee?: XOR<TraineeScalarRelationFilter, TraineeWhereInput>
    employmentClaim?: XOR<EmploymentClaimNullableScalarRelationFilter, EmploymentClaimWhereInput> | null
  }, "id">

  export type OutcomeEventOrderByWithAggregationInput = {
    id?: SortOrder
    traineeId?: SortOrder
    employmentClaimId?: SortOrderInput | SortOrder
    checkpointDays?: SortOrder
    outcomeStatus?: SortOrder
    verificationStatus?: SortOrder
    source?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    _count?: OutcomeEventCountOrderByAggregateInput
    _avg?: OutcomeEventAvgOrderByAggregateInput
    _max?: OutcomeEventMaxOrderByAggregateInput
    _min?: OutcomeEventMinOrderByAggregateInput
    _sum?: OutcomeEventSumOrderByAggregateInput
  }

  export type OutcomeEventScalarWhereWithAggregatesInput = {
    AND?: OutcomeEventScalarWhereWithAggregatesInput | OutcomeEventScalarWhereWithAggregatesInput[]
    OR?: OutcomeEventScalarWhereWithAggregatesInput[]
    NOT?: OutcomeEventScalarWhereWithAggregatesInput | OutcomeEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OutcomeEvent"> | string
    traineeId?: StringWithAggregatesFilter<"OutcomeEvent"> | string
    employmentClaimId?: StringNullableWithAggregatesFilter<"OutcomeEvent"> | string | null
    checkpointDays?: IntWithAggregatesFilter<"OutcomeEvent"> | number
    outcomeStatus?: EnumOutcomeStatusWithAggregatesFilter<"OutcomeEvent"> | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusWithAggregatesFilter<"OutcomeEvent"> | $Enums.VerificationStatus
    source?: StringWithAggregatesFilter<"OutcomeEvent"> | string
    evidenceLevel?: IntWithAggregatesFilter<"OutcomeEvent"> | number
    createdAt?: DateTimeWithAggregatesFilter<"OutcomeEvent"> | Date | string
  }

  export type VerificationRequestWhereInput = {
    AND?: VerificationRequestWhereInput | VerificationRequestWhereInput[]
    OR?: VerificationRequestWhereInput[]
    NOT?: VerificationRequestWhereInput | VerificationRequestWhereInput[]
    id?: StringFilter<"VerificationRequest"> | string
    employmentClaimId?: StringFilter<"VerificationRequest"> | string
    tokenHash?: StringFilter<"VerificationRequest"> | string
    expiresAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    usedAt?: DateTimeNullableFilter<"VerificationRequest"> | Date | string | null
    action?: StringNullableFilter<"VerificationRequest"> | string | null
    rejectionReason?: StringNullableFilter<"VerificationRequest"> | string | null
    createdAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    updatedAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    employmentClaim?: XOR<EmploymentClaimScalarRelationFilter, EmploymentClaimWhereInput>
  }

  export type VerificationRequestOrderByWithRelationInput = {
    id?: SortOrder
    employmentClaimId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    action?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    employmentClaim?: EmploymentClaimOrderByWithRelationInput
  }

  export type VerificationRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tokenHash?: string
    AND?: VerificationRequestWhereInput | VerificationRequestWhereInput[]
    OR?: VerificationRequestWhereInput[]
    NOT?: VerificationRequestWhereInput | VerificationRequestWhereInput[]
    employmentClaimId?: StringFilter<"VerificationRequest"> | string
    expiresAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    usedAt?: DateTimeNullableFilter<"VerificationRequest"> | Date | string | null
    action?: StringNullableFilter<"VerificationRequest"> | string | null
    rejectionReason?: StringNullableFilter<"VerificationRequest"> | string | null
    createdAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    updatedAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    employmentClaim?: XOR<EmploymentClaimScalarRelationFilter, EmploymentClaimWhereInput>
  }, "id" | "tokenHash">

  export type VerificationRequestOrderByWithAggregationInput = {
    id?: SortOrder
    employmentClaimId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    action?: SortOrderInput | SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VerificationRequestCountOrderByAggregateInput
    _max?: VerificationRequestMaxOrderByAggregateInput
    _min?: VerificationRequestMinOrderByAggregateInput
  }

  export type VerificationRequestScalarWhereWithAggregatesInput = {
    AND?: VerificationRequestScalarWhereWithAggregatesInput | VerificationRequestScalarWhereWithAggregatesInput[]
    OR?: VerificationRequestScalarWhereWithAggregatesInput[]
    NOT?: VerificationRequestScalarWhereWithAggregatesInput | VerificationRequestScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"VerificationRequest"> | string
    employmentClaimId?: StringWithAggregatesFilter<"VerificationRequest"> | string
    tokenHash?: StringWithAggregatesFilter<"VerificationRequest"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"VerificationRequest"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"VerificationRequest"> | Date | string | null
    action?: StringNullableWithAggregatesFilter<"VerificationRequest"> | string | null
    rejectionReason?: StringNullableWithAggregatesFilter<"VerificationRequest"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"VerificationRequest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"VerificationRequest"> | Date | string
  }

  export type AuditEventWhereInput = {
    AND?: AuditEventWhereInput | AuditEventWhereInput[]
    OR?: AuditEventWhereInput[]
    NOT?: AuditEventWhereInput | AuditEventWhereInput[]
    id?: StringFilter<"AuditEvent"> | string
    entityType?: StringFilter<"AuditEvent"> | string
    entityId?: StringFilter<"AuditEvent"> | string
    action?: StringFilter<"AuditEvent"> | string
    actorType?: EnumActorTypeFilter<"AuditEvent"> | $Enums.ActorType
    actorId?: StringNullableFilter<"AuditEvent"> | string | null
    metadata?: JsonFilter<"AuditEvent">
    createdAt?: DateTimeFilter<"AuditEvent"> | Date | string
  }

  export type AuditEventOrderByWithRelationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditEventWhereInput | AuditEventWhereInput[]
    OR?: AuditEventWhereInput[]
    NOT?: AuditEventWhereInput | AuditEventWhereInput[]
    entityType?: StringFilter<"AuditEvent"> | string
    entityId?: StringFilter<"AuditEvent"> | string
    action?: StringFilter<"AuditEvent"> | string
    actorType?: EnumActorTypeFilter<"AuditEvent"> | $Enums.ActorType
    actorId?: StringNullableFilter<"AuditEvent"> | string | null
    metadata?: JsonFilter<"AuditEvent">
    createdAt?: DateTimeFilter<"AuditEvent"> | Date | string
  }, "id">

  export type AuditEventOrderByWithAggregationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    _count?: AuditEventCountOrderByAggregateInput
    _max?: AuditEventMaxOrderByAggregateInput
    _min?: AuditEventMinOrderByAggregateInput
  }

  export type AuditEventScalarWhereWithAggregatesInput = {
    AND?: AuditEventScalarWhereWithAggregatesInput | AuditEventScalarWhereWithAggregatesInput[]
    OR?: AuditEventScalarWhereWithAggregatesInput[]
    NOT?: AuditEventScalarWhereWithAggregatesInput | AuditEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditEvent"> | string
    entityType?: StringWithAggregatesFilter<"AuditEvent"> | string
    entityId?: StringWithAggregatesFilter<"AuditEvent"> | string
    action?: StringWithAggregatesFilter<"AuditEvent"> | string
    actorType?: EnumActorTypeWithAggregatesFilter<"AuditEvent"> | $Enums.ActorType
    actorId?: StringNullableWithAggregatesFilter<"AuditEvent"> | string | null
    metadata?: JsonWithAggregatesFilter<"AuditEvent">
    createdAt?: DateTimeWithAggregatesFilter<"AuditEvent"> | Date | string
  }

  export type ProgrammeCreateInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cohorts?: CohortCreateNestedManyWithoutProgrammeInput
  }

  export type ProgrammeUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cohorts?: CohortUncheckedCreateNestedManyWithoutProgrammeInput
  }

  export type ProgrammeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cohorts?: CohortUpdateManyWithoutProgrammeNestedInput
  }

  export type ProgrammeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cohorts?: CohortUncheckedUpdateManyWithoutProgrammeNestedInput
  }

  export type ProgrammeCreateManyInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgrammeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgrammeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CohortCreateInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    programme: ProgrammeCreateNestedOneWithoutCohortsInput
    enrolments?: EnrolmentCreateNestedManyWithoutCohortInput
    followupEvents?: FollowupEventCreateNestedManyWithoutCohortInput
  }

  export type CohortUncheckedCreateInput = {
    id?: string
    programmeId: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutCohortInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutCohortInput
  }

  export type CohortUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    programme?: ProgrammeUpdateOneRequiredWithoutCohortsNestedInput
    enrolments?: EnrolmentUpdateManyWithoutCohortNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutCohortNestedInput
  }

  export type CohortUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    programmeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutCohortNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutCohortNestedInput
  }

  export type CohortCreateManyInput = {
    id?: string
    programmeId: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CohortUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CohortUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    programmeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TraineeCreateInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUncheckedUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeCreateManyInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TraineeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TraineeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentCreateInput = {
    id?: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEnrolmentsInput
    cohort: CohortCreateNestedOneWithoutEnrolmentsInput
  }

  export type EnrolmentUncheckedCreateInput = {
    id?: string
    traineeId: string
    cohortId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EnrolmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEnrolmentsNestedInput
    cohort?: CohortUpdateOneRequiredWithoutEnrolmentsNestedInput
  }

  export type EnrolmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentCreateManyInput = {
    id?: string
    traineeId: string
    cohortId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EnrolmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowupEventCreateInput = {
    id?: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutFollowupEventsInput
    cohort: CohortCreateNestedOneWithoutFollowupEventsInput
    botSessions?: BotSessionCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUncheckedCreateInput = {
    id?: string
    traineeId: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutFollowupEventsNestedInput
    cohort?: CohortUpdateOneRequiredWithoutFollowupEventsNestedInput
    botSessions?: BotSessionUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    botSessions?: BotSessionUncheckedUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventCreateManyInput = {
    id?: string
    traineeId: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FollowupEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowupEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionCreateInput = {
    id?: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutBotSessionsInput
    followupEvent: FollowupEventCreateNestedOneWithoutBotSessionsInput
  }

  export type BotSessionUncheckedCreateInput = {
    id?: string
    traineeId: string
    followupEventId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutBotSessionsNestedInput
    followupEvent?: FollowupEventUpdateOneRequiredWithoutBotSessionsNestedInput
  }

  export type BotSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionCreateManyInput = {
    id?: string
    traineeId: string
    followupEventId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmploymentClaimCreateInput = {
    id?: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEmploymentClaimsInput
    followupEvent: FollowupEventCreateNestedOneWithoutEmploymentClaimsInput
    verificationRequests?: VerificationRequestCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUncheckedCreateInput = {
    id?: string
    traineeId: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    verificationRequests?: VerificationRequestUncheckedCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    followupEvent?: FollowupEventUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    verificationRequests?: VerificationRequestUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verificationRequests?: VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimCreateManyInput = {
    id?: string
    traineeId: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmploymentClaimUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmploymentClaimUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventCreateInput = {
    id?: string
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutOutcomeEventsInput
    employmentClaim?: EmploymentClaimCreateNestedOneWithoutOutcomeEventsInput
  }

  export type OutcomeEventUncheckedCreateInput = {
    id?: string
    traineeId: string
    employmentClaimId?: string | null
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type OutcomeEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutOutcomeEventsNestedInput
    employmentClaim?: EmploymentClaimUpdateOneWithoutOutcomeEventsNestedInput
  }

  export type OutcomeEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: NullableStringFieldUpdateOperationsInput | string | null
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventCreateManyInput = {
    id?: string
    traineeId: string
    employmentClaimId?: string | null
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type OutcomeEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: NullableStringFieldUpdateOperationsInput | string | null
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestCreateInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    employmentClaim: EmploymentClaimCreateNestedOneWithoutVerificationRequestsInput
  }

  export type VerificationRequestUncheckedCreateInput = {
    id?: string
    employmentClaimId: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationRequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employmentClaim?: EmploymentClaimUpdateOneRequiredWithoutVerificationRequestsNestedInput
  }

  export type VerificationRequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestCreateManyInput = {
    id?: string
    employmentClaimId: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationRequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventCreateInput = {
    id?: string
    entityType: string
    entityId: string
    action: string
    actorType: $Enums.ActorType
    actorId?: string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditEventUncheckedCreateInput = {
    id?: string
    entityType: string
    entityId: string
    action: string
    actorType: $Enums.ActorType
    actorId?: string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorType?: EnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorType?: EnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventCreateManyInput = {
    id?: string
    entityType: string
    entityId: string
    action: string
    actorType: $Enums.ActorType
    actorId?: string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorType?: EnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    actorType?: EnumActorTypeFieldUpdateOperationsInput | $Enums.ActorType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CohortListRelationFilter = {
    every?: CohortWhereInput
    some?: CohortWhereInput
    none?: CohortWhereInput
  }

  export type CohortOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProgrammeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProgrammeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProgrammeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ProgrammeScalarRelationFilter = {
    is?: ProgrammeWhereInput
    isNot?: ProgrammeWhereInput
  }

  export type EnrolmentListRelationFilter = {
    every?: EnrolmentWhereInput
    some?: EnrolmentWhereInput
    none?: EnrolmentWhereInput
  }

  export type FollowupEventListRelationFilter = {
    every?: FollowupEventWhereInput
    some?: FollowupEventWhereInput
    none?: FollowupEventWhereInput
  }

  export type EnrolmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FollowupEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CohortCountOrderByAggregateInput = {
    id?: SortOrder
    programmeId?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CohortMaxOrderByAggregateInput = {
    id?: SortOrder
    programmeId?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CohortMinOrderByAggregateInput = {
    id?: SortOrder
    programmeId?: SortOrder
    name?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BotSessionListRelationFilter = {
    every?: BotSessionWhereInput
    some?: BotSessionWhereInput
    none?: BotSessionWhereInput
  }

  export type EmploymentClaimListRelationFilter = {
    every?: EmploymentClaimWhereInput
    some?: EmploymentClaimWhereInput
    none?: EmploymentClaimWhereInput
  }

  export type OutcomeEventListRelationFilter = {
    every?: OutcomeEventWhereInput
    some?: OutcomeEventWhereInput
    none?: OutcomeEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BotSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmploymentClaimOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutcomeEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TraineeCountOrderByAggregateInput = {
    id?: SortOrder
    publicId?: SortOrder
    fullName?: SortOrder
    phoneE164?: SortOrder
    email?: SortOrder
    district?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TraineeMaxOrderByAggregateInput = {
    id?: SortOrder
    publicId?: SortOrder
    fullName?: SortOrder
    phoneE164?: SortOrder
    email?: SortOrder
    district?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TraineeMinOrderByAggregateInput = {
    id?: SortOrder
    publicId?: SortOrder
    fullName?: SortOrder
    phoneE164?: SortOrder
    email?: SortOrder
    district?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type TraineeScalarRelationFilter = {
    is?: TraineeWhereInput
    isNot?: TraineeWhereInput
  }

  export type CohortScalarRelationFilter = {
    is?: CohortWhereInput
    isNot?: CohortWhereInput
  }

  export type EnrolmentTraineeIdCohortIdCompoundUniqueInput = {
    traineeId: string
    cohortId: string
  }

  export type EnrolmentCountOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    certificationDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnrolmentMaxOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    certificationDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnrolmentMinOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    certificationDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumFollowupStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FollowupStatus | EnumFollowupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFollowupStatusFilter<$PrismaModel> | $Enums.FollowupStatus
  }

  export type EnumChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelFilter<$PrismaModel> | $Enums.Channel
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FollowupEventCountOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    checkpointDays?: SortOrder
    status?: SortOrder
    channel?: SortOrder
    sentAt?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FollowupEventAvgOrderByAggregateInput = {
    checkpointDays?: SortOrder
  }

  export type FollowupEventMaxOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    checkpointDays?: SortOrder
    status?: SortOrder
    channel?: SortOrder
    sentAt?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FollowupEventMinOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    cohortId?: SortOrder
    checkpointDays?: SortOrder
    status?: SortOrder
    channel?: SortOrder
    sentAt?: SortOrder
    respondedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FollowupEventSumOrderByAggregateInput = {
    checkpointDays?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumFollowupStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FollowupStatus | EnumFollowupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFollowupStatusWithAggregatesFilter<$PrismaModel> | $Enums.FollowupStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFollowupStatusFilter<$PrismaModel>
    _max?: NestedEnumFollowupStatusFilter<$PrismaModel>
  }

  export type EnumChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelWithAggregatesFilter<$PrismaModel> | $Enums.Channel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChannelFilter<$PrismaModel>
    _max?: NestedEnumChannelFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumBotSessionStateFilter<$PrismaModel = never> = {
    equals?: $Enums.BotSessionState | EnumBotSessionStateFieldRefInput<$PrismaModel>
    in?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    not?: NestedEnumBotSessionStateFilter<$PrismaModel> | $Enums.BotSessionState
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type FollowupEventScalarRelationFilter = {
    is?: FollowupEventWhereInput
    isNot?: FollowupEventWhereInput
  }

  export type BotSessionCountOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    state?: SortOrder
    currentQuestion?: SortOrder
    collectedData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BotSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    state?: SortOrder
    currentQuestion?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BotSessionMinOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    state?: SortOrder
    currentQuestion?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumBotSessionStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BotSessionState | EnumBotSessionStateFieldRefInput<$PrismaModel>
    in?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    not?: NestedEnumBotSessionStateWithAggregatesFilter<$PrismaModel> | $Enums.BotSessionState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBotSessionStateFilter<$PrismaModel>
    _max?: NestedEnumBotSessionStateFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumSalaryBandNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.SalaryBand | EnumSalaryBandFieldRefInput<$PrismaModel> | null
    in?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSalaryBandNullableFilter<$PrismaModel> | $Enums.SalaryBand | null
  }

  export type EnumNonPlacementReasonNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.NonPlacementReason | EnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    in?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    not?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel> | $Enums.NonPlacementReason | null
  }

  export type EnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type VerificationRequestListRelationFilter = {
    every?: VerificationRequestWhereInput
    some?: VerificationRequestWhereInput
    none?: VerificationRequestWhereInput
  }

  export type VerificationRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmploymentClaimCountOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    employerName?: SortOrder
    role?: SortOrder
    salaryBand?: SortOrder
    nonPlacementReason?: SortOrder
    verificationStatus?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmploymentClaimAvgOrderByAggregateInput = {
    evidenceLevel?: SortOrder
  }

  export type EmploymentClaimMaxOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    employerName?: SortOrder
    role?: SortOrder
    salaryBand?: SortOrder
    nonPlacementReason?: SortOrder
    verificationStatus?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmploymentClaimMinOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    followupEventId?: SortOrder
    employerName?: SortOrder
    role?: SortOrder
    salaryBand?: SortOrder
    nonPlacementReason?: SortOrder
    verificationStatus?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmploymentClaimSumOrderByAggregateInput = {
    evidenceLevel?: SortOrder
  }

  export type EnumSalaryBandNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SalaryBand | EnumSalaryBandFieldRefInput<$PrismaModel> | null
    in?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSalaryBandNullableWithAggregatesFilter<$PrismaModel> | $Enums.SalaryBand | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSalaryBandNullableFilter<$PrismaModel>
    _max?: NestedEnumSalaryBandNullableFilter<$PrismaModel>
  }

  export type EnumNonPlacementReasonNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NonPlacementReason | EnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    in?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    not?: NestedEnumNonPlacementReasonNullableWithAggregatesFilter<$PrismaModel> | $Enums.NonPlacementReason | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel>
    _max?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel>
  }

  export type EnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type EnumOutcomeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusFilter<$PrismaModel> | $Enums.OutcomeStatus
  }

  export type EmploymentClaimNullableScalarRelationFilter = {
    is?: EmploymentClaimWhereInput | null
    isNot?: EmploymentClaimWhereInput | null
  }

  export type OutcomeEventCountOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    employmentClaimId?: SortOrder
    checkpointDays?: SortOrder
    outcomeStatus?: SortOrder
    verificationStatus?: SortOrder
    source?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type OutcomeEventAvgOrderByAggregateInput = {
    checkpointDays?: SortOrder
    evidenceLevel?: SortOrder
  }

  export type OutcomeEventMaxOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    employmentClaimId?: SortOrder
    checkpointDays?: SortOrder
    outcomeStatus?: SortOrder
    verificationStatus?: SortOrder
    source?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type OutcomeEventMinOrderByAggregateInput = {
    id?: SortOrder
    traineeId?: SortOrder
    employmentClaimId?: SortOrder
    checkpointDays?: SortOrder
    outcomeStatus?: SortOrder
    verificationStatus?: SortOrder
    source?: SortOrder
    evidenceLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type OutcomeEventSumOrderByAggregateInput = {
    checkpointDays?: SortOrder
    evidenceLevel?: SortOrder
  }

  export type EnumOutcomeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutcomeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutcomeStatusFilter<$PrismaModel>
    _max?: NestedEnumOutcomeStatusFilter<$PrismaModel>
  }

  export type EmploymentClaimScalarRelationFilter = {
    is?: EmploymentClaimWhereInput
    isNot?: EmploymentClaimWhereInput
  }

  export type VerificationRequestCountOrderByAggregateInput = {
    id?: SortOrder
    employmentClaimId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    action?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    employmentClaimId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    action?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationRequestMinOrderByAggregateInput = {
    id?: SortOrder
    employmentClaimId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    action?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumActorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActorTypeFilter<$PrismaModel> | $Enums.ActorType
  }

  export type AuditEventCountOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorType?: SortOrder
    actorId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventMaxOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorType?: SortOrder
    actorId?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditEventMinOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    actorType?: SortOrder
    actorId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumActorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActorTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActorTypeFilter<$PrismaModel>
    _max?: NestedEnumActorTypeFilter<$PrismaModel>
  }

  export type CohortCreateNestedManyWithoutProgrammeInput = {
    create?: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput> | CohortCreateWithoutProgrammeInput[] | CohortUncheckedCreateWithoutProgrammeInput[]
    connectOrCreate?: CohortCreateOrConnectWithoutProgrammeInput | CohortCreateOrConnectWithoutProgrammeInput[]
    createMany?: CohortCreateManyProgrammeInputEnvelope
    connect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
  }

  export type CohortUncheckedCreateNestedManyWithoutProgrammeInput = {
    create?: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput> | CohortCreateWithoutProgrammeInput[] | CohortUncheckedCreateWithoutProgrammeInput[]
    connectOrCreate?: CohortCreateOrConnectWithoutProgrammeInput | CohortCreateOrConnectWithoutProgrammeInput[]
    createMany?: CohortCreateManyProgrammeInputEnvelope
    connect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CohortUpdateManyWithoutProgrammeNestedInput = {
    create?: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput> | CohortCreateWithoutProgrammeInput[] | CohortUncheckedCreateWithoutProgrammeInput[]
    connectOrCreate?: CohortCreateOrConnectWithoutProgrammeInput | CohortCreateOrConnectWithoutProgrammeInput[]
    upsert?: CohortUpsertWithWhereUniqueWithoutProgrammeInput | CohortUpsertWithWhereUniqueWithoutProgrammeInput[]
    createMany?: CohortCreateManyProgrammeInputEnvelope
    set?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    disconnect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    delete?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    connect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    update?: CohortUpdateWithWhereUniqueWithoutProgrammeInput | CohortUpdateWithWhereUniqueWithoutProgrammeInput[]
    updateMany?: CohortUpdateManyWithWhereWithoutProgrammeInput | CohortUpdateManyWithWhereWithoutProgrammeInput[]
    deleteMany?: CohortScalarWhereInput | CohortScalarWhereInput[]
  }

  export type CohortUncheckedUpdateManyWithoutProgrammeNestedInput = {
    create?: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput> | CohortCreateWithoutProgrammeInput[] | CohortUncheckedCreateWithoutProgrammeInput[]
    connectOrCreate?: CohortCreateOrConnectWithoutProgrammeInput | CohortCreateOrConnectWithoutProgrammeInput[]
    upsert?: CohortUpsertWithWhereUniqueWithoutProgrammeInput | CohortUpsertWithWhereUniqueWithoutProgrammeInput[]
    createMany?: CohortCreateManyProgrammeInputEnvelope
    set?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    disconnect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    delete?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    connect?: CohortWhereUniqueInput | CohortWhereUniqueInput[]
    update?: CohortUpdateWithWhereUniqueWithoutProgrammeInput | CohortUpdateWithWhereUniqueWithoutProgrammeInput[]
    updateMany?: CohortUpdateManyWithWhereWithoutProgrammeInput | CohortUpdateManyWithWhereWithoutProgrammeInput[]
    deleteMany?: CohortScalarWhereInput | CohortScalarWhereInput[]
  }

  export type ProgrammeCreateNestedOneWithoutCohortsInput = {
    create?: XOR<ProgrammeCreateWithoutCohortsInput, ProgrammeUncheckedCreateWithoutCohortsInput>
    connectOrCreate?: ProgrammeCreateOrConnectWithoutCohortsInput
    connect?: ProgrammeWhereUniqueInput
  }

  export type EnrolmentCreateNestedManyWithoutCohortInput = {
    create?: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput> | EnrolmentCreateWithoutCohortInput[] | EnrolmentUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutCohortInput | EnrolmentCreateOrConnectWithoutCohortInput[]
    createMany?: EnrolmentCreateManyCohortInputEnvelope
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
  }

  export type FollowupEventCreateNestedManyWithoutCohortInput = {
    create?: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput> | FollowupEventCreateWithoutCohortInput[] | FollowupEventUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutCohortInput | FollowupEventCreateOrConnectWithoutCohortInput[]
    createMany?: FollowupEventCreateManyCohortInputEnvelope
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
  }

  export type EnrolmentUncheckedCreateNestedManyWithoutCohortInput = {
    create?: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput> | EnrolmentCreateWithoutCohortInput[] | EnrolmentUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutCohortInput | EnrolmentCreateOrConnectWithoutCohortInput[]
    createMany?: EnrolmentCreateManyCohortInputEnvelope
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
  }

  export type FollowupEventUncheckedCreateNestedManyWithoutCohortInput = {
    create?: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput> | FollowupEventCreateWithoutCohortInput[] | FollowupEventUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutCohortInput | FollowupEventCreateOrConnectWithoutCohortInput[]
    createMany?: FollowupEventCreateManyCohortInputEnvelope
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
  }

  export type ProgrammeUpdateOneRequiredWithoutCohortsNestedInput = {
    create?: XOR<ProgrammeCreateWithoutCohortsInput, ProgrammeUncheckedCreateWithoutCohortsInput>
    connectOrCreate?: ProgrammeCreateOrConnectWithoutCohortsInput
    upsert?: ProgrammeUpsertWithoutCohortsInput
    connect?: ProgrammeWhereUniqueInput
    update?: XOR<XOR<ProgrammeUpdateToOneWithWhereWithoutCohortsInput, ProgrammeUpdateWithoutCohortsInput>, ProgrammeUncheckedUpdateWithoutCohortsInput>
  }

  export type EnrolmentUpdateManyWithoutCohortNestedInput = {
    create?: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput> | EnrolmentCreateWithoutCohortInput[] | EnrolmentUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutCohortInput | EnrolmentCreateOrConnectWithoutCohortInput[]
    upsert?: EnrolmentUpsertWithWhereUniqueWithoutCohortInput | EnrolmentUpsertWithWhereUniqueWithoutCohortInput[]
    createMany?: EnrolmentCreateManyCohortInputEnvelope
    set?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    disconnect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    delete?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    update?: EnrolmentUpdateWithWhereUniqueWithoutCohortInput | EnrolmentUpdateWithWhereUniqueWithoutCohortInput[]
    updateMany?: EnrolmentUpdateManyWithWhereWithoutCohortInput | EnrolmentUpdateManyWithWhereWithoutCohortInput[]
    deleteMany?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
  }

  export type FollowupEventUpdateManyWithoutCohortNestedInput = {
    create?: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput> | FollowupEventCreateWithoutCohortInput[] | FollowupEventUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutCohortInput | FollowupEventCreateOrConnectWithoutCohortInput[]
    upsert?: FollowupEventUpsertWithWhereUniqueWithoutCohortInput | FollowupEventUpsertWithWhereUniqueWithoutCohortInput[]
    createMany?: FollowupEventCreateManyCohortInputEnvelope
    set?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    disconnect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    delete?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    update?: FollowupEventUpdateWithWhereUniqueWithoutCohortInput | FollowupEventUpdateWithWhereUniqueWithoutCohortInput[]
    updateMany?: FollowupEventUpdateManyWithWhereWithoutCohortInput | FollowupEventUpdateManyWithWhereWithoutCohortInput[]
    deleteMany?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
  }

  export type EnrolmentUncheckedUpdateManyWithoutCohortNestedInput = {
    create?: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput> | EnrolmentCreateWithoutCohortInput[] | EnrolmentUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutCohortInput | EnrolmentCreateOrConnectWithoutCohortInput[]
    upsert?: EnrolmentUpsertWithWhereUniqueWithoutCohortInput | EnrolmentUpsertWithWhereUniqueWithoutCohortInput[]
    createMany?: EnrolmentCreateManyCohortInputEnvelope
    set?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    disconnect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    delete?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    update?: EnrolmentUpdateWithWhereUniqueWithoutCohortInput | EnrolmentUpdateWithWhereUniqueWithoutCohortInput[]
    updateMany?: EnrolmentUpdateManyWithWhereWithoutCohortInput | EnrolmentUpdateManyWithWhereWithoutCohortInput[]
    deleteMany?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
  }

  export type FollowupEventUncheckedUpdateManyWithoutCohortNestedInput = {
    create?: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput> | FollowupEventCreateWithoutCohortInput[] | FollowupEventUncheckedCreateWithoutCohortInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutCohortInput | FollowupEventCreateOrConnectWithoutCohortInput[]
    upsert?: FollowupEventUpsertWithWhereUniqueWithoutCohortInput | FollowupEventUpsertWithWhereUniqueWithoutCohortInput[]
    createMany?: FollowupEventCreateManyCohortInputEnvelope
    set?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    disconnect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    delete?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    update?: FollowupEventUpdateWithWhereUniqueWithoutCohortInput | FollowupEventUpdateWithWhereUniqueWithoutCohortInput[]
    updateMany?: FollowupEventUpdateManyWithWhereWithoutCohortInput | FollowupEventUpdateManyWithWhereWithoutCohortInput[]
    deleteMany?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
  }

  export type EnrolmentCreateNestedManyWithoutTraineeInput = {
    create?: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput> | EnrolmentCreateWithoutTraineeInput[] | EnrolmentUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutTraineeInput | EnrolmentCreateOrConnectWithoutTraineeInput[]
    createMany?: EnrolmentCreateManyTraineeInputEnvelope
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
  }

  export type FollowupEventCreateNestedManyWithoutTraineeInput = {
    create?: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput> | FollowupEventCreateWithoutTraineeInput[] | FollowupEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutTraineeInput | FollowupEventCreateOrConnectWithoutTraineeInput[]
    createMany?: FollowupEventCreateManyTraineeInputEnvelope
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
  }

  export type BotSessionCreateNestedManyWithoutTraineeInput = {
    create?: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput> | BotSessionCreateWithoutTraineeInput[] | BotSessionUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutTraineeInput | BotSessionCreateOrConnectWithoutTraineeInput[]
    createMany?: BotSessionCreateManyTraineeInputEnvelope
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
  }

  export type EmploymentClaimCreateNestedManyWithoutTraineeInput = {
    create?: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput> | EmploymentClaimCreateWithoutTraineeInput[] | EmploymentClaimUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutTraineeInput | EmploymentClaimCreateOrConnectWithoutTraineeInput[]
    createMany?: EmploymentClaimCreateManyTraineeInputEnvelope
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
  }

  export type OutcomeEventCreateNestedManyWithoutTraineeInput = {
    create?: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput> | OutcomeEventCreateWithoutTraineeInput[] | OutcomeEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutTraineeInput | OutcomeEventCreateOrConnectWithoutTraineeInput[]
    createMany?: OutcomeEventCreateManyTraineeInputEnvelope
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
  }

  export type EnrolmentUncheckedCreateNestedManyWithoutTraineeInput = {
    create?: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput> | EnrolmentCreateWithoutTraineeInput[] | EnrolmentUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutTraineeInput | EnrolmentCreateOrConnectWithoutTraineeInput[]
    createMany?: EnrolmentCreateManyTraineeInputEnvelope
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
  }

  export type FollowupEventUncheckedCreateNestedManyWithoutTraineeInput = {
    create?: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput> | FollowupEventCreateWithoutTraineeInput[] | FollowupEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutTraineeInput | FollowupEventCreateOrConnectWithoutTraineeInput[]
    createMany?: FollowupEventCreateManyTraineeInputEnvelope
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
  }

  export type BotSessionUncheckedCreateNestedManyWithoutTraineeInput = {
    create?: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput> | BotSessionCreateWithoutTraineeInput[] | BotSessionUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutTraineeInput | BotSessionCreateOrConnectWithoutTraineeInput[]
    createMany?: BotSessionCreateManyTraineeInputEnvelope
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
  }

  export type EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput = {
    create?: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput> | EmploymentClaimCreateWithoutTraineeInput[] | EmploymentClaimUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutTraineeInput | EmploymentClaimCreateOrConnectWithoutTraineeInput[]
    createMany?: EmploymentClaimCreateManyTraineeInputEnvelope
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
  }

  export type OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput = {
    create?: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput> | OutcomeEventCreateWithoutTraineeInput[] | OutcomeEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutTraineeInput | OutcomeEventCreateOrConnectWithoutTraineeInput[]
    createMany?: OutcomeEventCreateManyTraineeInputEnvelope
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnrolmentUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput> | EnrolmentCreateWithoutTraineeInput[] | EnrolmentUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutTraineeInput | EnrolmentCreateOrConnectWithoutTraineeInput[]
    upsert?: EnrolmentUpsertWithWhereUniqueWithoutTraineeInput | EnrolmentUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: EnrolmentCreateManyTraineeInputEnvelope
    set?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    disconnect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    delete?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    update?: EnrolmentUpdateWithWhereUniqueWithoutTraineeInput | EnrolmentUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: EnrolmentUpdateManyWithWhereWithoutTraineeInput | EnrolmentUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
  }

  export type FollowupEventUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput> | FollowupEventCreateWithoutTraineeInput[] | FollowupEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutTraineeInput | FollowupEventCreateOrConnectWithoutTraineeInput[]
    upsert?: FollowupEventUpsertWithWhereUniqueWithoutTraineeInput | FollowupEventUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: FollowupEventCreateManyTraineeInputEnvelope
    set?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    disconnect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    delete?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    update?: FollowupEventUpdateWithWhereUniqueWithoutTraineeInput | FollowupEventUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: FollowupEventUpdateManyWithWhereWithoutTraineeInput | FollowupEventUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
  }

  export type BotSessionUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput> | BotSessionCreateWithoutTraineeInput[] | BotSessionUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutTraineeInput | BotSessionCreateOrConnectWithoutTraineeInput[]
    upsert?: BotSessionUpsertWithWhereUniqueWithoutTraineeInput | BotSessionUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: BotSessionCreateManyTraineeInputEnvelope
    set?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    disconnect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    delete?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    update?: BotSessionUpdateWithWhereUniqueWithoutTraineeInput | BotSessionUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: BotSessionUpdateManyWithWhereWithoutTraineeInput | BotSessionUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
  }

  export type EmploymentClaimUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput> | EmploymentClaimCreateWithoutTraineeInput[] | EmploymentClaimUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutTraineeInput | EmploymentClaimCreateOrConnectWithoutTraineeInput[]
    upsert?: EmploymentClaimUpsertWithWhereUniqueWithoutTraineeInput | EmploymentClaimUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: EmploymentClaimCreateManyTraineeInputEnvelope
    set?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    disconnect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    delete?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    update?: EmploymentClaimUpdateWithWhereUniqueWithoutTraineeInput | EmploymentClaimUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: EmploymentClaimUpdateManyWithWhereWithoutTraineeInput | EmploymentClaimUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
  }

  export type OutcomeEventUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput> | OutcomeEventCreateWithoutTraineeInput[] | OutcomeEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutTraineeInput | OutcomeEventCreateOrConnectWithoutTraineeInput[]
    upsert?: OutcomeEventUpsertWithWhereUniqueWithoutTraineeInput | OutcomeEventUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: OutcomeEventCreateManyTraineeInputEnvelope
    set?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    disconnect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    delete?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    update?: OutcomeEventUpdateWithWhereUniqueWithoutTraineeInput | OutcomeEventUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: OutcomeEventUpdateManyWithWhereWithoutTraineeInput | OutcomeEventUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
  }

  export type EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput> | EnrolmentCreateWithoutTraineeInput[] | EnrolmentUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EnrolmentCreateOrConnectWithoutTraineeInput | EnrolmentCreateOrConnectWithoutTraineeInput[]
    upsert?: EnrolmentUpsertWithWhereUniqueWithoutTraineeInput | EnrolmentUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: EnrolmentCreateManyTraineeInputEnvelope
    set?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    disconnect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    delete?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    connect?: EnrolmentWhereUniqueInput | EnrolmentWhereUniqueInput[]
    update?: EnrolmentUpdateWithWhereUniqueWithoutTraineeInput | EnrolmentUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: EnrolmentUpdateManyWithWhereWithoutTraineeInput | EnrolmentUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
  }

  export type FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput> | FollowupEventCreateWithoutTraineeInput[] | FollowupEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: FollowupEventCreateOrConnectWithoutTraineeInput | FollowupEventCreateOrConnectWithoutTraineeInput[]
    upsert?: FollowupEventUpsertWithWhereUniqueWithoutTraineeInput | FollowupEventUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: FollowupEventCreateManyTraineeInputEnvelope
    set?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    disconnect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    delete?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    connect?: FollowupEventWhereUniqueInput | FollowupEventWhereUniqueInput[]
    update?: FollowupEventUpdateWithWhereUniqueWithoutTraineeInput | FollowupEventUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: FollowupEventUpdateManyWithWhereWithoutTraineeInput | FollowupEventUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
  }

  export type BotSessionUncheckedUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput> | BotSessionCreateWithoutTraineeInput[] | BotSessionUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutTraineeInput | BotSessionCreateOrConnectWithoutTraineeInput[]
    upsert?: BotSessionUpsertWithWhereUniqueWithoutTraineeInput | BotSessionUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: BotSessionCreateManyTraineeInputEnvelope
    set?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    disconnect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    delete?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    update?: BotSessionUpdateWithWhereUniqueWithoutTraineeInput | BotSessionUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: BotSessionUpdateManyWithWhereWithoutTraineeInput | BotSessionUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
  }

  export type EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput> | EmploymentClaimCreateWithoutTraineeInput[] | EmploymentClaimUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutTraineeInput | EmploymentClaimCreateOrConnectWithoutTraineeInput[]
    upsert?: EmploymentClaimUpsertWithWhereUniqueWithoutTraineeInput | EmploymentClaimUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: EmploymentClaimCreateManyTraineeInputEnvelope
    set?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    disconnect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    delete?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    update?: EmploymentClaimUpdateWithWhereUniqueWithoutTraineeInput | EmploymentClaimUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: EmploymentClaimUpdateManyWithWhereWithoutTraineeInput | EmploymentClaimUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
  }

  export type OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput = {
    create?: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput> | OutcomeEventCreateWithoutTraineeInput[] | OutcomeEventUncheckedCreateWithoutTraineeInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutTraineeInput | OutcomeEventCreateOrConnectWithoutTraineeInput[]
    upsert?: OutcomeEventUpsertWithWhereUniqueWithoutTraineeInput | OutcomeEventUpsertWithWhereUniqueWithoutTraineeInput[]
    createMany?: OutcomeEventCreateManyTraineeInputEnvelope
    set?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    disconnect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    delete?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    update?: OutcomeEventUpdateWithWhereUniqueWithoutTraineeInput | OutcomeEventUpdateWithWhereUniqueWithoutTraineeInput[]
    updateMany?: OutcomeEventUpdateManyWithWhereWithoutTraineeInput | OutcomeEventUpdateManyWithWhereWithoutTraineeInput[]
    deleteMany?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
  }

  export type TraineeCreateNestedOneWithoutEnrolmentsInput = {
    create?: XOR<TraineeCreateWithoutEnrolmentsInput, TraineeUncheckedCreateWithoutEnrolmentsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutEnrolmentsInput
    connect?: TraineeWhereUniqueInput
  }

  export type CohortCreateNestedOneWithoutEnrolmentsInput = {
    create?: XOR<CohortCreateWithoutEnrolmentsInput, CohortUncheckedCreateWithoutEnrolmentsInput>
    connectOrCreate?: CohortCreateOrConnectWithoutEnrolmentsInput
    connect?: CohortWhereUniqueInput
  }

  export type TraineeUpdateOneRequiredWithoutEnrolmentsNestedInput = {
    create?: XOR<TraineeCreateWithoutEnrolmentsInput, TraineeUncheckedCreateWithoutEnrolmentsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutEnrolmentsInput
    upsert?: TraineeUpsertWithoutEnrolmentsInput
    connect?: TraineeWhereUniqueInput
    update?: XOR<XOR<TraineeUpdateToOneWithWhereWithoutEnrolmentsInput, TraineeUpdateWithoutEnrolmentsInput>, TraineeUncheckedUpdateWithoutEnrolmentsInput>
  }

  export type CohortUpdateOneRequiredWithoutEnrolmentsNestedInput = {
    create?: XOR<CohortCreateWithoutEnrolmentsInput, CohortUncheckedCreateWithoutEnrolmentsInput>
    connectOrCreate?: CohortCreateOrConnectWithoutEnrolmentsInput
    upsert?: CohortUpsertWithoutEnrolmentsInput
    connect?: CohortWhereUniqueInput
    update?: XOR<XOR<CohortUpdateToOneWithWhereWithoutEnrolmentsInput, CohortUpdateWithoutEnrolmentsInput>, CohortUncheckedUpdateWithoutEnrolmentsInput>
  }

  export type TraineeCreateNestedOneWithoutFollowupEventsInput = {
    create?: XOR<TraineeCreateWithoutFollowupEventsInput, TraineeUncheckedCreateWithoutFollowupEventsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutFollowupEventsInput
    connect?: TraineeWhereUniqueInput
  }

  export type CohortCreateNestedOneWithoutFollowupEventsInput = {
    create?: XOR<CohortCreateWithoutFollowupEventsInput, CohortUncheckedCreateWithoutFollowupEventsInput>
    connectOrCreate?: CohortCreateOrConnectWithoutFollowupEventsInput
    connect?: CohortWhereUniqueInput
  }

  export type BotSessionCreateNestedManyWithoutFollowupEventInput = {
    create?: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput> | BotSessionCreateWithoutFollowupEventInput[] | BotSessionUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutFollowupEventInput | BotSessionCreateOrConnectWithoutFollowupEventInput[]
    createMany?: BotSessionCreateManyFollowupEventInputEnvelope
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
  }

  export type EmploymentClaimCreateNestedManyWithoutFollowupEventInput = {
    create?: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput> | EmploymentClaimCreateWithoutFollowupEventInput[] | EmploymentClaimUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutFollowupEventInput | EmploymentClaimCreateOrConnectWithoutFollowupEventInput[]
    createMany?: EmploymentClaimCreateManyFollowupEventInputEnvelope
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
  }

  export type BotSessionUncheckedCreateNestedManyWithoutFollowupEventInput = {
    create?: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput> | BotSessionCreateWithoutFollowupEventInput[] | BotSessionUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutFollowupEventInput | BotSessionCreateOrConnectWithoutFollowupEventInput[]
    createMany?: BotSessionCreateManyFollowupEventInputEnvelope
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
  }

  export type EmploymentClaimUncheckedCreateNestedManyWithoutFollowupEventInput = {
    create?: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput> | EmploymentClaimCreateWithoutFollowupEventInput[] | EmploymentClaimUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutFollowupEventInput | EmploymentClaimCreateOrConnectWithoutFollowupEventInput[]
    createMany?: EmploymentClaimCreateManyFollowupEventInputEnvelope
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumFollowupStatusFieldUpdateOperationsInput = {
    set?: $Enums.FollowupStatus
  }

  export type EnumChannelFieldUpdateOperationsInput = {
    set?: $Enums.Channel
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type TraineeUpdateOneRequiredWithoutFollowupEventsNestedInput = {
    create?: XOR<TraineeCreateWithoutFollowupEventsInput, TraineeUncheckedCreateWithoutFollowupEventsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutFollowupEventsInput
    upsert?: TraineeUpsertWithoutFollowupEventsInput
    connect?: TraineeWhereUniqueInput
    update?: XOR<XOR<TraineeUpdateToOneWithWhereWithoutFollowupEventsInput, TraineeUpdateWithoutFollowupEventsInput>, TraineeUncheckedUpdateWithoutFollowupEventsInput>
  }

  export type CohortUpdateOneRequiredWithoutFollowupEventsNestedInput = {
    create?: XOR<CohortCreateWithoutFollowupEventsInput, CohortUncheckedCreateWithoutFollowupEventsInput>
    connectOrCreate?: CohortCreateOrConnectWithoutFollowupEventsInput
    upsert?: CohortUpsertWithoutFollowupEventsInput
    connect?: CohortWhereUniqueInput
    update?: XOR<XOR<CohortUpdateToOneWithWhereWithoutFollowupEventsInput, CohortUpdateWithoutFollowupEventsInput>, CohortUncheckedUpdateWithoutFollowupEventsInput>
  }

  export type BotSessionUpdateManyWithoutFollowupEventNestedInput = {
    create?: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput> | BotSessionCreateWithoutFollowupEventInput[] | BotSessionUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutFollowupEventInput | BotSessionCreateOrConnectWithoutFollowupEventInput[]
    upsert?: BotSessionUpsertWithWhereUniqueWithoutFollowupEventInput | BotSessionUpsertWithWhereUniqueWithoutFollowupEventInput[]
    createMany?: BotSessionCreateManyFollowupEventInputEnvelope
    set?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    disconnect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    delete?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    update?: BotSessionUpdateWithWhereUniqueWithoutFollowupEventInput | BotSessionUpdateWithWhereUniqueWithoutFollowupEventInput[]
    updateMany?: BotSessionUpdateManyWithWhereWithoutFollowupEventInput | BotSessionUpdateManyWithWhereWithoutFollowupEventInput[]
    deleteMany?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
  }

  export type EmploymentClaimUpdateManyWithoutFollowupEventNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput> | EmploymentClaimCreateWithoutFollowupEventInput[] | EmploymentClaimUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutFollowupEventInput | EmploymentClaimCreateOrConnectWithoutFollowupEventInput[]
    upsert?: EmploymentClaimUpsertWithWhereUniqueWithoutFollowupEventInput | EmploymentClaimUpsertWithWhereUniqueWithoutFollowupEventInput[]
    createMany?: EmploymentClaimCreateManyFollowupEventInputEnvelope
    set?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    disconnect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    delete?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    update?: EmploymentClaimUpdateWithWhereUniqueWithoutFollowupEventInput | EmploymentClaimUpdateWithWhereUniqueWithoutFollowupEventInput[]
    updateMany?: EmploymentClaimUpdateManyWithWhereWithoutFollowupEventInput | EmploymentClaimUpdateManyWithWhereWithoutFollowupEventInput[]
    deleteMany?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
  }

  export type BotSessionUncheckedUpdateManyWithoutFollowupEventNestedInput = {
    create?: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput> | BotSessionCreateWithoutFollowupEventInput[] | BotSessionUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: BotSessionCreateOrConnectWithoutFollowupEventInput | BotSessionCreateOrConnectWithoutFollowupEventInput[]
    upsert?: BotSessionUpsertWithWhereUniqueWithoutFollowupEventInput | BotSessionUpsertWithWhereUniqueWithoutFollowupEventInput[]
    createMany?: BotSessionCreateManyFollowupEventInputEnvelope
    set?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    disconnect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    delete?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    connect?: BotSessionWhereUniqueInput | BotSessionWhereUniqueInput[]
    update?: BotSessionUpdateWithWhereUniqueWithoutFollowupEventInput | BotSessionUpdateWithWhereUniqueWithoutFollowupEventInput[]
    updateMany?: BotSessionUpdateManyWithWhereWithoutFollowupEventInput | BotSessionUpdateManyWithWhereWithoutFollowupEventInput[]
    deleteMany?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
  }

  export type EmploymentClaimUncheckedUpdateManyWithoutFollowupEventNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput> | EmploymentClaimCreateWithoutFollowupEventInput[] | EmploymentClaimUncheckedCreateWithoutFollowupEventInput[]
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutFollowupEventInput | EmploymentClaimCreateOrConnectWithoutFollowupEventInput[]
    upsert?: EmploymentClaimUpsertWithWhereUniqueWithoutFollowupEventInput | EmploymentClaimUpsertWithWhereUniqueWithoutFollowupEventInput[]
    createMany?: EmploymentClaimCreateManyFollowupEventInputEnvelope
    set?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    disconnect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    delete?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    connect?: EmploymentClaimWhereUniqueInput | EmploymentClaimWhereUniqueInput[]
    update?: EmploymentClaimUpdateWithWhereUniqueWithoutFollowupEventInput | EmploymentClaimUpdateWithWhereUniqueWithoutFollowupEventInput[]
    updateMany?: EmploymentClaimUpdateManyWithWhereWithoutFollowupEventInput | EmploymentClaimUpdateManyWithWhereWithoutFollowupEventInput[]
    deleteMany?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
  }

  export type TraineeCreateNestedOneWithoutBotSessionsInput = {
    create?: XOR<TraineeCreateWithoutBotSessionsInput, TraineeUncheckedCreateWithoutBotSessionsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutBotSessionsInput
    connect?: TraineeWhereUniqueInput
  }

  export type FollowupEventCreateNestedOneWithoutBotSessionsInput = {
    create?: XOR<FollowupEventCreateWithoutBotSessionsInput, FollowupEventUncheckedCreateWithoutBotSessionsInput>
    connectOrCreate?: FollowupEventCreateOrConnectWithoutBotSessionsInput
    connect?: FollowupEventWhereUniqueInput
  }

  export type EnumBotSessionStateFieldUpdateOperationsInput = {
    set?: $Enums.BotSessionState
  }

  export type TraineeUpdateOneRequiredWithoutBotSessionsNestedInput = {
    create?: XOR<TraineeCreateWithoutBotSessionsInput, TraineeUncheckedCreateWithoutBotSessionsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutBotSessionsInput
    upsert?: TraineeUpsertWithoutBotSessionsInput
    connect?: TraineeWhereUniqueInput
    update?: XOR<XOR<TraineeUpdateToOneWithWhereWithoutBotSessionsInput, TraineeUpdateWithoutBotSessionsInput>, TraineeUncheckedUpdateWithoutBotSessionsInput>
  }

  export type FollowupEventUpdateOneRequiredWithoutBotSessionsNestedInput = {
    create?: XOR<FollowupEventCreateWithoutBotSessionsInput, FollowupEventUncheckedCreateWithoutBotSessionsInput>
    connectOrCreate?: FollowupEventCreateOrConnectWithoutBotSessionsInput
    upsert?: FollowupEventUpsertWithoutBotSessionsInput
    connect?: FollowupEventWhereUniqueInput
    update?: XOR<XOR<FollowupEventUpdateToOneWithWhereWithoutBotSessionsInput, FollowupEventUpdateWithoutBotSessionsInput>, FollowupEventUncheckedUpdateWithoutBotSessionsInput>
  }

  export type TraineeCreateNestedOneWithoutEmploymentClaimsInput = {
    create?: XOR<TraineeCreateWithoutEmploymentClaimsInput, TraineeUncheckedCreateWithoutEmploymentClaimsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutEmploymentClaimsInput
    connect?: TraineeWhereUniqueInput
  }

  export type FollowupEventCreateNestedOneWithoutEmploymentClaimsInput = {
    create?: XOR<FollowupEventCreateWithoutEmploymentClaimsInput, FollowupEventUncheckedCreateWithoutEmploymentClaimsInput>
    connectOrCreate?: FollowupEventCreateOrConnectWithoutEmploymentClaimsInput
    connect?: FollowupEventWhereUniqueInput
  }

  export type VerificationRequestCreateNestedManyWithoutEmploymentClaimInput = {
    create?: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput> | VerificationRequestCreateWithoutEmploymentClaimInput[] | VerificationRequestUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: VerificationRequestCreateOrConnectWithoutEmploymentClaimInput | VerificationRequestCreateOrConnectWithoutEmploymentClaimInput[]
    createMany?: VerificationRequestCreateManyEmploymentClaimInputEnvelope
    connect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
  }

  export type OutcomeEventCreateNestedManyWithoutEmploymentClaimInput = {
    create?: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput> | OutcomeEventCreateWithoutEmploymentClaimInput[] | OutcomeEventUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutEmploymentClaimInput | OutcomeEventCreateOrConnectWithoutEmploymentClaimInput[]
    createMany?: OutcomeEventCreateManyEmploymentClaimInputEnvelope
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
  }

  export type VerificationRequestUncheckedCreateNestedManyWithoutEmploymentClaimInput = {
    create?: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput> | VerificationRequestCreateWithoutEmploymentClaimInput[] | VerificationRequestUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: VerificationRequestCreateOrConnectWithoutEmploymentClaimInput | VerificationRequestCreateOrConnectWithoutEmploymentClaimInput[]
    createMany?: VerificationRequestCreateManyEmploymentClaimInputEnvelope
    connect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
  }

  export type OutcomeEventUncheckedCreateNestedManyWithoutEmploymentClaimInput = {
    create?: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput> | OutcomeEventCreateWithoutEmploymentClaimInput[] | OutcomeEventUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutEmploymentClaimInput | OutcomeEventCreateOrConnectWithoutEmploymentClaimInput[]
    createMany?: OutcomeEventCreateManyEmploymentClaimInputEnvelope
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
  }

  export type NullableEnumSalaryBandFieldUpdateOperationsInput = {
    set?: $Enums.SalaryBand | null
  }

  export type NullableEnumNonPlacementReasonFieldUpdateOperationsInput = {
    set?: $Enums.NonPlacementReason | null
  }

  export type EnumVerificationStatusFieldUpdateOperationsInput = {
    set?: $Enums.VerificationStatus
  }

  export type TraineeUpdateOneRequiredWithoutEmploymentClaimsNestedInput = {
    create?: XOR<TraineeCreateWithoutEmploymentClaimsInput, TraineeUncheckedCreateWithoutEmploymentClaimsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutEmploymentClaimsInput
    upsert?: TraineeUpsertWithoutEmploymentClaimsInput
    connect?: TraineeWhereUniqueInput
    update?: XOR<XOR<TraineeUpdateToOneWithWhereWithoutEmploymentClaimsInput, TraineeUpdateWithoutEmploymentClaimsInput>, TraineeUncheckedUpdateWithoutEmploymentClaimsInput>
  }

  export type FollowupEventUpdateOneRequiredWithoutEmploymentClaimsNestedInput = {
    create?: XOR<FollowupEventCreateWithoutEmploymentClaimsInput, FollowupEventUncheckedCreateWithoutEmploymentClaimsInput>
    connectOrCreate?: FollowupEventCreateOrConnectWithoutEmploymentClaimsInput
    upsert?: FollowupEventUpsertWithoutEmploymentClaimsInput
    connect?: FollowupEventWhereUniqueInput
    update?: XOR<XOR<FollowupEventUpdateToOneWithWhereWithoutEmploymentClaimsInput, FollowupEventUpdateWithoutEmploymentClaimsInput>, FollowupEventUncheckedUpdateWithoutEmploymentClaimsInput>
  }

  export type VerificationRequestUpdateManyWithoutEmploymentClaimNestedInput = {
    create?: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput> | VerificationRequestCreateWithoutEmploymentClaimInput[] | VerificationRequestUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: VerificationRequestCreateOrConnectWithoutEmploymentClaimInput | VerificationRequestCreateOrConnectWithoutEmploymentClaimInput[]
    upsert?: VerificationRequestUpsertWithWhereUniqueWithoutEmploymentClaimInput | VerificationRequestUpsertWithWhereUniqueWithoutEmploymentClaimInput[]
    createMany?: VerificationRequestCreateManyEmploymentClaimInputEnvelope
    set?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    disconnect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    delete?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    connect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    update?: VerificationRequestUpdateWithWhereUniqueWithoutEmploymentClaimInput | VerificationRequestUpdateWithWhereUniqueWithoutEmploymentClaimInput[]
    updateMany?: VerificationRequestUpdateManyWithWhereWithoutEmploymentClaimInput | VerificationRequestUpdateManyWithWhereWithoutEmploymentClaimInput[]
    deleteMany?: VerificationRequestScalarWhereInput | VerificationRequestScalarWhereInput[]
  }

  export type OutcomeEventUpdateManyWithoutEmploymentClaimNestedInput = {
    create?: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput> | OutcomeEventCreateWithoutEmploymentClaimInput[] | OutcomeEventUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutEmploymentClaimInput | OutcomeEventCreateOrConnectWithoutEmploymentClaimInput[]
    upsert?: OutcomeEventUpsertWithWhereUniqueWithoutEmploymentClaimInput | OutcomeEventUpsertWithWhereUniqueWithoutEmploymentClaimInput[]
    createMany?: OutcomeEventCreateManyEmploymentClaimInputEnvelope
    set?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    disconnect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    delete?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    update?: OutcomeEventUpdateWithWhereUniqueWithoutEmploymentClaimInput | OutcomeEventUpdateWithWhereUniqueWithoutEmploymentClaimInput[]
    updateMany?: OutcomeEventUpdateManyWithWhereWithoutEmploymentClaimInput | OutcomeEventUpdateManyWithWhereWithoutEmploymentClaimInput[]
    deleteMany?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
  }

  export type VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimNestedInput = {
    create?: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput> | VerificationRequestCreateWithoutEmploymentClaimInput[] | VerificationRequestUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: VerificationRequestCreateOrConnectWithoutEmploymentClaimInput | VerificationRequestCreateOrConnectWithoutEmploymentClaimInput[]
    upsert?: VerificationRequestUpsertWithWhereUniqueWithoutEmploymentClaimInput | VerificationRequestUpsertWithWhereUniqueWithoutEmploymentClaimInput[]
    createMany?: VerificationRequestCreateManyEmploymentClaimInputEnvelope
    set?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    disconnect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    delete?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    connect?: VerificationRequestWhereUniqueInput | VerificationRequestWhereUniqueInput[]
    update?: VerificationRequestUpdateWithWhereUniqueWithoutEmploymentClaimInput | VerificationRequestUpdateWithWhereUniqueWithoutEmploymentClaimInput[]
    updateMany?: VerificationRequestUpdateManyWithWhereWithoutEmploymentClaimInput | VerificationRequestUpdateManyWithWhereWithoutEmploymentClaimInput[]
    deleteMany?: VerificationRequestScalarWhereInput | VerificationRequestScalarWhereInput[]
  }

  export type OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimNestedInput = {
    create?: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput> | OutcomeEventCreateWithoutEmploymentClaimInput[] | OutcomeEventUncheckedCreateWithoutEmploymentClaimInput[]
    connectOrCreate?: OutcomeEventCreateOrConnectWithoutEmploymentClaimInput | OutcomeEventCreateOrConnectWithoutEmploymentClaimInput[]
    upsert?: OutcomeEventUpsertWithWhereUniqueWithoutEmploymentClaimInput | OutcomeEventUpsertWithWhereUniqueWithoutEmploymentClaimInput[]
    createMany?: OutcomeEventCreateManyEmploymentClaimInputEnvelope
    set?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    disconnect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    delete?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    connect?: OutcomeEventWhereUniqueInput | OutcomeEventWhereUniqueInput[]
    update?: OutcomeEventUpdateWithWhereUniqueWithoutEmploymentClaimInput | OutcomeEventUpdateWithWhereUniqueWithoutEmploymentClaimInput[]
    updateMany?: OutcomeEventUpdateManyWithWhereWithoutEmploymentClaimInput | OutcomeEventUpdateManyWithWhereWithoutEmploymentClaimInput[]
    deleteMany?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
  }

  export type TraineeCreateNestedOneWithoutOutcomeEventsInput = {
    create?: XOR<TraineeCreateWithoutOutcomeEventsInput, TraineeUncheckedCreateWithoutOutcomeEventsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutOutcomeEventsInput
    connect?: TraineeWhereUniqueInput
  }

  export type EmploymentClaimCreateNestedOneWithoutOutcomeEventsInput = {
    create?: XOR<EmploymentClaimCreateWithoutOutcomeEventsInput, EmploymentClaimUncheckedCreateWithoutOutcomeEventsInput>
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutOutcomeEventsInput
    connect?: EmploymentClaimWhereUniqueInput
  }

  export type EnumOutcomeStatusFieldUpdateOperationsInput = {
    set?: $Enums.OutcomeStatus
  }

  export type TraineeUpdateOneRequiredWithoutOutcomeEventsNestedInput = {
    create?: XOR<TraineeCreateWithoutOutcomeEventsInput, TraineeUncheckedCreateWithoutOutcomeEventsInput>
    connectOrCreate?: TraineeCreateOrConnectWithoutOutcomeEventsInput
    upsert?: TraineeUpsertWithoutOutcomeEventsInput
    connect?: TraineeWhereUniqueInput
    update?: XOR<XOR<TraineeUpdateToOneWithWhereWithoutOutcomeEventsInput, TraineeUpdateWithoutOutcomeEventsInput>, TraineeUncheckedUpdateWithoutOutcomeEventsInput>
  }

  export type EmploymentClaimUpdateOneWithoutOutcomeEventsNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutOutcomeEventsInput, EmploymentClaimUncheckedCreateWithoutOutcomeEventsInput>
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutOutcomeEventsInput
    upsert?: EmploymentClaimUpsertWithoutOutcomeEventsInput
    disconnect?: EmploymentClaimWhereInput | boolean
    delete?: EmploymentClaimWhereInput | boolean
    connect?: EmploymentClaimWhereUniqueInput
    update?: XOR<XOR<EmploymentClaimUpdateToOneWithWhereWithoutOutcomeEventsInput, EmploymentClaimUpdateWithoutOutcomeEventsInput>, EmploymentClaimUncheckedUpdateWithoutOutcomeEventsInput>
  }

  export type EmploymentClaimCreateNestedOneWithoutVerificationRequestsInput = {
    create?: XOR<EmploymentClaimCreateWithoutVerificationRequestsInput, EmploymentClaimUncheckedCreateWithoutVerificationRequestsInput>
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutVerificationRequestsInput
    connect?: EmploymentClaimWhereUniqueInput
  }

  export type EmploymentClaimUpdateOneRequiredWithoutVerificationRequestsNestedInput = {
    create?: XOR<EmploymentClaimCreateWithoutVerificationRequestsInput, EmploymentClaimUncheckedCreateWithoutVerificationRequestsInput>
    connectOrCreate?: EmploymentClaimCreateOrConnectWithoutVerificationRequestsInput
    upsert?: EmploymentClaimUpsertWithoutVerificationRequestsInput
    connect?: EmploymentClaimWhereUniqueInput
    update?: XOR<XOR<EmploymentClaimUpdateToOneWithWhereWithoutVerificationRequestsInput, EmploymentClaimUpdateWithoutVerificationRequestsInput>, EmploymentClaimUncheckedUpdateWithoutVerificationRequestsInput>
  }

  export type EnumActorTypeFieldUpdateOperationsInput = {
    set?: $Enums.ActorType
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumFollowupStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FollowupStatus | EnumFollowupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFollowupStatusFilter<$PrismaModel> | $Enums.FollowupStatus
  }

  export type NestedEnumChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelFilter<$PrismaModel> | $Enums.Channel
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumFollowupStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FollowupStatus | EnumFollowupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FollowupStatus[] | ListEnumFollowupStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFollowupStatusWithAggregatesFilter<$PrismaModel> | $Enums.FollowupStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFollowupStatusFilter<$PrismaModel>
    _max?: NestedEnumFollowupStatusFilter<$PrismaModel>
  }

  export type NestedEnumChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelWithAggregatesFilter<$PrismaModel> | $Enums.Channel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChannelFilter<$PrismaModel>
    _max?: NestedEnumChannelFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumBotSessionStateFilter<$PrismaModel = never> = {
    equals?: $Enums.BotSessionState | EnumBotSessionStateFieldRefInput<$PrismaModel>
    in?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    not?: NestedEnumBotSessionStateFilter<$PrismaModel> | $Enums.BotSessionState
  }

  export type NestedEnumBotSessionStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BotSessionState | EnumBotSessionStateFieldRefInput<$PrismaModel>
    in?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotSessionState[] | ListEnumBotSessionStateFieldRefInput<$PrismaModel>
    not?: NestedEnumBotSessionStateWithAggregatesFilter<$PrismaModel> | $Enums.BotSessionState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBotSessionStateFilter<$PrismaModel>
    _max?: NestedEnumBotSessionStateFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumSalaryBandNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.SalaryBand | EnumSalaryBandFieldRefInput<$PrismaModel> | null
    in?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSalaryBandNullableFilter<$PrismaModel> | $Enums.SalaryBand | null
  }

  export type NestedEnumNonPlacementReasonNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.NonPlacementReason | EnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    in?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    not?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel> | $Enums.NonPlacementReason | null
  }

  export type NestedEnumVerificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusFilter<$PrismaModel> | $Enums.VerificationStatus
  }

  export type NestedEnumSalaryBandNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SalaryBand | EnumSalaryBandFieldRefInput<$PrismaModel> | null
    in?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.SalaryBand[] | ListEnumSalaryBandFieldRefInput<$PrismaModel> | null
    not?: NestedEnumSalaryBandNullableWithAggregatesFilter<$PrismaModel> | $Enums.SalaryBand | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumSalaryBandNullableFilter<$PrismaModel>
    _max?: NestedEnumSalaryBandNullableFilter<$PrismaModel>
  }

  export type NestedEnumNonPlacementReasonNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NonPlacementReason | EnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    in?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.NonPlacementReason[] | ListEnumNonPlacementReasonFieldRefInput<$PrismaModel> | null
    not?: NestedEnumNonPlacementReasonNullableWithAggregatesFilter<$PrismaModel> | $Enums.NonPlacementReason | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel>
    _max?: NestedEnumNonPlacementReasonNullableFilter<$PrismaModel>
  }

  export type NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationStatus | EnumVerificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.VerificationStatus[] | ListEnumVerificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumVerificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.VerificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumVerificationStatusFilter<$PrismaModel>
    _max?: NestedEnumVerificationStatusFilter<$PrismaModel>
  }

  export type NestedEnumOutcomeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusFilter<$PrismaModel> | $Enums.OutcomeStatus
  }

  export type NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutcomeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutcomeStatusFilter<$PrismaModel>
    _max?: NestedEnumOutcomeStatusFilter<$PrismaModel>
  }

  export type NestedEnumActorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActorTypeFilter<$PrismaModel> | $Enums.ActorType
  }

  export type NestedEnumActorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActorType | EnumActorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActorType[] | ListEnumActorTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActorTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActorTypeFilter<$PrismaModel>
    _max?: NestedEnumActorTypeFilter<$PrismaModel>
  }

  export type CohortCreateWithoutProgrammeInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutCohortInput
    followupEvents?: FollowupEventCreateNestedManyWithoutCohortInput
  }

  export type CohortUncheckedCreateWithoutProgrammeInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutCohortInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutCohortInput
  }

  export type CohortCreateOrConnectWithoutProgrammeInput = {
    where: CohortWhereUniqueInput
    create: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput>
  }

  export type CohortCreateManyProgrammeInputEnvelope = {
    data: CohortCreateManyProgrammeInput | CohortCreateManyProgrammeInput[]
    skipDuplicates?: boolean
  }

  export type CohortUpsertWithWhereUniqueWithoutProgrammeInput = {
    where: CohortWhereUniqueInput
    update: XOR<CohortUpdateWithoutProgrammeInput, CohortUncheckedUpdateWithoutProgrammeInput>
    create: XOR<CohortCreateWithoutProgrammeInput, CohortUncheckedCreateWithoutProgrammeInput>
  }

  export type CohortUpdateWithWhereUniqueWithoutProgrammeInput = {
    where: CohortWhereUniqueInput
    data: XOR<CohortUpdateWithoutProgrammeInput, CohortUncheckedUpdateWithoutProgrammeInput>
  }

  export type CohortUpdateManyWithWhereWithoutProgrammeInput = {
    where: CohortScalarWhereInput
    data: XOR<CohortUpdateManyMutationInput, CohortUncheckedUpdateManyWithoutProgrammeInput>
  }

  export type CohortScalarWhereInput = {
    AND?: CohortScalarWhereInput | CohortScalarWhereInput[]
    OR?: CohortScalarWhereInput[]
    NOT?: CohortScalarWhereInput | CohortScalarWhereInput[]
    id?: StringFilter<"Cohort"> | string
    programmeId?: StringFilter<"Cohort"> | string
    name?: StringFilter<"Cohort"> | string
    startDate?: DateTimeFilter<"Cohort"> | Date | string
    endDate?: DateTimeFilter<"Cohort"> | Date | string
    createdAt?: DateTimeFilter<"Cohort"> | Date | string
    updatedAt?: DateTimeFilter<"Cohort"> | Date | string
  }

  export type ProgrammeCreateWithoutCohortsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgrammeUncheckedCreateWithoutCohortsInput = {
    id?: string
    name: string
    code: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgrammeCreateOrConnectWithoutCohortsInput = {
    where: ProgrammeWhereUniqueInput
    create: XOR<ProgrammeCreateWithoutCohortsInput, ProgrammeUncheckedCreateWithoutCohortsInput>
  }

  export type EnrolmentCreateWithoutCohortInput = {
    id?: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEnrolmentsInput
  }

  export type EnrolmentUncheckedCreateWithoutCohortInput = {
    id?: string
    traineeId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EnrolmentCreateOrConnectWithoutCohortInput = {
    where: EnrolmentWhereUniqueInput
    create: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput>
  }

  export type EnrolmentCreateManyCohortInputEnvelope = {
    data: EnrolmentCreateManyCohortInput | EnrolmentCreateManyCohortInput[]
    skipDuplicates?: boolean
  }

  export type FollowupEventCreateWithoutCohortInput = {
    id?: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutFollowupEventsInput
    botSessions?: BotSessionCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUncheckedCreateWithoutCohortInput = {
    id?: string
    traineeId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventCreateOrConnectWithoutCohortInput = {
    where: FollowupEventWhereUniqueInput
    create: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput>
  }

  export type FollowupEventCreateManyCohortInputEnvelope = {
    data: FollowupEventCreateManyCohortInput | FollowupEventCreateManyCohortInput[]
    skipDuplicates?: boolean
  }

  export type ProgrammeUpsertWithoutCohortsInput = {
    update: XOR<ProgrammeUpdateWithoutCohortsInput, ProgrammeUncheckedUpdateWithoutCohortsInput>
    create: XOR<ProgrammeCreateWithoutCohortsInput, ProgrammeUncheckedCreateWithoutCohortsInput>
    where?: ProgrammeWhereInput
  }

  export type ProgrammeUpdateToOneWithWhereWithoutCohortsInput = {
    where?: ProgrammeWhereInput
    data: XOR<ProgrammeUpdateWithoutCohortsInput, ProgrammeUncheckedUpdateWithoutCohortsInput>
  }

  export type ProgrammeUpdateWithoutCohortsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgrammeUncheckedUpdateWithoutCohortsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentUpsertWithWhereUniqueWithoutCohortInput = {
    where: EnrolmentWhereUniqueInput
    update: XOR<EnrolmentUpdateWithoutCohortInput, EnrolmentUncheckedUpdateWithoutCohortInput>
    create: XOR<EnrolmentCreateWithoutCohortInput, EnrolmentUncheckedCreateWithoutCohortInput>
  }

  export type EnrolmentUpdateWithWhereUniqueWithoutCohortInput = {
    where: EnrolmentWhereUniqueInput
    data: XOR<EnrolmentUpdateWithoutCohortInput, EnrolmentUncheckedUpdateWithoutCohortInput>
  }

  export type EnrolmentUpdateManyWithWhereWithoutCohortInput = {
    where: EnrolmentScalarWhereInput
    data: XOR<EnrolmentUpdateManyMutationInput, EnrolmentUncheckedUpdateManyWithoutCohortInput>
  }

  export type EnrolmentScalarWhereInput = {
    AND?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
    OR?: EnrolmentScalarWhereInput[]
    NOT?: EnrolmentScalarWhereInput | EnrolmentScalarWhereInput[]
    id?: StringFilter<"Enrolment"> | string
    traineeId?: StringFilter<"Enrolment"> | string
    cohortId?: StringFilter<"Enrolment"> | string
    certificationDate?: DateTimeFilter<"Enrolment"> | Date | string
    createdAt?: DateTimeFilter<"Enrolment"> | Date | string
    updatedAt?: DateTimeFilter<"Enrolment"> | Date | string
  }

  export type FollowupEventUpsertWithWhereUniqueWithoutCohortInput = {
    where: FollowupEventWhereUniqueInput
    update: XOR<FollowupEventUpdateWithoutCohortInput, FollowupEventUncheckedUpdateWithoutCohortInput>
    create: XOR<FollowupEventCreateWithoutCohortInput, FollowupEventUncheckedCreateWithoutCohortInput>
  }

  export type FollowupEventUpdateWithWhereUniqueWithoutCohortInput = {
    where: FollowupEventWhereUniqueInput
    data: XOR<FollowupEventUpdateWithoutCohortInput, FollowupEventUncheckedUpdateWithoutCohortInput>
  }

  export type FollowupEventUpdateManyWithWhereWithoutCohortInput = {
    where: FollowupEventScalarWhereInput
    data: XOR<FollowupEventUpdateManyMutationInput, FollowupEventUncheckedUpdateManyWithoutCohortInput>
  }

  export type FollowupEventScalarWhereInput = {
    AND?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
    OR?: FollowupEventScalarWhereInput[]
    NOT?: FollowupEventScalarWhereInput | FollowupEventScalarWhereInput[]
    id?: StringFilter<"FollowupEvent"> | string
    traineeId?: StringFilter<"FollowupEvent"> | string
    cohortId?: StringFilter<"FollowupEvent"> | string
    checkpointDays?: IntFilter<"FollowupEvent"> | number
    status?: EnumFollowupStatusFilter<"FollowupEvent"> | $Enums.FollowupStatus
    channel?: EnumChannelFilter<"FollowupEvent"> | $Enums.Channel
    sentAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    respondedAt?: DateTimeNullableFilter<"FollowupEvent"> | Date | string | null
    createdAt?: DateTimeFilter<"FollowupEvent"> | Date | string
    updatedAt?: DateTimeFilter<"FollowupEvent"> | Date | string
  }

  export type EnrolmentCreateWithoutTraineeInput = {
    id?: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    cohort: CohortCreateNestedOneWithoutEnrolmentsInput
  }

  export type EnrolmentUncheckedCreateWithoutTraineeInput = {
    id?: string
    cohortId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EnrolmentCreateOrConnectWithoutTraineeInput = {
    where: EnrolmentWhereUniqueInput
    create: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput>
  }

  export type EnrolmentCreateManyTraineeInputEnvelope = {
    data: EnrolmentCreateManyTraineeInput | EnrolmentCreateManyTraineeInput[]
    skipDuplicates?: boolean
  }

  export type FollowupEventCreateWithoutTraineeInput = {
    id?: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cohort: CohortCreateNestedOneWithoutFollowupEventsInput
    botSessions?: BotSessionCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUncheckedCreateWithoutTraineeInput = {
    id?: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutFollowupEventInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventCreateOrConnectWithoutTraineeInput = {
    where: FollowupEventWhereUniqueInput
    create: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput>
  }

  export type FollowupEventCreateManyTraineeInputEnvelope = {
    data: FollowupEventCreateManyTraineeInput | FollowupEventCreateManyTraineeInput[]
    skipDuplicates?: boolean
  }

  export type BotSessionCreateWithoutTraineeInput = {
    id?: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    followupEvent: FollowupEventCreateNestedOneWithoutBotSessionsInput
  }

  export type BotSessionUncheckedCreateWithoutTraineeInput = {
    id?: string
    followupEventId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionCreateOrConnectWithoutTraineeInput = {
    where: BotSessionWhereUniqueInput
    create: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput>
  }

  export type BotSessionCreateManyTraineeInputEnvelope = {
    data: BotSessionCreateManyTraineeInput | BotSessionCreateManyTraineeInput[]
    skipDuplicates?: boolean
  }

  export type EmploymentClaimCreateWithoutTraineeInput = {
    id?: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    followupEvent: FollowupEventCreateNestedOneWithoutEmploymentClaimsInput
    verificationRequests?: VerificationRequestCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUncheckedCreateWithoutTraineeInput = {
    id?: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    verificationRequests?: VerificationRequestUncheckedCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimCreateOrConnectWithoutTraineeInput = {
    where: EmploymentClaimWhereUniqueInput
    create: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput>
  }

  export type EmploymentClaimCreateManyTraineeInputEnvelope = {
    data: EmploymentClaimCreateManyTraineeInput | EmploymentClaimCreateManyTraineeInput[]
    skipDuplicates?: boolean
  }

  export type OutcomeEventCreateWithoutTraineeInput = {
    id?: string
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
    employmentClaim?: EmploymentClaimCreateNestedOneWithoutOutcomeEventsInput
  }

  export type OutcomeEventUncheckedCreateWithoutTraineeInput = {
    id?: string
    employmentClaimId?: string | null
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type OutcomeEventCreateOrConnectWithoutTraineeInput = {
    where: OutcomeEventWhereUniqueInput
    create: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput>
  }

  export type OutcomeEventCreateManyTraineeInputEnvelope = {
    data: OutcomeEventCreateManyTraineeInput | OutcomeEventCreateManyTraineeInput[]
    skipDuplicates?: boolean
  }

  export type EnrolmentUpsertWithWhereUniqueWithoutTraineeInput = {
    where: EnrolmentWhereUniqueInput
    update: XOR<EnrolmentUpdateWithoutTraineeInput, EnrolmentUncheckedUpdateWithoutTraineeInput>
    create: XOR<EnrolmentCreateWithoutTraineeInput, EnrolmentUncheckedCreateWithoutTraineeInput>
  }

  export type EnrolmentUpdateWithWhereUniqueWithoutTraineeInput = {
    where: EnrolmentWhereUniqueInput
    data: XOR<EnrolmentUpdateWithoutTraineeInput, EnrolmentUncheckedUpdateWithoutTraineeInput>
  }

  export type EnrolmentUpdateManyWithWhereWithoutTraineeInput = {
    where: EnrolmentScalarWhereInput
    data: XOR<EnrolmentUpdateManyMutationInput, EnrolmentUncheckedUpdateManyWithoutTraineeInput>
  }

  export type FollowupEventUpsertWithWhereUniqueWithoutTraineeInput = {
    where: FollowupEventWhereUniqueInput
    update: XOR<FollowupEventUpdateWithoutTraineeInput, FollowupEventUncheckedUpdateWithoutTraineeInput>
    create: XOR<FollowupEventCreateWithoutTraineeInput, FollowupEventUncheckedCreateWithoutTraineeInput>
  }

  export type FollowupEventUpdateWithWhereUniqueWithoutTraineeInput = {
    where: FollowupEventWhereUniqueInput
    data: XOR<FollowupEventUpdateWithoutTraineeInput, FollowupEventUncheckedUpdateWithoutTraineeInput>
  }

  export type FollowupEventUpdateManyWithWhereWithoutTraineeInput = {
    where: FollowupEventScalarWhereInput
    data: XOR<FollowupEventUpdateManyMutationInput, FollowupEventUncheckedUpdateManyWithoutTraineeInput>
  }

  export type BotSessionUpsertWithWhereUniqueWithoutTraineeInput = {
    where: BotSessionWhereUniqueInput
    update: XOR<BotSessionUpdateWithoutTraineeInput, BotSessionUncheckedUpdateWithoutTraineeInput>
    create: XOR<BotSessionCreateWithoutTraineeInput, BotSessionUncheckedCreateWithoutTraineeInput>
  }

  export type BotSessionUpdateWithWhereUniqueWithoutTraineeInput = {
    where: BotSessionWhereUniqueInput
    data: XOR<BotSessionUpdateWithoutTraineeInput, BotSessionUncheckedUpdateWithoutTraineeInput>
  }

  export type BotSessionUpdateManyWithWhereWithoutTraineeInput = {
    where: BotSessionScalarWhereInput
    data: XOR<BotSessionUpdateManyMutationInput, BotSessionUncheckedUpdateManyWithoutTraineeInput>
  }

  export type BotSessionScalarWhereInput = {
    AND?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
    OR?: BotSessionScalarWhereInput[]
    NOT?: BotSessionScalarWhereInput | BotSessionScalarWhereInput[]
    id?: StringFilter<"BotSession"> | string
    traineeId?: StringFilter<"BotSession"> | string
    followupEventId?: StringFilter<"BotSession"> | string
    state?: EnumBotSessionStateFilter<"BotSession"> | $Enums.BotSessionState
    currentQuestion?: StringNullableFilter<"BotSession"> | string | null
    collectedData?: JsonFilter<"BotSession">
    expiresAt?: DateTimeFilter<"BotSession"> | Date | string
    createdAt?: DateTimeFilter<"BotSession"> | Date | string
    updatedAt?: DateTimeFilter<"BotSession"> | Date | string
  }

  export type EmploymentClaimUpsertWithWhereUniqueWithoutTraineeInput = {
    where: EmploymentClaimWhereUniqueInput
    update: XOR<EmploymentClaimUpdateWithoutTraineeInput, EmploymentClaimUncheckedUpdateWithoutTraineeInput>
    create: XOR<EmploymentClaimCreateWithoutTraineeInput, EmploymentClaimUncheckedCreateWithoutTraineeInput>
  }

  export type EmploymentClaimUpdateWithWhereUniqueWithoutTraineeInput = {
    where: EmploymentClaimWhereUniqueInput
    data: XOR<EmploymentClaimUpdateWithoutTraineeInput, EmploymentClaimUncheckedUpdateWithoutTraineeInput>
  }

  export type EmploymentClaimUpdateManyWithWhereWithoutTraineeInput = {
    where: EmploymentClaimScalarWhereInput
    data: XOR<EmploymentClaimUpdateManyMutationInput, EmploymentClaimUncheckedUpdateManyWithoutTraineeInput>
  }

  export type EmploymentClaimScalarWhereInput = {
    AND?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
    OR?: EmploymentClaimScalarWhereInput[]
    NOT?: EmploymentClaimScalarWhereInput | EmploymentClaimScalarWhereInput[]
    id?: StringFilter<"EmploymentClaim"> | string
    traineeId?: StringFilter<"EmploymentClaim"> | string
    followupEventId?: StringFilter<"EmploymentClaim"> | string
    employerName?: StringNullableFilter<"EmploymentClaim"> | string | null
    role?: StringNullableFilter<"EmploymentClaim"> | string | null
    salaryBand?: EnumSalaryBandNullableFilter<"EmploymentClaim"> | $Enums.SalaryBand | null
    nonPlacementReason?: EnumNonPlacementReasonNullableFilter<"EmploymentClaim"> | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFilter<"EmploymentClaim"> | $Enums.VerificationStatus
    evidenceLevel?: IntFilter<"EmploymentClaim"> | number
    createdAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
    updatedAt?: DateTimeFilter<"EmploymentClaim"> | Date | string
  }

  export type OutcomeEventUpsertWithWhereUniqueWithoutTraineeInput = {
    where: OutcomeEventWhereUniqueInput
    update: XOR<OutcomeEventUpdateWithoutTraineeInput, OutcomeEventUncheckedUpdateWithoutTraineeInput>
    create: XOR<OutcomeEventCreateWithoutTraineeInput, OutcomeEventUncheckedCreateWithoutTraineeInput>
  }

  export type OutcomeEventUpdateWithWhereUniqueWithoutTraineeInput = {
    where: OutcomeEventWhereUniqueInput
    data: XOR<OutcomeEventUpdateWithoutTraineeInput, OutcomeEventUncheckedUpdateWithoutTraineeInput>
  }

  export type OutcomeEventUpdateManyWithWhereWithoutTraineeInput = {
    where: OutcomeEventScalarWhereInput
    data: XOR<OutcomeEventUpdateManyMutationInput, OutcomeEventUncheckedUpdateManyWithoutTraineeInput>
  }

  export type OutcomeEventScalarWhereInput = {
    AND?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
    OR?: OutcomeEventScalarWhereInput[]
    NOT?: OutcomeEventScalarWhereInput | OutcomeEventScalarWhereInput[]
    id?: StringFilter<"OutcomeEvent"> | string
    traineeId?: StringFilter<"OutcomeEvent"> | string
    employmentClaimId?: StringNullableFilter<"OutcomeEvent"> | string | null
    checkpointDays?: IntFilter<"OutcomeEvent"> | number
    outcomeStatus?: EnumOutcomeStatusFilter<"OutcomeEvent"> | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFilter<"OutcomeEvent"> | $Enums.VerificationStatus
    source?: StringFilter<"OutcomeEvent"> | string
    evidenceLevel?: IntFilter<"OutcomeEvent"> | number
    createdAt?: DateTimeFilter<"OutcomeEvent"> | Date | string
  }

  export type TraineeCreateWithoutEnrolmentsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    followupEvents?: FollowupEventCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateWithoutEnrolmentsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeCreateOrConnectWithoutEnrolmentsInput = {
    where: TraineeWhereUniqueInput
    create: XOR<TraineeCreateWithoutEnrolmentsInput, TraineeUncheckedCreateWithoutEnrolmentsInput>
  }

  export type CohortCreateWithoutEnrolmentsInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    programme: ProgrammeCreateNestedOneWithoutCohortsInput
    followupEvents?: FollowupEventCreateNestedManyWithoutCohortInput
  }

  export type CohortUncheckedCreateWithoutEnrolmentsInput = {
    id?: string
    programmeId: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutCohortInput
  }

  export type CohortCreateOrConnectWithoutEnrolmentsInput = {
    where: CohortWhereUniqueInput
    create: XOR<CohortCreateWithoutEnrolmentsInput, CohortUncheckedCreateWithoutEnrolmentsInput>
  }

  export type TraineeUpsertWithoutEnrolmentsInput = {
    update: XOR<TraineeUpdateWithoutEnrolmentsInput, TraineeUncheckedUpdateWithoutEnrolmentsInput>
    create: XOR<TraineeCreateWithoutEnrolmentsInput, TraineeUncheckedCreateWithoutEnrolmentsInput>
    where?: TraineeWhereInput
  }

  export type TraineeUpdateToOneWithWhereWithoutEnrolmentsInput = {
    where?: TraineeWhereInput
    data: XOR<TraineeUpdateWithoutEnrolmentsInput, TraineeUncheckedUpdateWithoutEnrolmentsInput>
  }

  export type TraineeUpdateWithoutEnrolmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followupEvents?: FollowupEventUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateWithoutEnrolmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUncheckedUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type CohortUpsertWithoutEnrolmentsInput = {
    update: XOR<CohortUpdateWithoutEnrolmentsInput, CohortUncheckedUpdateWithoutEnrolmentsInput>
    create: XOR<CohortCreateWithoutEnrolmentsInput, CohortUncheckedCreateWithoutEnrolmentsInput>
    where?: CohortWhereInput
  }

  export type CohortUpdateToOneWithWhereWithoutEnrolmentsInput = {
    where?: CohortWhereInput
    data: XOR<CohortUpdateWithoutEnrolmentsInput, CohortUncheckedUpdateWithoutEnrolmentsInput>
  }

  export type CohortUpdateWithoutEnrolmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    programme?: ProgrammeUpdateOneRequiredWithoutCohortsNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutCohortNestedInput
  }

  export type CohortUncheckedUpdateWithoutEnrolmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    programmeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutCohortNestedInput
  }

  export type TraineeCreateWithoutFollowupEventsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateWithoutFollowupEventsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeCreateOrConnectWithoutFollowupEventsInput = {
    where: TraineeWhereUniqueInput
    create: XOR<TraineeCreateWithoutFollowupEventsInput, TraineeUncheckedCreateWithoutFollowupEventsInput>
  }

  export type CohortCreateWithoutFollowupEventsInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    programme: ProgrammeCreateNestedOneWithoutCohortsInput
    enrolments?: EnrolmentCreateNestedManyWithoutCohortInput
  }

  export type CohortUncheckedCreateWithoutFollowupEventsInput = {
    id?: string
    programmeId: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutCohortInput
  }

  export type CohortCreateOrConnectWithoutFollowupEventsInput = {
    where: CohortWhereUniqueInput
    create: XOR<CohortCreateWithoutFollowupEventsInput, CohortUncheckedCreateWithoutFollowupEventsInput>
  }

  export type BotSessionCreateWithoutFollowupEventInput = {
    id?: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutBotSessionsInput
  }

  export type BotSessionUncheckedCreateWithoutFollowupEventInput = {
    id?: string
    traineeId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionCreateOrConnectWithoutFollowupEventInput = {
    where: BotSessionWhereUniqueInput
    create: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput>
  }

  export type BotSessionCreateManyFollowupEventInputEnvelope = {
    data: BotSessionCreateManyFollowupEventInput | BotSessionCreateManyFollowupEventInput[]
    skipDuplicates?: boolean
  }

  export type EmploymentClaimCreateWithoutFollowupEventInput = {
    id?: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEmploymentClaimsInput
    verificationRequests?: VerificationRequestCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUncheckedCreateWithoutFollowupEventInput = {
    id?: string
    traineeId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    verificationRequests?: VerificationRequestUncheckedCreateNestedManyWithoutEmploymentClaimInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimCreateOrConnectWithoutFollowupEventInput = {
    where: EmploymentClaimWhereUniqueInput
    create: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput>
  }

  export type EmploymentClaimCreateManyFollowupEventInputEnvelope = {
    data: EmploymentClaimCreateManyFollowupEventInput | EmploymentClaimCreateManyFollowupEventInput[]
    skipDuplicates?: boolean
  }

  export type TraineeUpsertWithoutFollowupEventsInput = {
    update: XOR<TraineeUpdateWithoutFollowupEventsInput, TraineeUncheckedUpdateWithoutFollowupEventsInput>
    create: XOR<TraineeCreateWithoutFollowupEventsInput, TraineeUncheckedCreateWithoutFollowupEventsInput>
    where?: TraineeWhereInput
  }

  export type TraineeUpdateToOneWithWhereWithoutFollowupEventsInput = {
    where?: TraineeWhereInput
    data: XOR<TraineeUpdateWithoutFollowupEventsInput, TraineeUncheckedUpdateWithoutFollowupEventsInput>
  }

  export type TraineeUpdateWithoutFollowupEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateWithoutFollowupEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUncheckedUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type CohortUpsertWithoutFollowupEventsInput = {
    update: XOR<CohortUpdateWithoutFollowupEventsInput, CohortUncheckedUpdateWithoutFollowupEventsInput>
    create: XOR<CohortCreateWithoutFollowupEventsInput, CohortUncheckedCreateWithoutFollowupEventsInput>
    where?: CohortWhereInput
  }

  export type CohortUpdateToOneWithWhereWithoutFollowupEventsInput = {
    where?: CohortWhereInput
    data: XOR<CohortUpdateWithoutFollowupEventsInput, CohortUncheckedUpdateWithoutFollowupEventsInput>
  }

  export type CohortUpdateWithoutFollowupEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    programme?: ProgrammeUpdateOneRequiredWithoutCohortsNestedInput
    enrolments?: EnrolmentUpdateManyWithoutCohortNestedInput
  }

  export type CohortUncheckedUpdateWithoutFollowupEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    programmeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutCohortNestedInput
  }

  export type BotSessionUpsertWithWhereUniqueWithoutFollowupEventInput = {
    where: BotSessionWhereUniqueInput
    update: XOR<BotSessionUpdateWithoutFollowupEventInput, BotSessionUncheckedUpdateWithoutFollowupEventInput>
    create: XOR<BotSessionCreateWithoutFollowupEventInput, BotSessionUncheckedCreateWithoutFollowupEventInput>
  }

  export type BotSessionUpdateWithWhereUniqueWithoutFollowupEventInput = {
    where: BotSessionWhereUniqueInput
    data: XOR<BotSessionUpdateWithoutFollowupEventInput, BotSessionUncheckedUpdateWithoutFollowupEventInput>
  }

  export type BotSessionUpdateManyWithWhereWithoutFollowupEventInput = {
    where: BotSessionScalarWhereInput
    data: XOR<BotSessionUpdateManyMutationInput, BotSessionUncheckedUpdateManyWithoutFollowupEventInput>
  }

  export type EmploymentClaimUpsertWithWhereUniqueWithoutFollowupEventInput = {
    where: EmploymentClaimWhereUniqueInput
    update: XOR<EmploymentClaimUpdateWithoutFollowupEventInput, EmploymentClaimUncheckedUpdateWithoutFollowupEventInput>
    create: XOR<EmploymentClaimCreateWithoutFollowupEventInput, EmploymentClaimUncheckedCreateWithoutFollowupEventInput>
  }

  export type EmploymentClaimUpdateWithWhereUniqueWithoutFollowupEventInput = {
    where: EmploymentClaimWhereUniqueInput
    data: XOR<EmploymentClaimUpdateWithoutFollowupEventInput, EmploymentClaimUncheckedUpdateWithoutFollowupEventInput>
  }

  export type EmploymentClaimUpdateManyWithWhereWithoutFollowupEventInput = {
    where: EmploymentClaimScalarWhereInput
    data: XOR<EmploymentClaimUpdateManyMutationInput, EmploymentClaimUncheckedUpdateManyWithoutFollowupEventInput>
  }

  export type TraineeCreateWithoutBotSessionsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateWithoutBotSessionsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeCreateOrConnectWithoutBotSessionsInput = {
    where: TraineeWhereUniqueInput
    create: XOR<TraineeCreateWithoutBotSessionsInput, TraineeUncheckedCreateWithoutBotSessionsInput>
  }

  export type FollowupEventCreateWithoutBotSessionsInput = {
    id?: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutFollowupEventsInput
    cohort: CohortCreateNestedOneWithoutFollowupEventsInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUncheckedCreateWithoutBotSessionsInput = {
    id?: string
    traineeId: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventCreateOrConnectWithoutBotSessionsInput = {
    where: FollowupEventWhereUniqueInput
    create: XOR<FollowupEventCreateWithoutBotSessionsInput, FollowupEventUncheckedCreateWithoutBotSessionsInput>
  }

  export type TraineeUpsertWithoutBotSessionsInput = {
    update: XOR<TraineeUpdateWithoutBotSessionsInput, TraineeUncheckedUpdateWithoutBotSessionsInput>
    create: XOR<TraineeCreateWithoutBotSessionsInput, TraineeUncheckedCreateWithoutBotSessionsInput>
    where?: TraineeWhereInput
  }

  export type TraineeUpdateToOneWithWhereWithoutBotSessionsInput = {
    where?: TraineeWhereInput
    data: XOR<TraineeUpdateWithoutBotSessionsInput, TraineeUncheckedUpdateWithoutBotSessionsInput>
  }

  export type TraineeUpdateWithoutBotSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateWithoutBotSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type FollowupEventUpsertWithoutBotSessionsInput = {
    update: XOR<FollowupEventUpdateWithoutBotSessionsInput, FollowupEventUncheckedUpdateWithoutBotSessionsInput>
    create: XOR<FollowupEventCreateWithoutBotSessionsInput, FollowupEventUncheckedCreateWithoutBotSessionsInput>
    where?: FollowupEventWhereInput
  }

  export type FollowupEventUpdateToOneWithWhereWithoutBotSessionsInput = {
    where?: FollowupEventWhereInput
    data: XOR<FollowupEventUpdateWithoutBotSessionsInput, FollowupEventUncheckedUpdateWithoutBotSessionsInput>
  }

  export type FollowupEventUpdateWithoutBotSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutFollowupEventsNestedInput
    cohort?: CohortUpdateOneRequiredWithoutFollowupEventsNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateWithoutBotSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutFollowupEventNestedInput
  }

  export type TraineeCreateWithoutEmploymentClaimsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateWithoutEmploymentClaimsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutTraineeInput
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeCreateOrConnectWithoutEmploymentClaimsInput = {
    where: TraineeWhereUniqueInput
    create: XOR<TraineeCreateWithoutEmploymentClaimsInput, TraineeUncheckedCreateWithoutEmploymentClaimsInput>
  }

  export type FollowupEventCreateWithoutEmploymentClaimsInput = {
    id?: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutFollowupEventsInput
    cohort: CohortCreateNestedOneWithoutFollowupEventsInput
    botSessions?: BotSessionCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventUncheckedCreateWithoutEmploymentClaimsInput = {
    id?: string
    traineeId: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutFollowupEventInput
  }

  export type FollowupEventCreateOrConnectWithoutEmploymentClaimsInput = {
    where: FollowupEventWhereUniqueInput
    create: XOR<FollowupEventCreateWithoutEmploymentClaimsInput, FollowupEventUncheckedCreateWithoutEmploymentClaimsInput>
  }

  export type VerificationRequestCreateWithoutEmploymentClaimInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationRequestUncheckedCreateWithoutEmploymentClaimInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationRequestCreateOrConnectWithoutEmploymentClaimInput = {
    where: VerificationRequestWhereUniqueInput
    create: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput>
  }

  export type VerificationRequestCreateManyEmploymentClaimInputEnvelope = {
    data: VerificationRequestCreateManyEmploymentClaimInput | VerificationRequestCreateManyEmploymentClaimInput[]
    skipDuplicates?: boolean
  }

  export type OutcomeEventCreateWithoutEmploymentClaimInput = {
    id?: string
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutOutcomeEventsInput
  }

  export type OutcomeEventUncheckedCreateWithoutEmploymentClaimInput = {
    id?: string
    traineeId: string
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type OutcomeEventCreateOrConnectWithoutEmploymentClaimInput = {
    where: OutcomeEventWhereUniqueInput
    create: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput>
  }

  export type OutcomeEventCreateManyEmploymentClaimInputEnvelope = {
    data: OutcomeEventCreateManyEmploymentClaimInput | OutcomeEventCreateManyEmploymentClaimInput[]
    skipDuplicates?: boolean
  }

  export type TraineeUpsertWithoutEmploymentClaimsInput = {
    update: XOR<TraineeUpdateWithoutEmploymentClaimsInput, TraineeUncheckedUpdateWithoutEmploymentClaimsInput>
    create: XOR<TraineeCreateWithoutEmploymentClaimsInput, TraineeUncheckedCreateWithoutEmploymentClaimsInput>
    where?: TraineeWhereInput
  }

  export type TraineeUpdateToOneWithWhereWithoutEmploymentClaimsInput = {
    where?: TraineeWhereInput
    data: XOR<TraineeUpdateWithoutEmploymentClaimsInput, TraineeUncheckedUpdateWithoutEmploymentClaimsInput>
  }

  export type TraineeUpdateWithoutEmploymentClaimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateWithoutEmploymentClaimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUncheckedUpdateManyWithoutTraineeNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type FollowupEventUpsertWithoutEmploymentClaimsInput = {
    update: XOR<FollowupEventUpdateWithoutEmploymentClaimsInput, FollowupEventUncheckedUpdateWithoutEmploymentClaimsInput>
    create: XOR<FollowupEventCreateWithoutEmploymentClaimsInput, FollowupEventUncheckedCreateWithoutEmploymentClaimsInput>
    where?: FollowupEventWhereInput
  }

  export type FollowupEventUpdateToOneWithWhereWithoutEmploymentClaimsInput = {
    where?: FollowupEventWhereInput
    data: XOR<FollowupEventUpdateWithoutEmploymentClaimsInput, FollowupEventUncheckedUpdateWithoutEmploymentClaimsInput>
  }

  export type FollowupEventUpdateWithoutEmploymentClaimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutFollowupEventsNestedInput
    cohort?: CohortUpdateOneRequiredWithoutFollowupEventsNestedInput
    botSessions?: BotSessionUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateWithoutEmploymentClaimsInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    botSessions?: BotSessionUncheckedUpdateManyWithoutFollowupEventNestedInput
  }

  export type VerificationRequestUpsertWithWhereUniqueWithoutEmploymentClaimInput = {
    where: VerificationRequestWhereUniqueInput
    update: XOR<VerificationRequestUpdateWithoutEmploymentClaimInput, VerificationRequestUncheckedUpdateWithoutEmploymentClaimInput>
    create: XOR<VerificationRequestCreateWithoutEmploymentClaimInput, VerificationRequestUncheckedCreateWithoutEmploymentClaimInput>
  }

  export type VerificationRequestUpdateWithWhereUniqueWithoutEmploymentClaimInput = {
    where: VerificationRequestWhereUniqueInput
    data: XOR<VerificationRequestUpdateWithoutEmploymentClaimInput, VerificationRequestUncheckedUpdateWithoutEmploymentClaimInput>
  }

  export type VerificationRequestUpdateManyWithWhereWithoutEmploymentClaimInput = {
    where: VerificationRequestScalarWhereInput
    data: XOR<VerificationRequestUpdateManyMutationInput, VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimInput>
  }

  export type VerificationRequestScalarWhereInput = {
    AND?: VerificationRequestScalarWhereInput | VerificationRequestScalarWhereInput[]
    OR?: VerificationRequestScalarWhereInput[]
    NOT?: VerificationRequestScalarWhereInput | VerificationRequestScalarWhereInput[]
    id?: StringFilter<"VerificationRequest"> | string
    employmentClaimId?: StringFilter<"VerificationRequest"> | string
    tokenHash?: StringFilter<"VerificationRequest"> | string
    expiresAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    usedAt?: DateTimeNullableFilter<"VerificationRequest"> | Date | string | null
    action?: StringNullableFilter<"VerificationRequest"> | string | null
    rejectionReason?: StringNullableFilter<"VerificationRequest"> | string | null
    createdAt?: DateTimeFilter<"VerificationRequest"> | Date | string
    updatedAt?: DateTimeFilter<"VerificationRequest"> | Date | string
  }

  export type OutcomeEventUpsertWithWhereUniqueWithoutEmploymentClaimInput = {
    where: OutcomeEventWhereUniqueInput
    update: XOR<OutcomeEventUpdateWithoutEmploymentClaimInput, OutcomeEventUncheckedUpdateWithoutEmploymentClaimInput>
    create: XOR<OutcomeEventCreateWithoutEmploymentClaimInput, OutcomeEventUncheckedCreateWithoutEmploymentClaimInput>
  }

  export type OutcomeEventUpdateWithWhereUniqueWithoutEmploymentClaimInput = {
    where: OutcomeEventWhereUniqueInput
    data: XOR<OutcomeEventUpdateWithoutEmploymentClaimInput, OutcomeEventUncheckedUpdateWithoutEmploymentClaimInput>
  }

  export type OutcomeEventUpdateManyWithWhereWithoutEmploymentClaimInput = {
    where: OutcomeEventScalarWhereInput
    data: XOR<OutcomeEventUpdateManyMutationInput, OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimInput>
  }

  export type TraineeCreateWithoutOutcomeEventsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimCreateNestedManyWithoutTraineeInput
  }

  export type TraineeUncheckedCreateWithoutOutcomeEventsInput = {
    id?: string
    publicId?: string
    fullName: string
    phoneE164: string
    email?: string | null
    district: string
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    enrolments?: EnrolmentUncheckedCreateNestedManyWithoutTraineeInput
    followupEvents?: FollowupEventUncheckedCreateNestedManyWithoutTraineeInput
    botSessions?: BotSessionUncheckedCreateNestedManyWithoutTraineeInput
    employmentClaims?: EmploymentClaimUncheckedCreateNestedManyWithoutTraineeInput
  }

  export type TraineeCreateOrConnectWithoutOutcomeEventsInput = {
    where: TraineeWhereUniqueInput
    create: XOR<TraineeCreateWithoutOutcomeEventsInput, TraineeUncheckedCreateWithoutOutcomeEventsInput>
  }

  export type EmploymentClaimCreateWithoutOutcomeEventsInput = {
    id?: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEmploymentClaimsInput
    followupEvent: FollowupEventCreateNestedOneWithoutEmploymentClaimsInput
    verificationRequests?: VerificationRequestCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUncheckedCreateWithoutOutcomeEventsInput = {
    id?: string
    traineeId: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    verificationRequests?: VerificationRequestUncheckedCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimCreateOrConnectWithoutOutcomeEventsInput = {
    where: EmploymentClaimWhereUniqueInput
    create: XOR<EmploymentClaimCreateWithoutOutcomeEventsInput, EmploymentClaimUncheckedCreateWithoutOutcomeEventsInput>
  }

  export type TraineeUpsertWithoutOutcomeEventsInput = {
    update: XOR<TraineeUpdateWithoutOutcomeEventsInput, TraineeUncheckedUpdateWithoutOutcomeEventsInput>
    create: XOR<TraineeCreateWithoutOutcomeEventsInput, TraineeUncheckedCreateWithoutOutcomeEventsInput>
    where?: TraineeWhereInput
  }

  export type TraineeUpdateToOneWithWhereWithoutOutcomeEventsInput = {
    where?: TraineeWhereInput
    data: XOR<TraineeUpdateWithoutOutcomeEventsInput, TraineeUncheckedUpdateWithoutOutcomeEventsInput>
  }

  export type TraineeUpdateWithoutOutcomeEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutTraineeNestedInput
  }

  export type TraineeUncheckedUpdateWithoutOutcomeEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    publicId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phoneE164?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    district?: StringFieldUpdateOperationsInput | string
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutTraineeNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutTraineeNestedInput
    botSessions?: BotSessionUncheckedUpdateManyWithoutTraineeNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutTraineeNestedInput
  }

  export type EmploymentClaimUpsertWithoutOutcomeEventsInput = {
    update: XOR<EmploymentClaimUpdateWithoutOutcomeEventsInput, EmploymentClaimUncheckedUpdateWithoutOutcomeEventsInput>
    create: XOR<EmploymentClaimCreateWithoutOutcomeEventsInput, EmploymentClaimUncheckedCreateWithoutOutcomeEventsInput>
    where?: EmploymentClaimWhereInput
  }

  export type EmploymentClaimUpdateToOneWithWhereWithoutOutcomeEventsInput = {
    where?: EmploymentClaimWhereInput
    data: XOR<EmploymentClaimUpdateWithoutOutcomeEventsInput, EmploymentClaimUncheckedUpdateWithoutOutcomeEventsInput>
  }

  export type EmploymentClaimUpdateWithoutOutcomeEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    followupEvent?: FollowupEventUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    verificationRequests?: VerificationRequestUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateWithoutOutcomeEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verificationRequests?: VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimCreateWithoutVerificationRequestsInput = {
    id?: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    trainee: TraineeCreateNestedOneWithoutEmploymentClaimsInput
    followupEvent: FollowupEventCreateNestedOneWithoutEmploymentClaimsInput
    outcomeEvents?: OutcomeEventCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimUncheckedCreateWithoutVerificationRequestsInput = {
    id?: string
    traineeId: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    outcomeEvents?: OutcomeEventUncheckedCreateNestedManyWithoutEmploymentClaimInput
  }

  export type EmploymentClaimCreateOrConnectWithoutVerificationRequestsInput = {
    where: EmploymentClaimWhereUniqueInput
    create: XOR<EmploymentClaimCreateWithoutVerificationRequestsInput, EmploymentClaimUncheckedCreateWithoutVerificationRequestsInput>
  }

  export type EmploymentClaimUpsertWithoutVerificationRequestsInput = {
    update: XOR<EmploymentClaimUpdateWithoutVerificationRequestsInput, EmploymentClaimUncheckedUpdateWithoutVerificationRequestsInput>
    create: XOR<EmploymentClaimCreateWithoutVerificationRequestsInput, EmploymentClaimUncheckedCreateWithoutVerificationRequestsInput>
    where?: EmploymentClaimWhereInput
  }

  export type EmploymentClaimUpdateToOneWithWhereWithoutVerificationRequestsInput = {
    where?: EmploymentClaimWhereInput
    data: XOR<EmploymentClaimUpdateWithoutVerificationRequestsInput, EmploymentClaimUncheckedUpdateWithoutVerificationRequestsInput>
  }

  export type EmploymentClaimUpdateWithoutVerificationRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    followupEvent?: FollowupEventUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateWithoutVerificationRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type CohortCreateManyProgrammeInput = {
    id?: string
    name: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CohortUpdateWithoutProgrammeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUpdateManyWithoutCohortNestedInput
    followupEvents?: FollowupEventUpdateManyWithoutCohortNestedInput
  }

  export type CohortUncheckedUpdateWithoutProgrammeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    enrolments?: EnrolmentUncheckedUpdateManyWithoutCohortNestedInput
    followupEvents?: FollowupEventUncheckedUpdateManyWithoutCohortNestedInput
  }

  export type CohortUncheckedUpdateManyWithoutProgrammeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentCreateManyCohortInput = {
    id?: string
    traineeId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FollowupEventCreateManyCohortInput = {
    id?: string
    traineeId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EnrolmentUpdateWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEnrolmentsNestedInput
  }

  export type EnrolmentUncheckedUpdateWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentUncheckedUpdateManyWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowupEventUpdateWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutFollowupEventsNestedInput
    botSessions?: BotSessionUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    botSessions?: BotSessionUncheckedUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateManyWithoutCohortInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentCreateManyTraineeInput = {
    id?: string
    cohortId: string
    certificationDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FollowupEventCreateManyTraineeInput = {
    id?: string
    cohortId: string
    checkpointDays: number
    status?: $Enums.FollowupStatus
    channel?: $Enums.Channel
    sentAt?: Date | string | null
    respondedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionCreateManyTraineeInput = {
    id?: string
    followupEventId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmploymentClaimCreateManyTraineeInput = {
    id?: string
    followupEventId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutcomeEventCreateManyTraineeInput = {
    id?: string
    employmentClaimId?: string | null
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type EnrolmentUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cohort?: CohortUpdateOneRequiredWithoutEnrolmentsNestedInput
  }

  export type EnrolmentUncheckedUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnrolmentUncheckedUpdateManyWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    certificationDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowupEventUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cohort?: CohortUpdateOneRequiredWithoutFollowupEventsNestedInput
    botSessions?: BotSessionUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    botSessions?: BotSessionUncheckedUpdateManyWithoutFollowupEventNestedInput
    employmentClaims?: EmploymentClaimUncheckedUpdateManyWithoutFollowupEventNestedInput
  }

  export type FollowupEventUncheckedUpdateManyWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    cohortId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    status?: EnumFollowupStatusFieldUpdateOperationsInput | $Enums.FollowupStatus
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    respondedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followupEvent?: FollowupEventUpdateOneRequiredWithoutBotSessionsNestedInput
  }

  export type BotSessionUncheckedUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionUncheckedUpdateManyWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmploymentClaimUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    followupEvent?: FollowupEventUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    verificationRequests?: VerificationRequestUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verificationRequests?: VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateManyWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    followupEventId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employmentClaim?: EmploymentClaimUpdateOneWithoutOutcomeEventsNestedInput
  }

  export type OutcomeEventUncheckedUpdateWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: NullableStringFieldUpdateOperationsInput | string | null
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventUncheckedUpdateManyWithoutTraineeInput = {
    id?: StringFieldUpdateOperationsInput | string
    employmentClaimId?: NullableStringFieldUpdateOperationsInput | string | null
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionCreateManyFollowupEventInput = {
    id?: string
    traineeId: string
    state?: $Enums.BotSessionState
    currentQuestion?: string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmploymentClaimCreateManyFollowupEventInput = {
    id?: string
    traineeId: string
    employerName?: string | null
    role?: string | null
    salaryBand?: $Enums.SalaryBand | null
    nonPlacementReason?: $Enums.NonPlacementReason | null
    verificationStatus?: $Enums.VerificationStatus
    evidenceLevel?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BotSessionUpdateWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutBotSessionsNestedInput
  }

  export type BotSessionUncheckedUpdateWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotSessionUncheckedUpdateManyWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    state?: EnumBotSessionStateFieldUpdateOperationsInput | $Enums.BotSessionState
    currentQuestion?: NullableStringFieldUpdateOperationsInput | string | null
    collectedData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmploymentClaimUpdateWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutEmploymentClaimsNestedInput
    verificationRequests?: VerificationRequestUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verificationRequests?: VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimNestedInput
    outcomeEvents?: OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimNestedInput
  }

  export type EmploymentClaimUncheckedUpdateManyWithoutFollowupEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    employerName?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    salaryBand?: NullableEnumSalaryBandFieldUpdateOperationsInput | $Enums.SalaryBand | null
    nonPlacementReason?: NullableEnumNonPlacementReasonFieldUpdateOperationsInput | $Enums.NonPlacementReason | null
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestCreateManyEmploymentClaimInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    action?: string | null
    rejectionReason?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutcomeEventCreateManyEmploymentClaimInput = {
    id?: string
    traineeId: string
    checkpointDays: number
    outcomeStatus: $Enums.OutcomeStatus
    verificationStatus: $Enums.VerificationStatus
    source: string
    evidenceLevel: number
    createdAt?: Date | string
  }

  export type VerificationRequestUpdateWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestUncheckedUpdateWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationRequestUncheckedUpdateManyWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    action?: NullableStringFieldUpdateOperationsInput | string | null
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventUpdateWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trainee?: TraineeUpdateOneRequiredWithoutOutcomeEventsNestedInput
  }

  export type OutcomeEventUncheckedUpdateWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeEventUncheckedUpdateManyWithoutEmploymentClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    traineeId?: StringFieldUpdateOperationsInput | string
    checkpointDays?: IntFieldUpdateOperationsInput | number
    outcomeStatus?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    verificationStatus?: EnumVerificationStatusFieldUpdateOperationsInput | $Enums.VerificationStatus
    source?: StringFieldUpdateOperationsInput | string
    evidenceLevel?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
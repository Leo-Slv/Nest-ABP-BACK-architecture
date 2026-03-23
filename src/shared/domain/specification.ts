export interface Specification<T> {
  isSatisfiedBy(candidate: T): Promise<boolean> | boolean;
}

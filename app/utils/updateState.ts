export function updateState<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  key: keyof T,
  value: T[keyof T]
) {
  setState((prev) => ({ ...prev, [key]: value }));
}
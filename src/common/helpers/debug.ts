export function dd(...args: any[]): void {
  args.forEach((arg) => console.log(arg));
  process.exit(1);
}

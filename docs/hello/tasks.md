# Implementation Plan

### 1. Add hello subcommand routing to CLI entry point
- [ ] 1.1 Add positional-arg check in `runCli` to route `hello` to HelloCommand
  - Add import for `runHello` from `./commands/hello.js`
  - Insert check at top of `runCli`: if `argv[0] === "hello"`, call `runHello(argv.slice(1), io)` and return its exit code
  - _Requirements: 3_
  - _Boundary: runCli_

### 2. Implement HelloCommand handler
- [ ] 2.1 Create `src/commands/hello.ts` with `runHello` function
  - Parse `--help`, `--name`/`-n` from argv
  - Return usage text when `--help` is present
  - Return `"Hello from spectra!"` (default) or `"Hello from spectra, {name}!"` (with name)
  - Handle empty/whitespace name fallback and missing `--name` value error
  - Use `io.log()` for output; no direct `console.log`
  - _Requirements: 1, 2, 3_
  - _Boundary: HelloCommand_

### 3. Write unit tests
- [ ] 3.1 Create tests for `runHello` function
  - Test default greeting output
  - Test personalized greeting with `--name`
  - Test help flag output
  - Test edge cases: empty name, missing value, unknown flag
  - _Requirements: 4_
  - _Boundary: tests_

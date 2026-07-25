# Requirements Document

## Introduction

The hello feature provides a simple greeting command for the spectra CLI tool. It serves as the canonical entry point for new users, offering a friendly message with optional customization.

## Requirements

### Requirement 1: Basic Greeting
<!-- @spec 1 -->
**Objective:** As a user, I want to run a `spectra hello` command, so that I receive a friendly greeting message.

#### Acceptance Criteria
1. When the user runs `spectra hello`, the system shall print a greeting message to stdout
2. The greeting message shall include the text "Hello from spectra!"
3. The system shall print the greeting to stdout only (not stderr)
4. The system shall exit with code 0 after printing the greeting

### Requirement 2: Personalized Greeting
<!-- @spec 2 -->
**Objective:** As a user, I want to optionally provide my name, so that the greeting is personalized.

#### Acceptance Criteria
1. When the user runs `spectra hello --name <name>`, the system shall include the provided name in the greeting
2. When the user runs `spectra hello -n <name>`, the system shall treat `-n` as equivalent to `--name`
3. When `--name` is provided, the greeting format shall be "Hello from spectra, {name}!"
4. If `--name` is empty or whitespace-only, the system shall fall back to the default greeting without a name

### Requirement 3: Help and Usage
<!-- @spec 3 -->
**Objective:** As a user, I want to discover how to use the hello command, so that I can use it effectively.

#### Acceptance Criteria
1. When the user runs `spectra hello --help`, the system shall display usage information including all available options
2. The help output shall include the command description, `--name` option, and `--help` flag
3. The `--help` flag shall take precedence over all other options when present

### Requirement 4: Development and Testing
<!-- @spec 4 -->
**Objective:** As a developer, I want the hello command to be testable, so that I can verify correctness.

#### Acceptance Criteria
1. The system shall have automated tests covering all acceptance criteria in Requirements 1-3
2. The system shall not produce side effects (no file writes, network calls, or state changes)
3. When output is piped, the system shall detect non-TTY and omit any color or formatting escape codes

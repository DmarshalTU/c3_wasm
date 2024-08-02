# Web Application with TypeScript, WebAssembly, and C3

## Project Overview

This project is a web application built using TypeScript, WebAssembly (WASM), and the C3 programming language. It is designed to efficiently manage groups, clients, and their associated traffic data, leveraging WebAssembly for performance-critical tasks.

## Getting Started

### Prerequisites

Ensure you have the following tools installed on your machine:

- [Node.js](https://nodejs.org/) and npm
- [C3 compiler](https://github.com/c3lang/c3c)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/yourproject.git
    cd yourproject
    ```

2. **Install npm dependencies:**
    ```bash
    npm install
    ```

3. **Install Task:**
    ```bash
    brew install go-task/tap/go-task

    # more instalation options on https://taskfile.dev/installation/
    ```

4. **Taskfile Configuration**

The Taskfile.yml is used to automate various build and deployment tasks.

Key Tasks
```yaml
# Build: Compiles C3 code to WebAssembly and runs npm build.
build:
  cmds:
    - c3c compile -O3 --reloc=none --target wasm32 -g0 --link-libc=no --use-stdlib=no --no-entry -o public/web web.c3
    - npm run build
  silent: true

#Start: Starts the application using npm.
start:
  cmds:
    - npm start
  silent: true

# Watch: Monitors TypeScript files for changes and recompiles them.
watch:
  cmds:
    - ./node_modules/.bin/tsc -w
  silent: true
```

5. **C3 Code**

The C3 code includes functions to generate unique identifiers and convert values to hexadecimal. These functions are optimized for WebAssembly, ensuring high performance.

## Running the Application

```bash
# Build the project:
task build

#Start the application:
task start

# Watch for TypeScript changes:
task watch

# Run build and server at once
task all

# Commit changes
task commit
```

Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License.

```bash
This `README.md` provides an overview of the project, installation instructions, descriptions of key components, and guidance on running the application. It is designed to be concise and informative for developers interested in setting up and contributing to the project.
```
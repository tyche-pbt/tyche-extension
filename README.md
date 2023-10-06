# Tyche

Tyche, named after [the Greek goddess of chance](https://en.wikipedia.org/wiki/Tyche), aims to
provide a comprehensive integrated development environment (IDE) for property-based testing
libraries like [Hypothesis](https://hypothesis.readthedocs.io/en/latest/),
[Bolero](https://docs.rs/bolero/latest/bolero/) and more. It is implemented as an extension for
[Visual Studio Code](https://code.visualstudio.com/).

The Tyche extension is currently in early alpha; we have a prototype implementation, appearing as a
[demo](https://programs.sigchi.org/uist/2023/program/session/128188) at UIST 2023.

## Motivation

Current property-based testing frameworks give insufficient feedback about the specific values that
were used to test a given program and about the distributional trends in those values. In the worst
case, this lack of visibility process may give users false confidence, encouraging them to believe
their testing was thorough when, in fact, it had critical gaps. Tyche provides an interactive
interface for understanding testing effectiveness, surfacing both "pre-testing" information about
test inputs and their distributions and "post-testing" information like code coverage.

## Current Progress

Currently Tyche has one implemented integration with Python's Hypothesis framework. The library can
be found [here](https://github.com/tyche-pbt/tyche-hypothesis).

This integration allows Tyche to run and analyze Hypothesis properties, displaying statistics about
test data if the property passes.

## Developing

### Project Structure

This project is two nested NPM projects. The outer project is the source for the whole extension.
The inner project, in the `webview-ui` directory, is a React project that runs in the extension's
Webview.

### Running in Debug Mode

When working on the webview itself, run:
```bash
npm run start:webview
```
This will allow you to connect to the webview itself via a browser and iterate quickly.

When working on the extension as a whole, run:
```bash
npm run build:webview
```
Then press `F5` to open a new Extension Development Host window.

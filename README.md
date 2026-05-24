# AI_studio-3.1-pro-preview client Local Terminal

## Project Overview
This project provides a lightweight, **Zero-Dependency** local web terminal integrated with Google AI Studio (Gemini Pro). It acts as a secure, fast, and local graphical interface for interacting with Google's generative models without relying on heavy frontend frameworks or external backend dependencies.

## Core Philosophy: Zero-Dependency Architecture
Designed for ultimate cross-platform compatibility and minimal technical debt:
- **No external libraries:** No `pip install`, No `npm install`, No Flask, No Node.js. 
- **Native Python Standard Library:** Uses built-in `http.server`, `urllib`, and `json`.
- **OS-Agnostic Portability:** Runs seamlessly across Windows 11, macOS, and modern Linux distributions (like Ubuntu 24.04) without triggering OS-level package manager conflicts (e.g., PEP 668).

## Key Features
- **Lean Context Strategy:** Built-in token optimization for efficient I/O.
- **Local Session Storage:** Conversations are persistently stored as JSON files on your local machine, ensuring absolute data privacy.
- **Environment-Based Security:** Adheres to OWASP security standards by managing API keys strictly through environment variables rather than hardcoded configuration files.
- **Multi-Modal Support:** Easily attach and parse files natively within the browser before sending data to the API.


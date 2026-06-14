# AI_studio-3.1-pro-preview client Local web interface

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
- **Context optimisation:** Only send new question with AI output history. Saving context tokens of user input .  

## COST 
-  architectural_mechanism: |
-  Gemini 3.1 Pro implements a "Context Tier" pricing model. 
     Tier 1 (≤ 200k tokens): Input $2.00 / Cache $0.20
     Tier 2 (> 200k tokens): Input $4.00 / Cache $0.40
- avoiding 200K tokens implies braking down the project in different session of not more then 200K token context .
- Deepseek has the same pricing up to 1M token but their token count is differentcompare to gemini for the same input.
    
## cost compare to deepseek . 
-  Deepseek as a higher count of toekn for the same request mainly because it count its thinking process as output which Gemini does not.
-  This Application will not retransmit in the context,  the thinking process, nor the user question quewstion or file attached prefiously.  
Even if those are catched at low cost in usual process they still use up a large portion of the contextual token with a very slight difference in efficiency. 

-  Here is a compared table where a project in DeepSeek of 1M token total context in 42 questions end up with 1M while the same input is provided to Gemnini 3.1 prevview pro but brake down in two session to avoid costly tier 2 :
-   | Step | Physical Code (Chars) | DS Context Depth | Gem Context Depth | DS Cumul Cost | Gem Cumul Cost | Architectural Status (DeepSeek vs Gemini) |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | **1** | 56,000 | 23,970 tkns | 14,511 tkns | $0.017 | $0.032 | Stable / Stable |
    | **10** | 560,000 | 239,700 tkns | 145,110 tkns | $0.219 | $0.354 | Stable / Stable |
    | **21** | 1,176,000 | 503,370 tkns | 304,731 tkns | $0.573 | $1.974 | DS Growing / 🔄 Gem Generates Transfer Summary & Resets |
    | **22** | 1,232,000 | 527,340 tkns | 15,511 tkns | $0.612 | $2.006 | DS Inflating / ✅ Gem Session 2 Starts (Summary Ingested) |
    | **30** | 1,680,000 | 719,100 tkns | 131,599 tkns | $0.949 | $2.310 | DS High VRAM / Gem Stable |
    | **40** | 2,240,000 | 958,800 tkns | 276,709 tkns | $1.465 | $3.680 | ⚠️ DS Approaching 1M Limit / Gem Stable |
    | **41** | 2,296,000 | 982,770 tkns | 291,220 tkns | $1.523 | $3.810 | ⚠️ DS Edge of Capacity / Gem Stable |
    | **42** | 2,352,000 | 1,006,740 tkns | 305,731 tkns | **$1.582** | **$3.940** | ❌ **DS FATAL 1M OOM CRASH** / ✅ **Gem Stable & Continuing** |
    

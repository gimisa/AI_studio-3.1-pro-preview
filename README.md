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
    
-  Pricing tears :
     50-step progression (20k increment up to 1M tokens), the first 10 requests exist in Tier 1. 
     The subsequent 40 requests trigger Tier 2 pricing, where costs mathematically double just as the volumetric accumulation of cached tokens reaches its steepest geometric growth.

-  mathematical_progression_update:
    tier_1_calculations_under_200k:
      requests: "Steps 1 through 10 (20k to 200k total context)"
      standard_tokens: "220,000 (Req 1: 20k + Req 2: 40k + 8 reqs * 20k)"
      cached_tokens: "880,000 (Sum of preceding prefixes for reqs 3-10)"
      standard_cost: "(220,000 / 1,000,000) * $2.00 = $0.440"
      cached_cost: "(880,000 / 1,000,000) * $0.20 = $0.176"
      tier_1_total: "$0.616"

-   tier_2_calculations_over_200k:
      requests: "Steps 11 through 50 (220k to 1,000k total context)"
      standard_tokens: "800,000 (40 reqs * 20k net-new tokens each)"
      cached_tokens: "23,600,000 (Arithmetic sum of 200k up to 980k across 40 steps)"
      standard_cost: "(800,000 / 1,000,000) * $4.00 = $3.200"
      cached_cost: "(23,600,000 / 1,000,000) * $0.40 = $9.440"
      tier_2_total: "$12.640"

    session_totals:
      total_tokens_processed: "25,500,000 tokens"
      total_estimated_input_cost: "$0.616 + $12.640 = $13.256"
    
## cost compare to deepseek . 
-  Deepseek as a higher count of toekn for the same request mainly because it count its thinking process as output which Gemini does not.
root_cause_analysis_tokenizer_mechanics:
    1_encoding_algorithms: "Models do not read letters; they read numerical tokens mapped from a specific dictionary. Gemini uses a proprietary SentencePiece/Unigram tokenizer with a massive vocabulary (often 256k+ subwords). DeepSeek uses Byte-Pair Encoding (BPE) with a different, often smaller vocabulary (e.g., 100k-128k)."
    2_fragmentation_ratio: "A larger vocabulary allows the tokenizer to map whole, complex words to a single token. A smaller vocabulary forces the tokenizer to fragment a single word into multiple sub-word tokens (e.g., 'unbelievable' might be 1 token for Gemini, but 3 tokens ['un', 'believ', 'able'] for DeepSeek). This fundamentally alters the characters-per-token ratio."
    3_invisible_system_prompts: "Web interfaces and API proxies secretly prepend massive 'System Prompts' (safety rules, tool definitions, output formats) before your actual text. If DeepSeek's host platform injects 800 tokens of invisible system instructions while Gemini's host injects only 100 tokens, the reported 'Input Tokens' will diverge massively even if your physical keystrokes were identical."

